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

1. The memory footprint of running NodeJS is anything but small. In opposition
   to other engines NodeJS is performing very well using single thread. Its
   memory consumption isn't heavily increasing under high load. Load on CPU is
   kept little as well for using event-driven operations.
2. This tool isn't eventually protecting a server against all kinds of DDoS 
   attacks. It's always required to keep an eye on your server and to monitor
   this service's quality in your particular situation.

## Installation

This tool is free of external dependencies, but comes without daemonizing 
support, thus must be managed by some supervisor like `Upstart`, `daemontools`
or `runit`.

This tutorial has been tested under Debian Wheezy.

### NodeJS

NodeJS is required for running `rated`. In case of Debian Wheezy there is no 
immediate opportunity for installing using aptitude or apt-get. Please check
the [instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) 
provided by [Joyent](http://www.joyent.com/), the company providing NodeJS.

### rated

#### Download ZIP
 
1. Download [snapshot](https://github.com/cepharum/rated/archive/master.zip).

   ```
   cd /home/johndoe
   wget https://github.com/cepharum/rated/archive/master.zip
   ```

2. Unzip it to some folder of your choice, e.g `/home/johndoe/rated`.

   ```
   unzip master.zip
   mv rated-master rated
   ```

   This would result in script being available as `/home/johndoe/rated/bin/rated.js`.

#### Clone Repository

By cloning repository you might use the power of git to keep your installation
uptodate with upcoming snapshots.

1. Install `git`

   ```
   apt-get install git
   ```

2. Clone repository

   ```
   git clone https://github.com/cepharum/rated
   ```

   This would result in script being available as `/home/johndoe/rated/bin/rated.js`.

#### Adjust Configuration

`rated` is configured in file `/home/johndoe/rated/etc/config.js`. Check this
file for adjusting configuration of `rated`.

### Install Service Manager

`rated` is a generic script missing support for running as a daemon. This isn't
bad practice actually for monitoring services using some supervising service is
preferred e.g. for instantly restarting the monitored service in case of it's
crashing.

Debian Wheezy includes `runit` while Ubuntu is still serving `upstart`.

#### runit

1. Install `runit`

   ```
   apt-get install runit
   ```

2. Create service context

   ```
   mkdir -p /etc/sv/rated/log/main
   echo >/etc/sv/rated/run <<<EOT
   #!/bin/sh
   exec /usr/local/bin/node /home/johndoe/rated/bin/rated.js http
   EOT
   echo >/etc/sv/rated/log/run <<<EOT
   #!/bin/sh
   exec chpst -ulog svlogd -tt ./main
   EOT
   ```

   You might need to tweak pathnames to NodeJS binary and to rated.js according
   to your setup. In this example `rated` is running with `http` notifications 
   receiver.

3. Enable this service

   ```
   cd /etc/service
   ln -s ../sv/rated rated
   ```

   This is enabling and instantly starting `rated` within seconds.

4. Control the service
   - The service is kept running basically.
   - It's logging into file /etc/sv/rated/log/main/current. Log files are 
     rotated automatically.
   - You might check, start, stop and restart `rated` using these commands:

     ```
     sv stop rated
     sv start rated
     sv restart rated
     svn status rated
     ```

### Integrate with your "Requests Processor"

Basically `rated` receives notifications for remote IP addresses of currently
incoming requests. It doesn't care for whether those requests are addressing some
website, some mail service or any other kind of service. The term "request processor"
is thus referring to some software on your server that is usually processing the
request to be observed by `rated`. This might even refer to a whole bunch of software.

In our case there is [nginx](http://nginx.org) providing access on a website to 
protect. For integrating nginx we take a website's existing configuration and
wrap it in nesting `location` rule. Consider this example for providing some
PHP-based website including some externally defined rules:

```
location ~ ^/.+\.php(/|$) {
   fastcgi_pass unix:/var/run/php5-fpm.sock;
   fastcgi_index index.php;
   fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
   include fastcgi_params;
}

include php-rules;

location = / {
   index index.php index.html;
}
```

Wrap this whole configuration in following template declaring some internal 
post_action performed on every request to this site:

```
location / {
   # report all processed requests to some upstream service
   post_action @rated;

   # disable keep-alive
   #keepalive_timeout 0;
   
   # replace this comment by your existing configuration
}

location @rated {
   internal;
   proxy_pass http://127.0.0.1:8080;
   proxy_pass_request_body off;
   proxy_pass_request_headers off;
   proxy_set_header X-IP $remote_addr;

   keepalive_timeout 60;
}
```

The result should look like this:

```
location / {
   # report all processed requests to some upstream service
   post_action @rated;

   # disable keep-alive
   #keepalive_timeout 0;
   
   location ~ ^/.+\.php(/|$) {
      fastcgi_pass unix:/var/run/php5-fpm.sock;
      fastcgi_index index.php;
      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      include fastcgi_params;
   }

   include php-rules;
   
   location = / {
      index index.php index.html;
   }
}

location @rated {
   internal;
   proxy_pass http://127.0.0.1:8080;
   proxy_pass_request_body off;
   proxy_pass_request_headers off;
   proxy_set_header X-IP $remote_addr;
   
   keepalive_timeout 60;
}
```

#### Fine-Tuning nginx

In case of nginx you might check the following advises for improving the site's
resistance:

##### Disable Keep-alive

Clients passing firewall might try to keep connections to your nginx trying to
exhaust your server's number of available TCP sockets. nginx might be configured
to ignore requests for keeping connections alive by uncommenting that 
`keepalive_timeout` rule given in example above.

##### Enabling FastCGI Caching

In case of running PHP-based website (or any other kind of FastCGI-based software)
you might enable FastCGI caching support of nginx.

Add the following rule in context of your configuration's `http` block 
(e.g. in /etc/nginx/nginx.conf):

```
http {
   ...
   fastcgi_cache_path /var/spool/nginx/fastcgi levels=1:2 keys_zone=myzone:10m;
   ...
}
```

This is declaring a caching control zone named `myzone` you might use now by 
inserting the following rule in context of a `server` block like this:

```
server [
   ...
   fastcgi_cache myzone;
   ...
}
```

##### Enabling Request Rate Limiter

Another option to keep nginx from passing requests to quite expensively 
processing PHP interpreter is enabling some request rate limiter. This works 
similar to FastCGI caching in that you globally enable some key pool in your 
setup's `http` block:

```
http {
   ...
   limit_req_zone $binary_remote_addr zone=perip:10m rate=60r/m;
   ...
}
```

This is defining some pool named `perip` for managing rate limiting of requests.
It is capable of managing more than 1.5 million requests.

Adding the following rule in your website's `server` block is eventually 
enabling rate limiter for that site:

```
server {
   ...
   limit_req zone=perip burst=10 nodelay;
   ...
}
```

`nodelay` is enabled for instantly rejecting processes exceedig defined rate
limit. Otherwise requests are delayed as much as required to keep requests
in defined rate limit. However this is increasingly consuming TCP sockets when
under attack. 

By using `nodelay` even wanted visitors might encounter trouble with fetching 
your site, thus rate limit is declared in requests per minute rather than 
requests per seconds (for wanted visitors might quickly fetch an HTML document 
and all related asset files like CSS, image, Javascript, etc.).

## Fine-Tuning Operating System

### sysctl

1. Try adding these rules to /etc/sysctl.conf and optionally tweak them as required:

   ```
   #
   # tweaking for improved handling DDoS
   #
   # Number of times SYNACKs for passive TCP connection.
   net.ipv4.tcp_synack_retries = 2
   
   # Allowed local port range
   net.ipv4.ip_local_port_range = 2000 65535
   
   # Protect Against TCP Time-Wait
   net.ipv4.tcp_rfc1337 = 1
   
   # Decrease the time default value for tcp_fin_timeout connection
   net.ipv4.tcp_fin_timeout = 15
   
   # Decrease the time default value for connections to keep alive
   net.ipv4.tcp_keepalive_time = 300
   net.ipv4.tcp_keepalive_probes = 5
   net.ipv4.tcp_keepalive_intvl = 15
   
   # Increase the tcp-time-wait buckets pool size to prevent simple DOS attacks
   net.ipv4.tcp_max_tw_buckets = 1440000
   net.ipv4.tcp_tw_recycle = 1
   net.ipv4.tcp_tw_reuse = 1
   ```

2. Finally apply them

   ```
   sysctl -p
   ```

### OpenVZ Containers

When running OpenVZ container tweaking some user bean counters might be required.
In most cases you need to observe your actual case and raise counters on exceeding
limits when under attack. Pay special attention to these values [with some
suggested values in parentheses]:

- `numiptent` is limiting number of rules in iptables. You probably need to
  increase this limit. (10000)
- `numtcpsock` is controlling number of available TCP sockets (3000).
- `tcpsndbuf` and `tcprcvbuf` are controlling memory available for buffering
  outgoing and incoming traffic (12000000:25000000 each). Pay attention to the
  notes given [here](http://wiki.openvz.org/UBC_secondary_parameters).
- `kmemsize` is controlling in-kernel memory size that is required for 
  controlling networking and filtering (50000000).
- `privvmpages` is controlling RAM size of your VM. It isn't affected much while
  under attack, but needs to be sufficiently high for running `rated` and all
  other services in your VM at all.
  
You should observe your user bean counters quite frequently by checking the
right-most column of output generated using this command:

```
cat /proc/user_beancounters
```

## Inspecting Status

> As stated before, `rated` is provided "as is", without warranty of any kind. Thus
feel advised to keep an eye of what is going on.

### Count Blocked Packets

The following commands might be used for inspecting status of firewall.

> Commands consider all rules in table INPUT being set by `rated`.

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

## Known Issues

### Lost firewall rules

`rated` is basically keeping track of having blocked some IP for releasing the
block later. However it tends to loose relation to some blocking rules thus
failing to actually remove them.

As a workaround 

1. stop `rated`, 
2. manually remove all leftover blocking rules
3. restart `rated`.

If you are using `iptables` for blocking IP addresses and all rules in chains
`INPUT` and `OUTPUT` are due to running `rated` this process is as simple as 
this:

```
sv stop rated
iptables -F INPUT
iptables -F OUTPUT
sv start rated
```
