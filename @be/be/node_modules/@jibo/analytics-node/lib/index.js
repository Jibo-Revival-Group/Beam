var assert = require('assert')
var axios = require('axios');
var clone = require('clone')
var noop = function () {}
var uid = require('crypto-token')
var version = require('../package.json').version
var validate = require('@segment/loosely-validate-event')
var removeSlash = require('remove-trailing-slash')

global.setImmediate = global.setImmediate || process.nextTick.bind(process)

/**
 * Expose an `Analytics` client.
 */

module.exports = Analytics

/**
 * Initialize a new `Analytics` with your Segment project's `writeKey` and an
 * optional dictionary of `options`.
 *
 * @param {String} writeKey
 * @param {Object} [options] (optional)
 *   @property {Number} flushAt (default: 20)
 *   @property {Number} flushAfter (default: 10000)
 *   @property {String} host (default: 'https://api.segment.io')
 */

function Analytics (writeKey, options) {
  if (!(this instanceof Analytics)) return new Analytics(writeKey, options)
  assert(writeKey, 'You must pass your Segment project\'s write key.')
  options = options || {}
  this.queue = []
  this.writeKey = writeKey
  this.host = removeSlash(options.host || 'https://api.segment.io')
  this.flushAt = Math.max(options.flushAt, 1) || 20
  this.flushAfter = options.flushAfter || 10000
}

/**
 * Send an identify `message`.
 *
 * @param {Object} message
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.identify = function (message, fn) {
  validate(message, 'identify')
  this.enqueue('identify', message, fn)
  return this
}

/**
 * Send a group `message`.
 *
 * @param {Object} message
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.group = function (message, fn) {
  validate(message, 'group')
  this.enqueue('group', message, fn)
  return this
}

/**
 * Send a track `message`.
 *
 * @param {Object} message
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.track = function (message, fn) {
  validate(message, 'track')
  this.enqueue('track', message, fn)
  return this
}

/**
 * Send a page `message`.
 *
 * @param {Object} message
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.page = function (message, fn) {
  validate(message, 'page')
  this.enqueue('page', message, fn)
  return this
}

/**
 * Send a screen `message`.
 *
 * @param {Object} message
 * @param {Function} fn (optional)
 * @return {Analytics}
 */

Analytics.prototype.screen = function (message, fn) {
  validate(message, 'screen')
  this.enqueue('screen', message, fn)
  return this
}

/**
 * Send an alias `message`.
 *
 * @param {Object} message
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.alias = function (message, fn) {
  validate(message, 'alias')
  this.enqueue('alias', message, fn)
  return this
}

/**
 * Flush the current queue and callback `fn(err, batch)`.
 *
 * @param {Function} [fn] (optional)
 * @return {Analytics}
 */

Analytics.prototype.flush = function (fn) {
  fn = fn || noop
  if (!this.queue.length) return setImmediate(fn)

  var items = this.queue.splice(0, this.flushAt)
  var fns = items.map(function (_) { return _.callback })
  var batch = items.map(function (_) { return _.message })

  var data = {
    batch: batch,
    timestamp: new Date(),
    sentAt: new Date()
  }

  var retries = 3;
  var errCodes = [
    'ECONNRESET',//Connection reset
    'ECONNREFUSED',//Connection refused
    'ETIMEDOUT',//Timeout
    'EADDRINFO',//Can't get address info
    'ESOCKETTIMEDOUT'//Socket timeout
  ];
  var responseErrs = [
    500,//internal server error
    502,//Bad gateway error
    503,
    504
  ];
  var _this = this;
  function send() {
    let err, response;
    axios.post(_this.host + '/v1/batch', data, {
      auth: {
        username: _this.writeKey,
        password: ''
      },
    })
    .then(r => response = r)
    .catch(e => {
        response = e.response
        err = e
    })
    .then(() => {
        //if further retries allowed and we think that trying again could succeed, then try again
        if (retries-- > 0 &&
            ((err && errCodes.indexOf(err.code) >= 0) ||
            (response && responseErrs.indexOf(response.status) >= 0))) {
            send();
        } else {
            err = err || error(response)
            fns.push(fn)
            fns.forEach(function (fn) { fn(err, data) })
        }
    });
  }
  //send the first time
  send();
}

/**
 * Add a `message` of type `type` to the queue and check whether it should be
 * flushed.
 *
 * @param {String} type
 * @param {Object} message
 * @param {Functino} [fn] (optional)
 * @api private
 */

Analytics.prototype.enqueue = function (type, message, fn) {
  fn = fn || noop
  message = clone(message)
  message.type = type
  message.context = Object.assign(message.context || {}, {
    library: {
      name: 'analytics-node',
      version: version
    }
  })

  message._metadata = Object.assign(message._metadata || {}, { nodeVersion: process.versions.node })

  if (!message.timestamp) message.timestamp = new Date()
  if (!message.messageId) message.messageId = 'node-' + uid(32)

  this.queue.push({
    message: message,
    callback: fn
  })

  if (this.queue.length >= this.flushAt) this.flush()
  if (this.timer) clearTimeout(this.timer)
  if (this.flushAfter) this.timer = setTimeout(this.flush.bind(this), this.flushAfter)
}

/**
 * Get an error from a `res`.
 *
 * @param {Object} res
 * @return {String}
 */

function error (res) {
  if (!res || !res.body || !res.body.error) return
  var body = res.data
  var msg = (body.error && body.error.message) || res.statusText + ' ' + res.data
  return new Error(msg)
}
