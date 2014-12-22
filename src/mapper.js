var Utils = require('./utils');

var Mapper = function(manifest, Gateway) {
  this.manifest = manifest;
  this.Gateway = Gateway;
  this.host = this.manifest.host;
}

Mapper.prototype = {

  build: function() {
    return Object.keys(this.manifest.resources || {}).
      map(function(name) { return this.buildResource(name) }.bind(this)).
      reduce(function(context, resource) {
        context[resource.name] = resource.methods;
        return context;
      }, {});
  },

  buildResource: function(resourceName) {
    var methods = this.manifest.resources[resourceName];
    return Object.keys(methods).reduce(function(context, methodName) {

      var descriptor = methods[methodName];
      if ( typeof(descriptor) === 'string' ) {

        var compactDefinitionMethod = descriptor.match( /^(get|head|post|delete|put|patch):(.*)/ )
        if (compactDefinitionMethod != null) {
          descriptor = {method: compactDefinitionMethod[1], path: compactDefinitionMethod[2]};

        } else {
          descriptor = {method: 'get', path: descriptor};
        }
      }

      var httpMethod = (descriptor.method || 'get').toLowerCase();

      context.methods[methodName] = this.newGatewayRequest(
        httpMethod,
        descriptor.path
      );

      return context;

    }.bind(this), {name: resourceName, methods: {}});
  },

  urlFor: function(path, urlParams) {
    // using `Utils.extend` avoids undesired changes to `urlParams`
    var params = Utils.extend({}, urlParams);
    var normalizedPath = /^\//.test(path) ? path : '/' + path;
    var host = this.host.replace(/\/$/, '');

    Object.keys(params).forEach(function(key) {
      var value = params[key];
      var pattern = '\{' + key + '\}';

      if (new RegExp(pattern).test(normalizedPath)) {
        normalizedPath = normalizedPath.replace('\{' + key + '\}', value);
        delete params[key];
      }
    });

    var paramsString = Object.keys(params).
      filter(function(key) { return key !== undefined && key !== null}).
      map(function(key){ return key + '=' + params[key]}).
      join('&');

    if (paramsString.length !== 0)
      paramsString = '?' + paramsString;

    return host + normalizedPath + paramsString;
  },

  newGatewayRequest: function(method, path) {
    return function(params, callback, opts) {
      if (typeof params === 'function') {
        opts = callback;
        callback = params;
        params = undefined;
      }

      var gateway = new this.Gateway({
        url: this.urlFor(path, params),
        method: method,
        params: params,
        opts: opts
      });

      return gateway.success(callback).call();

    }.bind(this);
  }

}

module.exports = Mapper;
