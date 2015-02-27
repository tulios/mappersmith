var Utils = require('./utils');

/**
 * Gateway constructor
 * @param args {Object} with url, method, params and opts
 *
 * * url: The full url of the resource, including host and query strings
 * * method: The name of the HTTP method (get, head, post, put, delete and patch)
 *           to be used, in lower case.
 * * params: request params (query strings, url params and body)
 * * opts: gateway implementation specific options
 */
var Gateway = function(args) {
  this.url = args.url;
  this.method = args.method;
  this.processor = args.processor;
  this.params = args.params || {};
  this.body = args.body;
  this.opts = args.opts || {};

  this.timeStart = null;
  this.timeEnd = null;
  this.timeElapsed = null;

  this.successCallback = Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
}

Gateway.prototype = {

  call: function() {
    this.timeStart = Utils.performanceNow();
    this[this.method].apply(this, arguments);
    return this;
  },

  success: function(callback) {
    this.successCallback = function(data, extraStats) {
      this.timeEnd = Utils.performanceNow();
      this.timeElapsed = this.timeEnd - this.timeStart;
      if (this.processor) data = this.processor(data);

      var stats = Utils.extend({
        url: this.url,
        timeElapsed: this.timeElapsed,
        timeElapsedHumanized: Utils.humanizeTimeElapsed(this.timeElapsed)
      }, extraStats);

      callback(data, stats);
    }.bind(this);

    return this;
  },

  fail: function(callback) {
    this.failCallback = callback;
    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  shouldEmulateHTTP: function(method) {
    return !!(this.opts.emulateHTTP && /^(delete|put|patch)/i.test(method));
  },

  get: function() {
    throw new Utils.Exception('Gateway#get not implemented');
  },

  post: function() {
    throw new Utils.Exception('Gateway#post not implemented');
  },

  put: function() {
    throw new Utils.Exception('Gateway#put not implemented');
  },

  delete: function() {
    throw new Utils.Exception('Gateway#delete not implemented');
  },

  patch: function() {
    throw new Utils.Exception('Gateway#patch not implemented');
  }

}

module.exports = Gateway;
