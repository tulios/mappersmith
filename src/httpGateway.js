var HttpGateway = function(transport) {
  this.RequestObject = transport;
}

HttpGateway.prototype = {
  get: function(urlGenerator, path) {
    return function(params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = undefined;
      }

      var url = urlGenerator(path, params);
      return new this.RequestObject(url, callback);
    }.bind(this);
  }
}

module.exports = HttpGateway;
