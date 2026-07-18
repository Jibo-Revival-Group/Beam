#!/bin/sh

robotHost=`./bin/get-robot-host.sh`;

echo "Adding ssh key to $robotHosts's ~/.ssh/authorized_keys file (WARNING, this will be added multiple times if repeatedly called)"
cat ~/.ssh/id_rsa.pub | ssh root@$robotHost "mkdir -p ~/.ssh && cat >>  ~/.ssh/authorized_keys"
