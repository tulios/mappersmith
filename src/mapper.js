var Utils = require('./utils');
var Env = require('./env');

/**
 * Mapper constructor
 * @param manifest {Object} with host and resources
 * @param gateway {Object} with an implementation of {Mappersmith.Gateway}
 * @param bodyAttr {String}, name of the body attribute used for HTTP methods
 *        such as POST and PUT
 */
var Mapper = function(manifest, Gateway, bodyAttr) {
  this.manifest = manifest;
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

  resolvePath: function(pathDefinition, urlParams) {
    // using `Utils.extend` avoids undesired changes to `urlParams`
    var params = Utils.extend({}, urlParams);
    var resolvedPath = pathDefinition;

    // does not includes the body param into the URL
    delete params[this.bodyAttr];

    Object.keys(params).forEach(function(key) {
      var value = params[key];
      var pattern = '\{' + key + '\}';

      if (new RegExp(pattern).test(resolvedPath)) {
        resolvedPath = resolvedPath.replace('\{' + key + '\}', value);
        delete params[key];
      }
    });

    var paramsString = Utils.params(params);
    if (paramsString.length !== 0) {
      paramsString = '?' + paramsString;
    }

    return resolvedPath + paramsString;
  },

  resolveHost: function(value) {
    if (typeof value === "undefined" || value === null) value = this.manifest.host;
    if (value === false) value = '';
    return value.replace(/\/$/, '');
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
      if (Utils.isObjEmpty(opts)) opts = undefined;

      var host = this.resolveHost(descriptor.host);
      var path = this.resolvePath(descriptor.path, params);

      if (host !== '') {
        path = /^\//.test(path) ? path : '/' + path;
      }

      var fullUrl = host + path;
      var body = (params || {})[this.bodyAttr];

      var gatewayOpts = Utils.extend({}, {
        url: fullUrl,
        host: host,
        path: path,
        params: params,

        body: body,
        method: descriptor.method,

        processor: descriptor.processor || rules.processor,
        opts: opts
      });

      var gateway = new this.Gateway(gatewayOpts);
      if (Env.USE_PROMISES) return gateway.promisify();
      return gateway.success(callback).call();

    }.bind(this);
  }

}

module.exports = Mapper;
