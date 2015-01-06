var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var JQueryGateway = module.exports = CreateGateway({

  init: function() {
    if (window.jQuery === undefined) {
      throw new Utils.Exception(
        'JQueryGateway requires jQuery but it was not found! ' +
        'Change the gateway implementation or add jQuery on the page'
      );
    }
  },

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
    return this._performRequest('POST');
  },

  put: function() {
    return this._performRequest('PUT');
  },
  
  patch: function() {
    return this._performRequest('PATCH');
  },

  delete: function() {
    return this._performRequest('DELETE');
  },

  _performRequest: function(method) {
    var defaults = {type: method, data: Utils.params(this.body)};
    this.jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  }

});
