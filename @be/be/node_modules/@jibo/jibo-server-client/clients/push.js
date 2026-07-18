require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['push'] = {};
Jibo.Push = Service.defineService('push', ['2016-07-29']);
Object.defineProperty(apiLoader.services['push'], '2016-07-29', {
  get: function get() {
    var model = require('../apis/push-2016-07-29.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Push;
