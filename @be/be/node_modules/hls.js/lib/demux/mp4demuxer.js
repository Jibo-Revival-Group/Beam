'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * MP4 demuxer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
//import {logger} from '../utils/logger';


var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UINT32_MAX = Math.pow(2, 32) - 1;

var MP4Demuxer = function () {
  function MP4Demuxer(observer, remuxer) {
    _classCallCheck(this, MP4Demuxer);

    this.observer = observer;
    this.remuxer = remuxer;
  }

  _createClass(MP4Demuxer, [{
    key: 'resetTimeStamp',
    value: function resetTimeStamp(initPTS) {
      this.initPTS = initPTS;
    }
  }, {
    key: 'resetInitSegment',
    value: function resetInitSegment(initSegment, audioCodec, videoCodec, duration) {
      //jshint unused:false
      if (initSegment && initSegment.byteLength) {
        var initData = this.initData = MP4Demuxer.parseInitSegment(initSegment);
        var tracks = {};
        if (initData.audio) {
          tracks.audio = { container: 'audio/mp4', codec: audioCodec, initSegment: duration ? initSegment : null };
        }
        if (initData.video) {
          tracks.video = { container: 'video/mp4', codec: videoCodec, initSegment: duration ? initSegment : null };
        }
        this.observer.trigger(_events2.default.FRAG_PARSING_INIT_SEGMENT, { tracks: tracks });
      } else {
        if (audioCodec) {
          this.audioCodec = audioCodec;
        }
        if (videoCodec) {
          this.videoCodec = videoCodec;
        }
      }
    }
  }, {
    key: 'append',


    // feed incoming data to the front of the parsing pipeline
    value: function append(data, timeOffset, contiguous, accurateTimeOffset) {
      var initData = this.initData;
      if (!initData) {
        this.resetInitSegment(data, this.audioCodec, this.videoCodec);
        initData = this.initData;
      }
      var startDTS = void 0,
          initPTS = this.initPTS;
      if (initPTS === undefined) {
        var _startDTS = MP4Demuxer.getStartDTS(initData, data);
        this.initPTS = initPTS = _startDTS - timeOffset;
        this.observer.trigger(_events2.default.INIT_PTS_FOUND, { initPTS: initPTS });
      }
      MP4Demuxer.offsetStartDTS(initData, data, initPTS);
      startDTS = MP4Demuxer.getStartDTS(initData, data);
      this.remuxer.remux(initData.audio, initData.video, null, null, startDTS, contiguous, accurateTimeOffset, data);
    }
  }, {
    key: 'destroy',
    value: function destroy() {}
  }], [{
    key: 'probe',
    value: function probe(data) {
      if (data.length >= 8) {
        var dataType = MP4Demuxer.bin2str(data.subarray(4, 8));
        return ['moof', 'ftyp', 'styp'].indexOf(dataType) >= 0;
      }
      return false;
    }
  }, {
    key: 'bin2str',
    value: function bin2str(buffer) {
      return String.fromCharCode.apply(null, buffer);
    }
  }, {
    key: 'readUint32',
    value: function readUint32(buffer, offset) {
      if (buffer.data) {
        offset += buffer.start;
        buffer = buffer.data;
      }

      var val = buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3];
      return val < 0 ? 4294967296 + val : val;
    }
  }, {
    key: 'writeUint32',
    value: function writeUint32(buffer, offset, value) {
      if (buffer.data) {
        offset += buffer.start;
        buffer = buffer.data;
      }
      buffer[offset] = value >> 24;
      buffer[offset + 1] = value >> 16 & 0xff;
      buffer[offset + 2] = value >> 8 & 0xff;
      buffer[offset + 3] = value & 0xff;
    }

    // Find the data for a box specified by its path

  }, {
    key: 'findBox',
    value: function findBox(data, path) {
      var results = [],
          i,
          size,
          type,
          end,
          subresults,
          start,
          endbox;

      if (data.data) {
        start = data.start;
        end = data.end;
        data = data.data;
      } else {
        start = 0;
        end = data.byteLength;
      }

      if (!path.length) {
        // short-circuit the search for empty paths
        return null;
      }

      for (i = start; i < end;) {
        size = MP4Demuxer.readUint32(data, i);
        type = MP4Demuxer.bin2str(data.subarray(i + 4, i + 8));
        endbox = size > 1 ? i + size : end;

        if (type === path[0]) {

          if (path.length === 1) {
            // this is the end of the path and we've found the box we were
            // looking for
            results.push({ data: data, start: i + 8, end: endbox });
          } else {
            // recursively search for the next box along the path
            subresults = MP4Demuxer.findBox({ data: data, start: i + 8, end: endbox }, path.slice(1));
            if (subresults.length) {
              results = results.concat(subresults);
            }
          }
        }
        i = endbox;
      }

      // we've finished searching all of data
      return results;
    }

    /**
     * Parses an MP4 initialization segment and extracts stream type and
     * timescale values for any declared tracks. Timescale values indicate the
     * number of clock ticks per second to assume for time-based values
     * elsewhere in the MP4.
     *
     * To determine the start time of an MP4, you need two pieces of
     * information: the timescale unit and the earliest base media decode
     * time. Multiple timescales can be specified within an MP4 but the
     * base media decode time is always expressed in the timescale from
     * the media header box for the track:
     * ```
     * moov > trak > mdia > mdhd.timescale
     * moov > trak > mdia > hdlr
     * ```
     * @param init {Uint8Array} the bytes of the init segment
     * @return {object} a hash of track type to timescale values or null if
     * the init segment is malformed.
     */

  }, {
    key: 'parseInitSegment',
    value: function parseInitSegment(initSegment) {
      var result = [];
      var traks = MP4Demuxer.findBox(initSegment, ['moov', 'trak']);

      traks.forEach(function (trak) {
        var tkhd = MP4Demuxer.findBox(trak, ['tkhd'])[0];
        if (tkhd) {
          var version = tkhd.data[tkhd.start];
          var index = version === 0 ? 12 : 20;
          var trackId = MP4Demuxer.readUint32(tkhd, index);

          var mdhd = MP4Demuxer.findBox(trak, ['mdia', 'mdhd'])[0];
          if (mdhd) {
            version = mdhd.data[mdhd.start];
            index = version === 0 ? 12 : 20;
            var timescale = MP4Demuxer.readUint32(mdhd, index);

            var hdlr = MP4Demuxer.findBox(trak, ['mdia', 'hdlr'])[0];
            if (hdlr) {
              var hdlrType = MP4Demuxer.bin2str(hdlr.data.subarray(hdlr.start + 8, hdlr.start + 12));
              var type = { 'soun': 'audio', 'vide': 'video' }[hdlrType];
              if (type) {
                result[trackId] = { timescale: timescale, type: type };
                result[type] = { timescale: timescale, id: trackId };
              }
            }
          }
        }
      });
      return result;
    }

    /**
     * Determine the base media decode start time, in seconds, for an MP4
     * fragment. If multiple fragments are specified, the earliest time is
     * returned.
     *
     * The base media decode time can be parsed from track fragment
     * metadata:
     * ```
     * moof > traf > tfdt.baseMediaDecodeTime
     * ```
     * It requires the timescale value from the mdhd to interpret.
     *
     * @param timescale {object} a hash of track ids to timescale values.
     * @return {number} the earliest base media decode start time for the
     * fragment, in seconds
     */

  }, {
    key: 'getStartDTS',
    value: function getStartDTS(initData, fragment) {
      var trafs, baseTimes, result;

      // we need info from two childrend of each track fragment box
      trafs = MP4Demuxer.findBox(fragment, ['moof', 'traf']);

      // determine the start times for each track
      baseTimes = [].concat.apply([], trafs.map(function (traf) {
        return MP4Demuxer.findBox(traf, ['tfhd']).map(function (tfhd) {
          var id, scale, baseTime;

          // get the track id from the tfhd
          id = MP4Demuxer.readUint32(tfhd, 4);
          // assume a 90kHz clock if no timescale was specified
          scale = initData[id].timescale || 90e3;

          // get the base media decode time from the tfdt
          baseTime = MP4Demuxer.findBox(traf, ['tfdt']).map(function (tfdt) {
            var version, result;

            version = tfdt.data[tfdt.start];
            result = MP4Demuxer.readUint32(tfdt, 4);
            if (version === 1) {
              result *= Math.pow(2, 32);

              result += MP4Demuxer.readUint32(tfdt, 8);
            }
            return result;
          })[0];
          baseTime = baseTime || Infinity;

          // convert base time to seconds
          return baseTime / scale;
        });
      }));

      // return the minimum
      result = Math.min.apply(null, baseTimes);
      return isFinite(result) ? result : 0;
    }
  }, {
    key: 'offsetStartDTS',
    value: function offsetStartDTS(initData, fragment, timeOffset) {
      MP4Demuxer.findBox(fragment, ['moof', 'traf']).map(function (traf) {
        return MP4Demuxer.findBox(traf, ['tfhd']).map(function (tfhd) {
          // get the track id from the tfhd
          var id = MP4Demuxer.readUint32(tfhd, 4);
          // assume a 90kHz clock if no timescale was specified
          var timescale = initData[id].timescale || 90e3;

          // get the base media decode time from the tfdt
          MP4Demuxer.findBox(traf, ['tfdt']).map(function (tfdt) {
            var version = tfdt.data[tfdt.start];
            var baseMediaDecodeTime = MP4Demuxer.readUint32(tfdt, 4);
            if (version === 0) {
              MP4Demuxer.writeUint32(tfdt, 4, baseMediaDecodeTime - timeOffset * timescale);
            } else {
              baseMediaDecodeTime *= Math.pow(2, 32);
              baseMediaDecodeTime += MP4Demuxer.readUint32(tfdt, 8);
              baseMediaDecodeTime -= timeOffset * timescale;
              var upper = Math.floor(baseMediaDecodeTime / (UINT32_MAX + 1));
              var lower = Math.floor(baseMediaDecodeTime % (UINT32_MAX + 1));
              MP4Demuxer.writeUint32(tfdt, 4, upper);
              MP4Demuxer.writeUint32(tfdt, 8, lower);
            }
          });
        });
      });
    }
  }]);

  return MP4Demuxer;
}();

exports.default = MP4Demuxer;