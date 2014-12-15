var Utils = require('./utils');

var Request = function(url, callback) {
  this.successCallback = callback || Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
  return this.ajax(url);
}

Request.prototype = {

  fail: function(callback) {
    this.failCallback = callback;
    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  ajax: function(url) {
    throw new Utils.Exception('Request#ajax not implemented');
  }

}

module.exports = Request;
