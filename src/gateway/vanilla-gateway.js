var Utils = require('../utils');
var Gateway = require('../gateway');

var VanillaGateway = function() {
  return Gateway.apply(this, arguments);
}

VanillaGateway.prototype = Utils.extend({}, Gateway.prototype, {

  get: function(url) {
    request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400){
        data = JSON.parse(request.responseText);
        this.successCallback(data);

      } else {
        this.failCallback(request);
      }

      this.completeCallback(data);

    }.bind(this);

    request.onerror = function() {
      this.failCallback.apply(this, arguments);
      this.completeCallback.apply(this, arguments);
    }.bind(this);

    request.send();
  }

});

module.exports = VanillaGateway;
