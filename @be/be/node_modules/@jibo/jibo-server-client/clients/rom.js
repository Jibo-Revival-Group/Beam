require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['rom'] = {};
Jibo.ROM = Service.defineService('rom', ['2017-10-11']);
Object.defineProperty(apiLoader.services['rom'], '2017-10-11', {
  get: function get() {
    var model = require('../apis/rom-2017-10-11.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.ROM;
