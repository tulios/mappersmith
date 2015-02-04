var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var VanillaGateway = CreateGateway({

  get: function() {
    var request = new XMLHttpRequest();
    this._configureCallbacks(request);
    request.open('GET', this.url, true);
    request.send();
  },

  post: function() {
    this._performRequest('POST');
  },

  put: function() {
    this._performRequest('PUT');
  },

  patch: function() {
    this._performRequest('PATCH');
  },

  delete: function() {
    this._performRequest('DELETE');
  },

  _performRequest: function(method) {
    var emulateHTTP = this.shouldEmulateHTTP(method);
    var requestMethod = method;
    var request = new XMLHttpRequest();
    this._configureCallbacks(request);

    if (emulateHTTP) {
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      requestMethod = 'POST';
    }

    request.open(requestMethod, this.url, true);
    if (emulateHTTP) request.setRequestHeader('X-HTTP-Method-Override', method);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var args = [];
    if (this.body !== undefined) {
      args.push(Utils.params(this.body));
    }

    request.send.apply(request, args);
  },

  _configureCallbacks: function(request) {
    request.onload = function() {
      var data = null;

      try {
        if (request.status >= 200 && request.status < 400) {
          if (this._isContentTypeJSON(request)) {
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

  _isContentTypeJSON: function(request) {
    return /application\/json/.test(request.getResponseHeader('Content-Type'));
  }

});

module.exports = VanillaGateway;
