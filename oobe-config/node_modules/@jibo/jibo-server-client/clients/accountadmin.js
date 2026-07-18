require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['accountadmin'] = {};
Jibo.AccountAdmin = Service.defineService('accountadmin', ['2015-11-11']);
Object.defineProperty(apiLoader.services['accountadmin'], '2015-11-11', {
  get: function get() {
    var model = require('../apis/accountadmin-2015-11-11.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.AccountAdmin;
