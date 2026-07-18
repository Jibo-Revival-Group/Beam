#!/bin/sh

cd /opt/jibo/fin-goods-test; (killall /usr/local/electron/electron;true) >/dev/null 2>&1; export DISPLAY=:0; export XAUTHORITY=/tmp/.Xauthority; /usr/local/electron/electron --remote-debugging-port=9222 /opt/jibo/fin-goods-test/bin/window-manager.js /opt/jibo/fin-goods-test/index.html;
