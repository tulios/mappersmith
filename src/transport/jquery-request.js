var Utils = require('../utils');
var Request = require('../request');

var JQueryRequest = function() {
  return Request.apply(this, arguments);
}

JQueryRequest.prototype = Utils.extend({}, Request.prototype, {

  ajax: function(url) {
    $.getJSON(url, function() {
      this.successCallback.apply(this, arguments);
    }.bind(this)).
    fail(function() {
      this.failCallback.apply(this, arguments)
    }.bind(this)).
    always(function() {
      this.completeCallback.apply(this, arguments)
    }.bind(this));

    return this;
  }

});

module.exports = JQueryRequest;
