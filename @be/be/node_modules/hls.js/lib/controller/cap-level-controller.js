'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _eventHandler = require('../event-handler');

var _eventHandler2 = _interopRequireDefault(_eventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * cap stream level to media size dimension controller
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */

var CapLevelController = function (_EventHandler) {
  _inherits(CapLevelController, _EventHandler);

  function CapLevelController(hls) {
    _classCallCheck(this, CapLevelController);

    return _possibleConstructorReturn(this, (CapLevelController.__proto__ || Object.getPrototypeOf(CapLevelController)).call(this, hls, _events2.default.FPS_DROP_LEVEL_CAPPING, _events2.default.MEDIA_ATTACHING, _events2.default.MANIFEST_PARSED));
  }

  _createClass(CapLevelController, [{
    key: 'destroy',
    value: function destroy() {
      if (this.hls.config.capLevelToPlayerSize) {
        this.media = this.restrictedLevels = null;
        this.autoLevelCapping = Number.POSITIVE_INFINITY;
        if (this.timer) {
          this.timer = clearInterval(this.timer);
        }
      }
    }
  }, {
    key: 'onFpsDropLevelCapping',
    value: function onFpsDropLevelCapping(data) {
      // Don't add a restricted level more than once
      if (CapLevelController.isLevelAllowed(data.droppedLevel, this.restrictedLevels)) {
        this.restrictedLevels.push(data.droppedLevel);
      }
    }
  }, {
    key: 'onMediaAttaching',
    value: function onMediaAttaching(data) {
      this.media = data.media instanceof HTMLVideoElement ? data.media : null;
    }
  }, {
    key: 'onManifestParsed',
    value: function onManifestParsed(data) {
      var hls = this.hls;
      this.restrictedLevels = [];
      if (hls.config.capLevelToPlayerSize) {
        this.autoLevelCapping = Number.POSITIVE_INFINITY;
        this.levels = data.levels;
        hls.firstLevel = this.getMaxLevel(data.firstLevel);
        clearInterval(this.timer);
        this.timer = setInterval(this.detectPlayerSize.bind(this), 1000);
        this.detectPlayerSize();
      }
    }
  }, {
    key: 'detectPlayerSize',
    value: function detectPlayerSize() {
      if (this.media) {
        var levelsLength = this.levels ? this.levels.length : 0;
        if (levelsLength) {
          var hls = this.hls;
          hls.autoLevelCapping = this.getMaxLevel(levelsLength - 1);
          if (hls.autoLevelCapping > this.autoLevelCapping) {
            // if auto level capping has a higher value for the previous one, flush the buffer using nextLevelSwitch
            // usually happen when the user go to the fullscreen mode.
            hls.streamController.nextLevelSwitch();
          }
          this.autoLevelCapping = hls.autoLevelCapping;
        }
      }
    }

    /*
    * returns level should be the one with the dimensions equal or greater than the media (player) dimensions (so the video will be downscaled)
    */

  }, {
    key: 'getMaxLevel',
    value: function getMaxLevel(capLevelIndex) {
      var _this2 = this;

      if (!this.levels) {
        return -1;
      }

      var validLevels = this.levels.filter(function (level, index) {
        return CapLevelController.isLevelAllowed(index, _this2.restrictedLevels) && index <= capLevelIndex;
      });

      return CapLevelController.getMaxLevelByMediaSize(validLevels, this.mediaWidth, this.mediaHeight);
    }
  }, {
    key: 'mediaWidth',
    get: function get() {
      var width = void 0;
      var media = this.media;
      if (media) {
        width = media.width || media.clientWidth || media.offsetWidth;
        width *= CapLevelController.contentScaleFactor;
      }
      return width;
    }
  }, {
    key: 'mediaHeight',
    get: function get() {
      var height = void 0;
      var media = this.media;
      if (media) {
        height = media.height || media.clientHeight || media.offsetHeight;
        height *= CapLevelController.contentScaleFactor;
      }
      return height;
    }
  }], [{
    key: 'isLevelAllowed',
    value: function isLevelAllowed(level) {
      var restrictedLevels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      return restrictedLevels.indexOf(level) === -1;
    }
  }, {
    key: 'getMaxLevelByMediaSize',
    value: function getMaxLevelByMediaSize(levels, width, height) {
      if (!levels || levels && !levels.length) {
        return -1;
      }

      // Levels can have the same dimensions but differing bandwidths - since levels are ordered, we can look to the next
      // to determine whether we've chosen the greatest bandwidth for the media's dimensions
      var atGreatestBandiwdth = function atGreatestBandiwdth(curLevel, nextLevel) {
        if (!nextLevel) {
          return true;
        }
        return curLevel.width !== nextLevel.width || curLevel.height !== nextLevel.height;
      };

      // If we run through the loop without breaking, the media's dimensions are greater than every level, so default to
      // the max level
      var maxLevelIndex = levels.length - 1;

      for (var i = 0; i < levels.length; i += 1) {
        var level = levels[i];
        if ((level.width >= width || level.height >= height) && atGreatestBandiwdth(level, levels[i + 1])) {
          maxLevelIndex = i;
          break;
        }
      }

      return maxLevelIndex;
    }
  }, {
    key: 'contentScaleFactor',
    get: function get() {
      var pixelRatio = 1;
      try {
        pixelRatio = window.devicePixelRatio;
      } catch (e) {}
      return pixelRatio;
    }
  }]);

  return CapLevelController;
}(_eventHandler2.default);

exports.default = CapLevelController;