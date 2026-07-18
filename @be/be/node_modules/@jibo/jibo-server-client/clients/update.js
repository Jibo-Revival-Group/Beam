require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['update'] = {};
Jibo.Update = Service.defineService('update', ['2016-03-01']);
Object.defineProperty(apiLoader.services['update'], '2016-03-01', {
  get: function get() {
    var model = require('../apis/update-2016-03-01.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Update;
