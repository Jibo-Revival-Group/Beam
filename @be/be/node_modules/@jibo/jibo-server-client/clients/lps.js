require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['lps'] = {};
Jibo.Lps = Service.defineService('lps', ['2017-12-01']);
Object.defineProperty(apiLoader.services['lps'], '2017-12-01', {
  get: function get() {
    var model = require('../apis/lps-2017-12-01.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Lps;
