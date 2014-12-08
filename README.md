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
remove filter rules on calmed down IP addresses after some delay.

Using `rated` a web server can locally reduce effects of incoming DDoS attacks.

### Advantages

1. `rated` is controlling system's firewall (netfilter) rather than using some 
   rate limiter included with web server. This is reducing required number of 
   TCP sockets, size of send and receive buffers as well as time for processing 
   incoming requests and compiling related error response.
2. By utilizing netfilter it is possible to prevent your server from responding 
   to attacking servers on each and every request resulting in useless outgoing 
   traffic.

### Disadvantages

1. The memory footprint of running NodeJS is anything but small.
2. This tool isn't eventually protecting a server against DDoS attacks. 

## Installation

This tool is free of external dependencies, but comes without daemonizing 
support, thus must be managed by some supervisor like Upstart, daemontools or
runit.
