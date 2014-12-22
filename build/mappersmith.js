!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mappersmith=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper.js'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),
  forge: function(manifest, gateway) {
    return new this.Mapper(
      manifest,
      gateway || this.VanillaGateway
    ).build();
  }
}

},{"./src/gateway":2,"./src/gateway/jquery-gateway":3,"./src/gateway/vanilla-gateway":4,"./src/mapper.js":5,"./src/utils":6}],2:[function(require,module,exports){
var Utils = require('./utils');

/**
 * Gateway constructor
 * @param args {Object} with url, method, params and opts
 *
 * * url: The full url of the resource, including host and query strings
 * * method: The name of the HTTP method (get, head, post, put, delete and patch)
 *           to be used, in lower case.
 * * params: request params (query strings, url params and body)
 * * opts: gateway implementation specific options
 */
var Gateway = function(args) {
  this.url = args.url;
  this.method = args.method;
  this.processor = args.processor;
  this.params = args.params || {};
  this.body = args.body;
  this.opts = args.opts || {};

  this.successCallback = Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
}

Gateway.prototype = {

  call: function() {
    this[this.method].apply(this, arguments);
    return this;
  },

  success: function(callback) {
    if (this.processor != null) {
      this.successCallback = function(data) {
        callback(this.processor(data));
      }
    } else {
      this.successCallback = callback;
    }
    return this;
  },

  fail: function(callback) {
    this.failCallback = callback;
    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  get: function() {
    throw new Utils.Exception('Gateway#get not implemented');
  },

  head: function() {
    throw new Utils.Exception('Gateway#head not implemented');
  },

  post: function() {
    throw new Utils.Exception('Gateway#post not implemented');
  },

  put: function() {
    throw new Utils.Exception('Gateway#put not implemented');
  },

  delete: function() {
    throw new Utils.Exception('Gateway#delete not implemented');
  },

  patch: function() {
    throw new Utils.Exception('Gateway#patch not implemented');
  }

}

module.exports = Gateway;

},{"./utils":6}],3:[function(require,module,exports){
var Utils = require('../utils');
var Gateway = require('../gateway');

var JQueryGateway = function() {
  if (window.jQuery === undefined) {
    throw new Utils.Exception(
      'JQueryGateway requires jQuery but it was not found! ' +
      'Change the gateway implementation or add jQuery on the page'
    );
  }

  return Gateway.apply(this, arguments);
}

JQueryGateway.prototype = Utils.extend({}, Gateway.prototype, {

  get: function() {
    var defaults = {dataType: "json", url: this.url};
    var config = Utils.extend(defaults, this.opts);

    jQuery.ajax(config).
    done(function() { this.successCallback.apply(this, arguments) }.bind(this)).
    fail(function() { this.failCallback.apply(this, arguments) }.bind(this)).
    always(function() { this.completeCallback.apply(this, arguments) }.bind(this));

    return this;
  }

});

module.exports = JQueryGateway;

},{"../gateway":2,"../utils":6}],4:[function(require,module,exports){
var Utils = require('../utils');
var Gateway = require('../gateway');

var VanillaGateway = function() {
  return Gateway.apply(this, arguments);
}

VanillaGateway.prototype = Utils.extend({}, Gateway.prototype, {

  get: function() {
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

    if (this.opts.configure) {
      this.opts.configure(request);
    }

    request.open('GET', this.url, true);
    request.send();
  }

});

module.exports = VanillaGateway;

},{"../gateway":2,"../utils":6}],5:[function(require,module,exports){
var Utils = require('./utils');

/**
 * Mapper constructor
 * @param manifest {Object} with host and resources
 * @param gateway {Object} with an implementation of {Mappersmith.Gateway}
 * @param bodyAttr {String}, name of the body attribute used for HTTP methods
 *        such as POST and PUT. Default: 'body'
 */
var Mapper = function(manifest, Gateway, bodyAttr) {
  this.manifest = manifest;
  this.host = this.manifest.host;
  this.Gateway = Gateway;
  this.bodyAttr = bodyAttr || 'body';
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

},{"./utils":6}],6:[function(require,module,exports){
var Utils = module.exports = {
  r20: /%20/g,
  noop: function() {},

  extend: function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key) && arguments[i][key] !== undefined)
          out[key] = arguments[i][key];
      }
    }

    return out;
  },

  params: function(entry) {
    if (typeof entry !== 'object') {
      return entry;
    }

    var validKeys = function(entry) {
      return Object.keys(entry).
        filter(function(key) {
          return entry[key] !== undefined &&
                 entry[key] !== null
        });
    }

    var buildRecursive = function(key, value, suffix) {
      suffix = suffix || '';
      var isArray = Array.isArray(value);
      var isObject = typeof value === 'object';

      if (!isArray && !isObject) {
        return encodeURIComponent(key + suffix) + '=' + encodeURIComponent(value);
      }

      if (isArray) {
        return value.map(function(v) { return buildRecursive(key, v, suffix + '[]') }).
        join('&');
      }

      return validKeys(value).
        map(function(k) { return buildRecursive(key, value[k], suffix + '[' + k + ']') }).
        join('&');
    }

    return validKeys(entry).
      map(function(key) { return buildRecursive(key, entry[key]) }).
      join('&').
      replace(Utils.r20, '+');
  },

  Exception: function(message) {
    this.message = message;
    this.toString = function() { return '[Mappersmith] ' + this.message; }
  }
}

},{}]},{},[1])(1)
});