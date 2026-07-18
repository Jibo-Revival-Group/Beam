require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['person'] = {};
Jibo.Person = Service.defineService('person', ['2016-08-01']);
Object.defineProperty(apiLoader.services['person'], '2016-08-01', {
  get: function get() {
    var model = require('../apis/person-2016-08-01.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Person;
