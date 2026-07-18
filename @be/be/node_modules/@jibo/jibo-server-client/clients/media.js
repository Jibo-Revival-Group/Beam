require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['media'] = {};
Jibo.Media = Service.defineService('media', ['2016-07-25']);
Object.defineProperty(apiLoader.services['media'], '2016-07-25', {
  get: function get() {
    var model = require('../apis/media-2016-07-25.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Media;
