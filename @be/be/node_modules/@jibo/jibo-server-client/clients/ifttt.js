require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['ifttt'] = {};
Jibo.IFTTT = Service.defineService('ifttt', ['2017-02-07']);
Object.defineProperty(apiLoader.services['ifttt'], '2017-02-07', {
  get: function get() {
    var model = require('../apis/ifttt-2017-02-07.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.IFTTT;
