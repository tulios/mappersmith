var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var url = require('url');
var http = require('http');

var NodeVanillaGateway = CreateGateway({

  performRequest: function(method) {
    var defaults = url.parse(this.url);
    var opts = Utils.extend({method: method}, defaults, this.opts);

    var request = http.request(opts, this.onResponse.bind(this));
    request.on('error', this.onError.bind(this));

    if (this.body !== undefined) {
      request.write(Utils.params(this.body));
    }

    request.end();
  },

  onResponse: function(response) {
    var data = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) { data += chunk });
    response.on('end', function() {

      try {
        if (this.isContentTypeJSON(response)) data = JSON.parse(data);
        this.successCallback(data);

      } catch(e) {
        this.failCallback(e, response);

      } finally {
        this.completeCallback(data, response);
      }

    }.bind(this));
  },

  onError: function() {
    this.failCallback.apply(this, arguments);
  },

  isContentTypeJSON: function(response) {
    return /application\/json/.test(response.headers['content-type']);
  },

  get: function() {
    this.performRequest('GET');
  },

  post: function() {
    this.performRequest('POST')
  }

});

module.exports = NodeVanillaGateway;
