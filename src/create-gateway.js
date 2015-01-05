var Utils = require('./utils');
var Gateway = require('./gateway');

module.exports = function(methods) {
  var newGateway = function() {
    this.init && this.init();
    return Gateway.apply(this, arguments);
  }

  newGateway.prototype = Utils.extend({}, Gateway.prototype, methods);
  return newGateway;
}
