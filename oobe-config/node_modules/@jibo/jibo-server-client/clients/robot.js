require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['robot'] = {};
Jibo.Robot = Service.defineService('robot', ['2016-02-25']);
Object.defineProperty(apiLoader.services['robot'], '2016-02-25', {
  get: function get() {
    var model = require('../apis/robot-2016-02-25.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Robot;
