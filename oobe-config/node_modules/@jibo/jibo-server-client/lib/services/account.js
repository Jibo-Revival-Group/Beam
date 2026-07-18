var Jibo = require('../core');

['checkEmail', 'create', 'login', 'resendActivationCode', 'activateByCode', 'confirmEmailReset',
    'sendPasswordReset', 'passwordResetByCode', 'getAccountByAccessToken', 'facebookConnect'].forEach(function(method) {
    Jibo.Account.prototype[method] = function(params, callback) {
        return this.makeUnauthenticatedRequest(method, params, callback);
    };
});

var FIXED_KEY = 'jibokey';

Jibo.Account.prototype.encryptQr = Jibo.Account.prototype.decryptQr = function(source, key) {
    key = key || FIXED_KEY;
    var result = '';
    for (var i = 0; i < source.length; i++) {
        var encodedChar = source.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result = result + String.fromCharCode(encodedChar);
    }
    return result;
};
