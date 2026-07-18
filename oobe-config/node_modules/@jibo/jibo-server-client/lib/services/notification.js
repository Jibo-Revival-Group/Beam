var EventEmitter = require('events').EventEmitter;
var util = require('util');
var WebSocket = typeof window !== 'undefined' && window.WebSocket;
if (!WebSocket) {
    try {
        WebSocket = require('@jibo/ws');
    } catch (e) {
        // It's ok to build w/o this WS support
    }
}
var Jibo = require('../core');

function NotificationEmiter(options) {
    EventEmitter.call(this);
    options.reconnectInterval = options.reconnectInterval || 1000 * 10
    var ws;
    var self = this;
    var forceClosing = false;
    (function connect() {
        if (forceClosing) {
            console.log('closing connection')
            return;
        }
        console.log('trying to connect:', options.url);
        ws = new WebSocket(options.url);
        ws.on('open', function() {
            self.emit('open')
        });
        ws.on('pong', function(data) {
            self.emit('pong', data)
        });
        ws.on('message', function(data, flags) {
            var parsedData = data;
            try {
                parsedData = JSON.parse(data);
                self.emit('message', parsedData, flags);
            } catch (e) {
                self.emit('error', e);
            }
            if (parsedData.error) {
                self.emit('error', parsedData.error);
            }
        });
        ws.on('close', function(code, message) {
            self.emit('close', code, message);
            setTimeout(connect, options.reconnectInterval);
        });
        ws.on('error', function(error) {
            self.emit('websocket error', error);
            setTimeout(connect, options.reconnectInterval);
        });
    })();

    self.close = function() {
        forceClosing = true;
        ws.close()
    }
    self.ping = function(data) {
      ws.ping(data);
    }
}
util.inherits(NotificationEmiter, EventEmitter);


Jibo.util.update(Jibo.Notification.prototype, {
    connect: function(options, callback) {
      var wsEndpoint = this.endpointFromTemplate(this.config.wsendpoint);
      this.newRobotToken(options, function(err, result) {
          if (err) {
              return callback(err);
          }

          var notificationHub = new NotificationEmiter({
              url: wsEndpoint +'/'+ result.token
          });
          callback(null, notificationHub);
      });
    }
});
