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
  this.params = args.params || {};
  this.opts = args.opts || {};

  this.successCallback = Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
}

Gateway.prototype = {

  call: function() {
    this[this.method]();
    return this;
  },

  success: function(callback) {
    this.successCallback = callback;
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

  get: function() {
    throw new Utils.Exception('Gateway#get not implemented');
  },

  head: function() {
    throw new Utils.Exception('Gateway#head not implemented');
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
