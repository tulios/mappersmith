var Utils = require('../utils');
var Gateway = require('../gateway');

var JQueryGateway = function() {
  if (window.jQuery === undefined) {
    throw new Utils.Exception(
      'JQueryGateway requires jQuery but it was not found! ' +
      'Change the gateway implementation or add jQuery on the page'
    );
  }

  return Gateway.apply(this, arguments);
}

JQueryGateway.prototype = Utils.extend({}, Gateway.prototype, {

  jQueryAjax: function(config) {
    jQuery.ajax(Utils.extend({url: this.url}, config)).
      done(function() { this.successCallback.apply(this, arguments) }.bind(this)).
      fail(function() { this.failCallback.apply(this, arguments) }.bind(this)).
      always(function() { this.completeCallback.apply(this, arguments) }.bind(this));
  },

  get: function() {
    this.jQueryAjax(this.opts);
    return this;
  },

  post: function() {
    var defaults = {type: 'POST', data: Utils.params(this.body)};
    this.jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  },

  put: function() {
    var defaults = {type: 'PUT', data: Utils.params(this.body)};
    this.jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  }

});

module.exports = JQueryGateway;
