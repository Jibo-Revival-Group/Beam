// var fs = require('fs');
// var Jibo = require('../core');
// var request = require('request');
// // require('request-debug')(request);
//
// Jibo.util.update(Jibo.Backup.prototype, {
//     upload: function(loopId, stream, size, callback) {
//       this.new(
//         { loopId: loopId },
//         function(err, result) {
//           if (err) {
//             return callback(err);
//           }
//           stream.pipe(
//             request({
//                 uri: result.uploadUrl,
//                 method: 'PUT',
//                 headers: {
//                   Accept: '*/*',
//                   'content-type': 'application/octet-stream',
//                   'Content-Length': size //Content-Length is required to upload to AWS S3 pre-signed URL
//                 }
//               },
//               function (err, response, responseBody) {
//                 if (err) {
//                   return callback({
//                     err: err,
//                     headers: response.headers,
//                     body: responseBody
//                   });
//                 }
//
//                 callback(null, {
//                   etag: response.headers.etag,
//                   date: response.headers.date
//                 });
//               })
//           );
//         });
//     },
//     uploadFile: function(loopId, fileName, callback) {
//       this.upload(
//         loopId,
//         fs.createReadStream(fileName),
//         fs.statSync(fileName).size,
//         callback);
//     }
// });
