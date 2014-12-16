var Utils = require('../utils');
var Gateway = require('../gateway');

var JQueryGateway = function() {
  return Gateway.apply(this, arguments);
}

JQueryGateway.prototype = Utils.extend({}, Gateway.prototype, {

  get: function() {
    var defaults = {dataType: "json", url: this.url};
    var config = Utils.extend(defaults, this.opts);

    $.ajax(config).
    done(function() { this.successCallback.apply(this, arguments) }.bind(this)).
    fail(function() { this.failCallback.apply(this, arguments) }.bind(this)).
    always(function() { this.completeCallback.apply(this, arguments) }.bind(this));

    return this;
  }

});

module.exports = JQueryGateway;
