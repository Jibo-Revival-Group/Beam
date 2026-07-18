'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.findFragWithCC = findFragWithCC;

var _binarySearch = require('./binary-search');

var _binarySearch2 = _interopRequireDefault(_binarySearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findFragWithCC(fragments, CC) {
   return _binarySearch2.default.search(fragments, function (candidate) {
      if (candidate.cc < CC) {
         return 1;
      } else if (candidate.cc > CC) {
         return -1;
      } else {
         return 0;
      }
   });
}