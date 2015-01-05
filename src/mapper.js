var Utils = require('./utils');

/**
 * Mapper constructor
 * @param manifest {Object} with host and resources
 * @param gateway {Object} with an implementation of {Mappersmith.Gateway}
 * @param bodyAttr {String}, name of the body attribute used for HTTP methods
 *        such as POST and PUT
 */
var Mapper = function(manifest, Gateway, bodyAttr) {
  this.manifest = manifest;
  this.host = this.manifest.host;
  this.Gateway = Gateway;
  this.bodyAttr = bodyAttr;
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
        descriptor.path,
        descriptor.processor
      );

      return context;

    }.bind(this), {name: resourceName, methods: {}});
  },

  urlFor: function(path, urlParams) {
    // using `Utils.extend` avoids undesired changes to `urlParams`
    var params = Utils.extend({}, urlParams);
    var normalizedPath = /^\//.test(path) ? path : '/' + path;
    var host = this.host.replace(/\/$/, '');

    // does not includes the body param into the URL
    delete params[this.bodyAttr];

    Object.keys(params).forEach(function(key) {
      var value = params[key];
      var pattern = '\{' + key + '\}';

      if (new RegExp(pattern).test(normalizedPath)) {
        normalizedPath = normalizedPath.replace('\{' + key + '\}', value);
        delete params[key];
      }
    });

    var paramsString = Utils.params(params);
    if (paramsString.length !== 0) {
      paramsString = '?' + paramsString;
    }

    return host + normalizedPath + paramsString;
  },

  newGatewayRequest: function(method, path, processor) {
    return function(params, callback, opts) {
      if (typeof params === 'function') {
        opts = callback;
        callback = params;
        params = undefined;
      }

      var body = (params || {})[this.bodyAttr];
      var gatewayOpts = Utils.extend({}, {
        url: this.urlFor(path, params),
        method: method,
        processor: processor,
        params: params,
        body: body,
        opts: opts
      })

      return new this.Gateway(gatewayOpts).
        success(callback).
        call();

    }.bind(this);
  }

}

module.exports = Mapper;
