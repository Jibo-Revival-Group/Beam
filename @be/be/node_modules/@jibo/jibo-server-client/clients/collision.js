require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['collision'] = {};
Jibo.Collision = Service.defineService('collision', ['2016-11-26']);
Object.defineProperty(apiLoader.services['collision'], '2016-11-26', {
  get: function get() {
    var model = require('../apis/collision-2016-11-26.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Collision;
