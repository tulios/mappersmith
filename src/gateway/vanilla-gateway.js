var Utils = require('../utils');
var Gateway = require('../gateway');

var VanillaGateway = function() {
  return Gateway.apply(this, arguments);
}

VanillaGateway.prototype = Utils.extend({}, Gateway.prototype, {

  get: function(url) {
    var request = new XMLHttpRequest();

    request.onload = function() {
      var data = null;

      try {
        if (request.status >= 200 && request.status < 400) {
          data = JSON.parse(request.responseText);
          this.successCallback(data);

        } else {
          this.failCallback(request);
        }
      } catch(e) {
        this.failCallback(request);

      } finally {
        this.completeCallback(data);
      }

    }.bind(this);

    request.onerror = function() {
      this.failCallback.apply(this, arguments);
      this.completeCallback.apply(this, arguments);
    }.bind(this);

    request.open('GET', url, true);
    request.send();
  }

});

module.exports = VanillaGateway;
