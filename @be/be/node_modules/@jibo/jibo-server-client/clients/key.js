require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['key'] = {};
Jibo.Key = Service.defineService('key', ['2016-02-01']);
require('../lib/services/key');
Object.defineProperty(apiLoader.services['key'], '2016-02-01', {
  get: function get() {
    var model = require('../apis/key-2016-02-01.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Key;
