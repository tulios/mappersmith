var Utils = require('./utils');

var Gateway = function(url, method, callback) {
  this.successCallback = callback || Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
  return this[method](url);
}

Gateway.prototype = {

  fail: function(callback) {
    this.failCallback = callback;
    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  get: function(url) {
    throw new Utils.Exception('Gateway#get not implemented');
  },

  post: function(url) {
    throw new Utils.Exception('Gateway#post not implemented');
  },

  put: function(url) {
    throw new Utils.Exception('Gateway#put not implemented');
  },

  delete: function(url) {
    throw new Utils.Exception('Gateway#delete not implemented');
  },

  patch: function(url) {
    throw new Utils.Exception('Gateway#patch not implemented');
  }

}

module.exports = Gateway;
