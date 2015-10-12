var Env = require('./env');
var Utils = require('./utils');
var Promise = require('./env').Promise;

/**
 * Gateway constructor
 * @param args {Object} with url, method, params and opts
 *
 * * url: The full url of the resource, including host and query strings
 * * host: The resolved host
 * * path: The resolved path (e.g. /path?a=true&b=3)
 * * method: The name of the HTTP method (get, head, post, put, delete and patch)
 *           to be used, in lower case.
 * * params: request params (query strings, url params and body)
 * * opts: gateway implementation specific options
 */
var Gateway = function(args) {
  this.url = args.url;
  this.host = args.host;
  this.path = args.path;
  this.params = args.params || {};

  this.method = args.method;
  this.body = args.body;
  this.processor = args.processor;
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

    if (Env.USE_FIXTURES && Env.Fixture) {
      this.callWithFixture();

    } else {
      this[this.method].apply(this, arguments);
    }

    return this;
  },

  callWithFixture: function() {
    var resource = this.getRequestedResource();
    var entry = Env.Fixture.lookup(this.method, resource);

    if (!entry) {
      throw new Utils.Exception(
        'No fixture provided for ' + JSON.stringify(resource)
      );
    }

    setTimeout(function() {
      if (entry.isSuccess()) {
        this.successCallback(entry.data());

      } else {
        this.failCallback(entry.data());
      }
    }.bind(this), 1);
  },

  promisify: function(thenCallback) {
    var promise = new Promise(function(resolve, reject) {
      this.success(function(data, stats) {
        resolve({data: data, stats: stats});
      });
      this.fail(function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        var request = args.shift();
        reject({request: request, err: args});
      });

      this.call();
    }.bind(this));

    if (thenCallback !== undefined) return promise.then(thenCallback);
    return promise;
  },

  success: function(callback) {
    this.successCallback = function(data, extraStats) {
      this.timeEnd = Utils.performanceNow();
      this.timeElapsed = this.timeEnd - this.timeStart;
      if (this.processor) data = this.processor(data);
      var requestedResource = this.getRequestedResource();

      var stats = Utils.extend({
        timeElapsed: this.timeElapsed,
        timeElapsedHumanized: Utils.humanizeTimeElapsed(this.timeElapsed)
      }, requestedResource, extraStats);

      callback(data, stats);
    }.bind(this);

    return this;
  },

  fail: function(callback) {
    this.failCallback = function() {
      var args = [this.getRequestedResource()];

      // remember, `arguments` isn't an array
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      callback.apply(this, args);
    }.bind(this);

    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  getRequestedResource: function() {
    return {
      url: this.url,
      host: this.host,
      path: this.path,
      params: this.params
    }
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
