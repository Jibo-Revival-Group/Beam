require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['oobeadmin'] = {};
Jibo.OOBEAdmin = Service.defineService('oobeadmin', ['2016-10-26']);
Object.defineProperty(apiLoader.services['oobeadmin'], '2016-10-26', {
  get: function get() {
    var model = require('../apis/oobeadmin-2016-10-26.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.OOBEAdmin;
