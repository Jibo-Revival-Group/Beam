'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (args) {
    let formatObj = function formatObj(obj) {
        let text = _util2.default.inspect(obj);
        if (obj && obj instanceof Error && obj.stack) {
            //text += '\n' + util.inspect(stackTrace.parse(obj));
            text += '\n' + _formatError2.default.format(obj);
        }
        return text;
    };
    let text = args.map(function (item) {
        return typeof item == 'string' ? item : formatObj(item);
    }).join(' ').trim();

    return text;
};

var _formatError = require('format-error');

var _formatError2 = _interopRequireDefault(_formatError);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=map/format-helper.js.map
