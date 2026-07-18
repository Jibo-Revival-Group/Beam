require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['oobe'] = {};
Jibo.OOBE = Service.defineService('oobe', ['2016-10-26']);
require('../lib/services/oobe');
Object.defineProperty(apiLoader.services['oobe'], '2016-10-26', {
  get: function get() {
    var model = require('../apis/oobe-2016-10-26.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.OOBE;
