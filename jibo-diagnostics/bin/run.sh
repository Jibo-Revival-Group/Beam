#!/bin/sh


kill -9 `ps -ef | grep "skill-main.js" | grep -v grep | awk "{print $1}"` 2> /dev/null;

cd /opt/jibo/Jibo/Skills/jibo-diagnostics;
node run-on-robot.js

