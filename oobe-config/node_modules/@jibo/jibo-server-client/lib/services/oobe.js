var Jibo = require('../core');

['getStatus', 'setupRobot'].forEach(function(method) {
    Jibo.OOBE.prototype[method] = function(params, callback) {
        return this.makeUnauthenticatedRequest(method, params, callback);
    };
});
