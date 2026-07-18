var Jibo = require('../core');

['updateAgreementStatus'].forEach(function(method) {
    Jibo.Loop.prototype[method] = function(params, callback) {
        return this.makeUnauthenticatedRequest(method, params, callback);
    };
});