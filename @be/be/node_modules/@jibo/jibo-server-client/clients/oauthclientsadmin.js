require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['oauthclientsadmin'] = {};
Jibo.OauthClientsAdmin = Service.defineService('oauthclientsadmin', ['2017-11-08']);
Object.defineProperty(apiLoader.services['oauthclientsadmin'], '2017-11-08', {
  get: function get() {
    var model = require('../apis/oauthclientsadmin-2017-11-08.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.OauthClientsAdmin;
