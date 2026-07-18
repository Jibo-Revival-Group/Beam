var Jibo = require('../core');
var fs = require('fs');

Jibo.Storage = function() {};

Jibo.Storage.prototype.load = function(name, callback) {
    fs.readFile(__dirname + '/' + name + '.json', { encoding: 'utf8'}, callback);
};

Jibo.Storage.prototype.save = function(name, body, callback) {
    fs.writeFile(__dirname + '/' + name + '.json', body, callback);
};

module.exports = Jibo.Storage;
