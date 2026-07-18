#!/bin/sh

robotHost=`jibo robot-list|grep '*'|awk '{print \$3 }'`;
echo $robotHost;
