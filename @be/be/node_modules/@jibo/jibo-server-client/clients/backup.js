require('../lib/node_loader');
var Jibo = require('../lib/core');
var Service = require('../lib/service');
var apiLoader = require('../lib/api_loader');

apiLoader.services['backup'] = {};
Jibo.Backup = Service.defineService('backup', ['2017-02-22']);
require('../lib/services/backup');
Object.defineProperty(apiLoader.services['backup'], '2017-02-22', {
  get: function get() {
    var model = require('../apis/backup-2017-02-22.min.json');
    return model;
  },
  enumerable: true,
  configurable: true
});

module.exports = Jibo.Backup;
