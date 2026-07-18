require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['mediaadmin'] = {};
Jibo.MediaAdmin = Service.defineService('mediaadmin', ['2016-07-25']);
Object.defineProperty(apiLoader.services['mediaadmin'], '2016-07-25', {
  get: function get() {
    var model = require('../apis/mediaadmin-2016-07-25.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.MediaAdmin;
