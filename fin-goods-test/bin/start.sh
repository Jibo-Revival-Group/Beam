#!/bin/sh

robotHost=`./bin/get-robot-host.sh`;

# First sync over files
jibo sync

ssh root@$robotHost "/opt/jibo/fin-goods-test/bin/run.sh" &
