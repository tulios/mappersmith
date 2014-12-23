var Utils = require('../utils');
var Gateway = require('../gateway');

var VanillaGateway = function() {
  return Gateway.apply(this, arguments);
}

VanillaGateway.prototype = Utils.extend({}, Gateway.prototype, {

  configureCallbacks: function(request) {
    request.onload = function() {
      var data = null;

      try {
        if (request.status >= 200 && request.status < 400) {
          if (request.getResponseHeader('Content-Type') === 'application/json') {
            data = JSON.parse(request.responseText);

          } else {
            data = request.responseText;
          }

          this.successCallback(data);

        } else {
          this.failCallback(request);
        }
      } catch(e) {
        this.failCallback(request);

      } finally {
        this.completeCallback(data, request);
      }

    }.bind(this);

    request.onerror = function() {
      this.failCallback.apply(this, arguments);
      this.completeCallback.apply(this, arguments);
    }.bind(this);

    if (this.opts.configure) {
      this.opts.configure(request);
    }
  },

  get: function() {
    var request = new XMLHttpRequest();
    this.configureCallbacks(request);
    request.open('GET', this.url, true);
    request.send();
  },

  post: function() {
    var request = new XMLHttpRequest();
    this.configureCallbacks(request);
    request.open('POST', this.url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var args = [];
    if (this.body !== undefined) {
      args.push(Utils.params(this.body));
    }

    request.send.apply(request, args);
  }

});

module.exports = VanillaGateway;
