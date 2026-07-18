#!/bin/sh

robotHost=`./bin/get-robot-host.sh`;

ssh -f -N -L 9222:localhost:9222 root@$robotHost