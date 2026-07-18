require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['account'] = {};
Jibo.Account = Service.defineService('account', ['2015-11-11']);
require('../lib/services/account');
Object.defineProperty(apiLoader.services['account'], '2015-11-11', {
  get: function get() {
    var model = require('../apis/account-2015-11-11.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Account;
