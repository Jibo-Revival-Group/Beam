'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _eventHandler = require('../event-handler');

var _eventHandler2 = _interopRequireDefault(_eventHandler);

var _id = require('../demux/id3');

var _id2 = _interopRequireDefault(_id);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * id3 metadata track controller
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */

var ID3TrackController = function (_EventHandler) {
  _inherits(ID3TrackController, _EventHandler);

  function ID3TrackController(hls) {
    _classCallCheck(this, ID3TrackController);

    var _this = _possibleConstructorReturn(this, (ID3TrackController.__proto__ || Object.getPrototypeOf(ID3TrackController)).call(this, hls, _events2.default.MEDIA_ATTACHED, _events2.default.MEDIA_DETACHING, _events2.default.FRAG_PARSING_METADATA));

    _this.id3Track = undefined;
    _this.media = undefined;
    return _this;
  }

  _createClass(ID3TrackController, [{
    key: 'destroy',
    value: function destroy() {
      _eventHandler2.default.prototype.destroy.call(this);
    }

    // Add ID3 metatadata text track.

  }, {
    key: 'onMediaAttached',
    value: function onMediaAttached(data) {
      this.media = data.media;
      if (!this.media) {
        return;
      }

      this.id3Track = this.media.addTextTrack('metadata', 'id3');
      this.id3Track.mode = 'hidden';
    }
  }, {
    key: 'onMediaDetaching',
    value: function onMediaDetaching() {
      this.media = undefined;
    }
  }, {
    key: 'onFragParsingMetadata',
    value: function onFragParsingMetadata(data) {
      var fragment = data.frag;
      var samples = data.samples;

      // Attempt to recreate Safari functionality by creating
      // WebKitDataCue objects when available and store the decoded
      // ID3 data in the value property of the cue
      var Cue = window.WebKitDataCue || window.VTTCue || window.TextTrackCue;

      for (var i = 0; i < samples.length; i++) {
        var frames = _id2.default.getID3Frames(samples[i].data);
        if (frames) {
          var startTime = samples[i].pts;
          var endTime = i < samples.length - 1 ? samples[i + 1].pts : fragment.endPTS;

          // Give a slight bump to the endTime if it's equal to startTime to avoid a SyntaxError in IE
          if (startTime === endTime) {
            endTime += 0.0001;
          }

          for (var j = 0; j < frames.length; j++) {
            var frame = frames[j];
            // Safari doesn't put the timestamp frame in the TextTrack
            if (!_id2.default.isTimeStampFrame(frame)) {
              var cue = new Cue(startTime, endTime, '');
              cue.value = frame;
              this.id3Track.addCue(cue);
            }
          }
        }
      }
    }
  }]);

  return ID3TrackController;
}(_eventHandler2.default);

exports.default = ID3TrackController;