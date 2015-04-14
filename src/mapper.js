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
  this.rules = this.manifest.rules || [];
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

      // Compact Syntax
      if (typeof(descriptor) === 'string') {
        var compactDefinitionMethod = descriptor.match(/^(get|post|delete|put|patch):(.*)/);
        if (compactDefinitionMethod != null) {
          descriptor = {method: compactDefinitionMethod[1], path: compactDefinitionMethod[2]};

        } else {
          descriptor = {method: 'get', path: descriptor};
        }
      }

      descriptor.method = (descriptor.method || 'get').toLowerCase();
      context.methods[methodName] = this.newGatewayRequest(descriptor);
      return context;

    }.bind(this), {name: resourceName, methods: {}});
  },

  urlFor: function(path, urlParams, host) {
    // using `Utils.extend` avoids undesired changes to `urlParams`
    var params = Utils.extend({}, urlParams);
    var normalizedPath = path;

    if (typeof host === "undefined" || host === null) {
      host = this.host;
    }
    
    if (host === false) {
      host = '';
    }

    host = host.replace(/\/$/, '');

    if (host !== '') {
      normalizedPath = /^\//.test(path) ? path : '/' + path;
    }
    
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

  newGatewayRequest: function(descriptor) {
    var rules = this.rules.
      filter(function(rule) {
        return rule.match === undefined || rule.match.test(descriptor.path)
      }).
      reduce(function(context, rule) {
        var mergedGateway = Utils.extend(context.gateway, rule.values.gateway);
        context = Utils.extend(context, rule.values);
        context.gateway = mergedGateway;
        return context;
      }, {});

    return function(params, callback, opts) {
      if (typeof params === 'function') {
        opts = callback;
        callback = params;
        params = undefined;
      }

      if (!!descriptor.params) {
        params = Utils.extend({}, descriptor.params, params);
      }

      opts = Utils.extend({}, opts, rules.gateway);
      if(Utils.isObjEmpty(opts)) opts = undefined;

      var body = (params || {})[this.bodyAttr];
      var gatewayOpts = Utils.extend({}, {
        url: this.urlFor(descriptor.path, params, descriptor.host),
        method: descriptor.method,
        processor: descriptor.processor || rules.processor,
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
