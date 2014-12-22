var Utils = require('./utils');

var Gateway = function(url, method, opts) {
  this.url = url;
  this.method = method;
  this.opts = opts || {};

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
