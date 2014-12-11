# rated - _A Dynamic Firewall Manager_

(c) 2014, cepharum GmbH, http://cepharum.de

## License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## About

`rated` is a dedicated service tool based on NodeJS for capturing IP addresses 
observing their capture rate resulting in scripts invoked for adding filter rule 
per IP address exceeding some declared limit. In addition the tool manages to
remove previously set filter rules after some configurable delay.

This service has been developed within a few days for handling some actual DDoS
attack on a single website hosted on a virtual server. It's been improved while
under attack keeping the website available to the public nearly all the time.

> According to some current observation on using `rated` for about one hour 
> the server was blocking 110.000+ requests from 170 remote IP addresses having 
> inspected about 1200 requests kept passing initially. The system is still 
> using just 40 TCP sockets with 1.6MByte in use for TCP send/receive buffers.
    
> (After all this current observation isn't reflecting the heavier attacking
>  phases though!)

Using `rated` a web server can locally reduce effects of incoming DDoS attacks.

### Advantages

1. `rated` is controlling system's firewall (netfilter) rather than using some 
   rate limiter included with web server. This is reducing required number of 
   TCP sockets, size of send and receive buffers as well as time for processing 
   incoming requests and compiling related error response.
2. By utilizing netfilter it is possible to prevent your server from responding 
   to attacking client on each and every request resulting in useless outgoing 
   traffic.
3. `rated` is implemented in a scripting language (JavaScript) enabling skilled
   administrators to instantly react on new kinds of attacks by tweaking the
   quite clear code of `rated` accordingly.

### Disadvantages

1. The memory footprint of running NodeJS is anything but small. 
   *TODO Consider switching to less expensive implementation. (python?) */
2. This tool isn't eventually protecting a server against all kinds of DDoS 
   attacks. It's always required to keep an eye on your server and to monitor
   this service's quality in your particular situation.

## Installation

This tool is free of external dependencies, but comes without daemonizing 
support, thus must be managed by some supervisor like `Upstart`, `daemontools`
or `runit`.

*TODO: Add some installation instructions*

## Inspecting Status

### Count Blocked Packets

```
iptables -nvL INPUT | awk 'BEGIN {s=0} NR>2 {s+=(substr($1,length($1))=="K")?substr($1,1,length($1))*1024:$1} END {print s}'
```

### Amount of Blocked Traffic

```
iptables -nvL INPUT | awk 'BEGIN {s=0} NR>2 {s+=(substr($2,length($2))=="K")?substr($2,1,length($2))*1024:$2} END {print s}'
```

### Count Blocked IP Addresses

```
iptables -nL INPUT | awk 'END {print NR-2}'
```
