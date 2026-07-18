require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['notification'] = {};
Jibo.Notification = Service.defineService('notification', ['2015-05-05']);
require('../lib/services/notification');
Object.defineProperty(apiLoader.services['notification'], '2015-05-05', {
  get: function get() {
    var model = require('../apis/notification-2015-05-05.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Notification;
