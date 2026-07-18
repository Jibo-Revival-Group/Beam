require('./browser_loader');

var AWS = require('./core');

if (typeof window !== 'undefined') window.Jibo = AWS;
if (typeof module !== 'undefined') module.exports = AWS;
if (typeof self !== 'undefined') self.Jibo = AWS;

/**
 * @private
 * DO NOT REMOVE
 * browser builder will strip out this line if services are supplied on the command line.
 */
require('../clients/browser_default');
