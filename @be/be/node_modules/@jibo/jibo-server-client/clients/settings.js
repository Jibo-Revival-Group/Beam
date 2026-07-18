require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['settings'] = {};
Jibo.Settings = Service.defineService('settings', ['2017-12-19']);
Object.defineProperty(apiLoader.services['settings'], '2017-12-19', {
  get: function get() {
    var model = require('../apis/settings-2017-12-19.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Settings;
