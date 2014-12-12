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
    setTimeout(function() {
      true ? this.successCallback() : this.failCallback();
      this.completeCallback();
    }.bind(this), 0);

    return this;
  }

}

module.exports = Request;
