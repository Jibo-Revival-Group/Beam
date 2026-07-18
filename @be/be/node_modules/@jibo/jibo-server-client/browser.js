require('./lib/browser_loader');

var Jibo = require('./lib/core');
if (typeof window !== 'undefined') window.Jibo = Jibo;
if (typeof module !== 'undefined') module.exports = Jibo;
if (typeof self !== 'undefined') self.Jibo = Jibo;
