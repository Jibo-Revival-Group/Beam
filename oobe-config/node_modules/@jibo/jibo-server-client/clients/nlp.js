require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['nlp'] = {};
Jibo.NLP = Service.defineService('nlp', ['2016-10-31']);
Object.defineProperty(apiLoader.services['nlp'], '2016-10-31', {
  get: function get() {
    var model = require('../apis/nlp-2016-10-31.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.NLP;
