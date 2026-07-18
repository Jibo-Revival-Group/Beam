'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ID3 parser
 */
var ID3 = function () {
  function ID3() {
    _classCallCheck(this, ID3);
  }

  _createClass(ID3, null, [{
    key: 'isHeader',

    /**
     * Returns true if an ID3 header can be found at offset in data
     * @param {Uint8Array} data - The data to search in
     * @param {number} offset - The offset at which to start searching
     * @return {boolean} - True if an ID3 header is found
     */
    value: function isHeader(data, offset) {
      /*
      * http://id3.org/id3v2.3.0
      * [0]     = 'I'
      * [1]     = 'D'
      * [2]     = '3'
      * [3,4]   = {Version}
      * [5]     = {Flags}
      * [6-9]   = {ID3 Size}
      *
      * An ID3v2 tag can be detected with the following pattern:
      *  $49 44 33 yy yy xx zz zz zz zz
      * Where yy is less than $FF, xx is the 'flags' byte and zz is less than $80
      */
      if (offset + 10 <= data.length) {
        //look for 'ID3' identifier
        if (data[offset] === 0x49 && data[offset + 1] === 0x44 && data[offset + 2] === 0x33) {
          //check version is within range
          if (data[offset + 3] < 0xFF && data[offset + 4] < 0xFF) {
            //check size is within range
            if (data[offset + 6] < 0x80 && data[offset + 7] < 0x80 && data[offset + 8] < 0x80 && data[offset + 9] < 0x80) {
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * Returns true if an ID3 footer can be found at offset in data
     * @param {Uint8Array} data - The data to search in
     * @param {number} offset - The offset at which to start searching
     * @return {boolean} - True if an ID3 footer is found
     */

  }, {
    key: 'isFooter',
    value: function isFooter(data, offset) {
      /*
      * The footer is a copy of the header, but with a different identifier
      */
      if (offset + 10 <= data.length) {
        //look for '3DI' identifier
        if (data[offset] === 0x33 && data[offset + 1] === 0x44 && data[offset + 2] === 0x49) {
          //check version is within range
          if (data[offset + 3] < 0xFF && data[offset + 4] < 0xFF) {
            //check size is within range
            if (data[offset + 6] < 0x80 && data[offset + 7] < 0x80 && data[offset + 8] < 0x80 && data[offset + 9] < 0x80) {
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * Returns any adjacent ID3 tags found in data starting at offset, as one block of data
     * @param {Uint8Array} data - The data to search in
     * @param {number} offset - The offset at which to start searching
     * @return {Uint8Array} - The block of data containing any ID3 tags found
     */

  }, {
    key: 'getID3Data',
    value: function getID3Data(data, offset) {
      var front = offset;
      var length = 0;

      while (ID3.isHeader(data, offset)) {
        //ID3 header is 10 bytes
        length += 10;

        var size = ID3._readSize(data, offset + 6);
        length += size;

        if (ID3.isFooter(data, offset + 10)) {
          //ID3 footer is 10 bytes
          length += 10;
        }

        offset += length;
      }

      if (length > 0) {
        return data.subarray(front, front + length);
      }

      return undefined;
    }
  }, {
    key: '_readSize',
    value: function _readSize(data, offset) {
      var size = 0;
      size = (data[offset] & 0x7f) << 21;
      size |= (data[offset + 1] & 0x7f) << 14;
      size |= (data[offset + 2] & 0x7f) << 7;
      size |= data[offset + 3] & 0x7f;
      return size;
    }

    /**
     * Searches for the Elementary Stream timestamp found in the ID3 data chunk
     * @param {Uint8Array} data - Block of data containing one or more ID3 tags
     * @return {number} - The timestamp
     */

  }, {
    key: 'getTimeStamp',
    value: function getTimeStamp(data) {
      var frames = ID3.getID3Frames(data);
      for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        if (ID3.isTimeStampFrame(frame)) {
          return ID3._readTimeStamp(frame);
        }
      }

      return undefined;
    }

    /**
     * Returns true if the ID3 frame is an Elementary Stream timestamp frame
     * @param {ID3 frame} frame
     */

  }, {
    key: 'isTimeStampFrame',
    value: function isTimeStampFrame(frame) {
      return frame && frame.key === 'PRIV' && frame.info === 'com.apple.streaming.transportStreamTimestamp';
    }
  }, {
    key: '_getFrameData',
    value: function _getFrameData(data) {
      /*
      Frame ID       $xx xx xx xx (four characters)
      Size           $xx xx xx xx
      Flags          $xx xx
      */
      var type = String.fromCharCode(data[0], data[1], data[2], data[3]);
      var size = ID3._readSize(data, 4);

      //skip frame id, size, and flags
      var offset = 10;

      return { type: type, size: size, data: data.subarray(offset, offset + size) };
    }

    /**
     * Returns an array of ID3 frames found in all the ID3 tags in the id3Data
     * @param {Uint8Array} id3Data - The ID3 data containing one or more ID3 tags
     * @return {ID3 frame[]} - Array of ID3 frame objects
     */

  }, {
    key: 'getID3Frames',
    value: function getID3Frames(id3Data) {
      var offset = 0;
      var frames = [];

      while (ID3.isHeader(id3Data, offset)) {
        var size = ID3._readSize(id3Data, offset + 6);
        //skip past ID3 header
        offset += 10;
        var end = offset + size;
        //loop through frames in the ID3 tag
        while (offset + 8 < end) {
          var frameData = ID3._getFrameData(id3Data.subarray(offset));
          var frame = ID3._decodeFrame(frameData);
          if (frame) {
            frames.push(frame);
          }
          //skip frame header and frame data
          offset += frameData.size + 10;
        }

        if (ID3.isFooter(id3Data, offset)) {
          offset += 10;
        }
      }

      return frames;
    }
  }, {
    key: '_decodeFrame',
    value: function _decodeFrame(frame) {
      if (frame.type === 'PRIV') {
        return ID3._decodePrivFrame(frame);
      } else if (frame.type[0] === 'T') {
        return ID3._decodeTextFrame(frame);
      } else if (frame.type[0] === 'W') {
        return ID3._decodeURLFrame(frame);
      }

      return undefined;
    }
  }, {
    key: '_readTimeStamp',
    value: function _readTimeStamp(timeStampFrame) {
      if (timeStampFrame.data.byteLength === 8) {
        var data = new Uint8Array(timeStampFrame.data);
        // timestamp is 33 bit expressed as a big-endian eight-octet number,
        // with the upper 31 bits set to zero.
        var pts33Bit = data[3] & 0x1;
        var timestamp = (data[4] << 23) + (data[5] << 15) + (data[6] << 7) + data[7];
        timestamp /= 45;

        if (pts33Bit) {
          timestamp += 47721858.84; // 2^32 / 90
        }

        return Math.round(timestamp);
      }

      return undefined;
    }
  }, {
    key: '_decodePrivFrame',
    value: function _decodePrivFrame(frame) {
      /*
      Format: <text string>\0<binary data>
      */
      if (frame.size < 2) {
        return undefined;
      }

      var owner = ID3._utf8ArrayToStr(frame.data);
      var privateData = new Uint8Array(frame.data.subarray(owner.length + 1));

      return { key: frame.type, info: owner, data: privateData.buffer };
    }
  }, {
    key: '_decodeTextFrame',
    value: function _decodeTextFrame(frame) {
      if (frame.size < 2) {
        return undefined;
      }

      if (frame.type === 'TXXX') {
        /*
        Format:
        [0]   = {Text Encoding}
        [1-?] = {Description}\0{Value}
        */
        var index = 1;
        var description = ID3._utf8ArrayToStr(frame.data.subarray(index));

        index += description.length + 1;
        var value = ID3._utf8ArrayToStr(frame.data.subarray(index));

        return { key: frame.type, info: description, data: value };
      } else {
        /*
        Format:
        [0]   = {Text Encoding}
        [1-?] = {Value}
        */
        var text = ID3._utf8ArrayToStr(frame.data.subarray(1));
        return { key: frame.type, data: text };
      }
    }
  }, {
    key: '_decodeURLFrame',
    value: function _decodeURLFrame(frame) {
      if (frame.type === 'WXXX') {
        /*
        Format:
        [0]   = {Text Encoding}
        [1-?] = {Description}\0{URL}
        */
        if (frame.size < 2) {
          return undefined;
        }

        var index = 1;
        var description = ID3._utf8ArrayToStr(frame.data.subarray(index));

        index += description.length + 1;
        var value = ID3._utf8ArrayToStr(frame.data.subarray(index));

        return { key: frame.type, info: description, data: value };
      } else {
        /*
        Format:
        [0-?] = {URL}
        */
        var url = ID3._utf8ArrayToStr(frame.data);
        return { key: frame.type, data: url };
      }
    }

    // http://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript/22373197
    // http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
    /* utf.js - UTF-8 <=> UTF-16 convertion
     *
     * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0
     * LastModified: Dec 25 1999
     * This library is free.  You can redistribute it and/or modify it.
     */

  }, {
    key: '_utf8ArrayToStr',
    value: function _utf8ArrayToStr(array) {

      var char2 = void 0;
      var char3 = void 0;
      var out = '';
      var i = 0;
      var length = array.length;

      while (i < length) {
        var c = array[i++];
        switch (c >> 4) {
          case 0:
            return out;
          case 1:case 2:case 3:case 4:case 5:case 6:case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12:case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode((c & 0x1F) << 6 | char2 & 0x3F);
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode((c & 0x0F) << 12 | (char2 & 0x3F) << 6 | (char3 & 0x3F) << 0);
            break;
        }
      }

      return out;
    }
  }]);

  return ID3;
}();

exports.default = ID3;