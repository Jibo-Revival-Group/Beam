require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['updateadmin'] = {};
Jibo.UpdateAdmin = Service.defineService('updateadmin', ['2016-03-01']);
Object.defineProperty(apiLoader.services['updateadmin'], '2016-03-01', {
  get: function get() {
    var model = require('../apis/updateadmin-2016-03-01.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.UpdateAdmin;
