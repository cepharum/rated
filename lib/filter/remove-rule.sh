#!/bin/bash

[ $# -ge 1 ] || { echo "usage: ${0} <IP-address>" >&2; exit 99; }

if [ "$(id -u)" -eq 0 ]; then
	WRAPPER=
else
	which sudo &>/dev/null || { echo "run as root" >&2; exit 98; }
	WRAPPER=sudo
fi

# $WRAPPER mkdir -p /var/log/rated

$WRAPPER iptables -C INPUT -s "${1}" -j DROP &>/dev/null && \
	$WRAPPER iptables -D INPUT -s "${1}" -j DROP # 2>&1 | tee /var/log/rated/input.error.log

$WRAPPER iptables -C OUTPUT -d "${1}" -j REJECT &>/dev/null && \
	$WRAPPER iptables -D OUTPUT -d "${1}" -j REJECT # 2>&1 | tee /var/log/rated/output.error.log
