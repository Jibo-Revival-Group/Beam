require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['loop'] = {};
Jibo.Loop = Service.defineService('loop', ['2016-03-24']);
require('../lib/services/loop');
Object.defineProperty(apiLoader.services['loop'], '2016-03-24', {
  get: function get() {
    var model = require('../apis/loop-2016-03-24.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Loop;
