var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var url = require('url');
var http = require('http');
var https = require('https');

var NodeVanillaGateway = CreateGateway({

  performRequest: function(method) {
    var defaults = url.parse(this.url);
    var emulateHTTP = this.shouldEmulateHTTP(method);

    var requestMethod = emulateHTTP ? 'post' : method;
    var opts = Utils.extend({method: requestMethod}, defaults, this.opts);
    var canIncludeBody = !/get/i.test(method);

    if (emulateHTTP) {
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      opts.headers = Utils.extend({}, {
        'X-HTTP-Method-Override': method
      }, opts.headers);
    }

    var body = this.body ? Utils.params(this.body) : '';

    if (canIncludeBody) {
      opts.headers = Utils.extend({}, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length
      }, opts.headers);
    }

    var handler = http;
    if (defaults.protocol === 'https:') handler = https;

    var request = handler.request(opts, this.onResponse.bind(this));
    request.on('error', this.onError.bind(this));

    if (body) request.write(body);
    request.end();
  },

  onResponse: function(response) {
    var data = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) { data += chunk });
    response.on('end', function() {
      var status = response.statusCode;
      try {
        if (status >= 200 && status < 400) {
          if (this.isContentTypeJSON(response)) data = JSON.parse(data);
          this.successCallback(data, {responseHeaders: response.headers});

        } else {
          this.failCallback({status: status, args: [response]});
        }

      } catch(e) {
        this.failCallback({status: status, args: [response, e]});

      } finally {
        this.completeCallback(data, response);
      }

    }.bind(this));
  },

  onError: function() {
    this.failCallback({status: 400, args: arguments});
    this.completeCallback.apply(this, arguments);
  },

  isContentTypeJSON: function(response) {
    return /application\/json/.test(response.headers['content-type']);
  },

  get: function() {
    this.performRequest('GET');
  },

  post: function() {
    this.performRequest('POST');
  },

  put: function() {
    this.performRequest('PUT');
  },

  delete: function() {
    this.performRequest('DELETE');
  },

  patch: function() {
    this.performRequest('PATCH');
  }

});

module.exports = NodeVanillaGateway;
