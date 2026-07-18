require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['log'] = {};
Jibo.Log = Service.defineService('log', ['2015-03-09']);
Object.defineProperty(apiLoader.services['log'], '2015-03-09', {
  get: function get() {
    var model = require('../apis/log-2015-03-09.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Log;
