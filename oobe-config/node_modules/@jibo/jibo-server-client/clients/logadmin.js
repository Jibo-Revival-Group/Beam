require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['logadmin'] = {};
Jibo.LogAdmin = Service.defineService('logadmin', ['2015-03-09']);
Object.defineProperty(apiLoader.services['logadmin'], '2015-03-09', {
  get: function get() {
    var model = require('../apis/logadmin-2015-03-09.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.LogAdmin;
