require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['gqa'] = {};
Jibo.GQA = Service.defineService('gqa', ['2016-09-30']);
Object.defineProperty(apiLoader.services['gqa'], '2016-09-30', {
  get: function get() {
    var model = require('../apis/gqa-2016-09-30.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.GQA;
