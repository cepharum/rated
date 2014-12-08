#!/bin/bash

[ $# -ge 1 ] || { echo "usage: ${0} <IP-address>" >&2; exit 99; }

if [ "$(id -u)" -eq 0 ]; then
	WRAPPER=
else
	which sudo &>/dev/null || { echo "run as root" >&2; exit 98; }
	WRAPPER=sudo
fi

$WRAPPER iptables -C INPUT -p tcp -s "${1}" --dport 80 -j DROP &>/dev/null || \
	$WRAPPER iptables -A INPUT -p tcp -s "${1}" --dport 80 -j DROP
