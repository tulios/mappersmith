!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mappersmith=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),

  forge: require('./src/forge'),
  createGateway: require('./src/create-gateway')
}

},{"./src/create-gateway":2,"./src/forge":3,"./src/gateway":4,"./src/gateway/jquery-gateway":5,"./src/gateway/vanilla-gateway":6,"./src/mapper":7,"./src/utils":8}],2:[function(require,module,exports){
var Utils = require('./utils');
var Gateway = require('./gateway');

module.exports = function(methods) {
  var newGateway = function() {
    this.init && this.init();
    return Gateway.apply(this, arguments);
  }

  newGateway.prototype = Utils.extend({}, Gateway.prototype, methods);
  return newGateway;
}

},{"./gateway":4,"./utils":8}],3:[function(require,module,exports){
var Mapper = require('./mapper');
var VanillaGateway = require('./gateway/vanilla-gateway');

module.exports = function(manifest, gateway, bodyAttr) {
  return new Mapper(
    manifest,
    gateway || VanillaGateway,
    bodyAttr || 'body'
  ).build();
}

},{"./gateway/vanilla-gateway":6,"./mapper":7}],4:[function(require,module,exports){
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
    if (this.processor !== undefined) {
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

  shouldEmulateHTTP: function(method) {
    return !!(this.opts.emulateHTTP && /^(delete|put|patch)/i.test(method));
  },

  get: function() {
    throw new Utils.Exception('Gateway#get not implemented');
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

},{"./utils":8}],5:[function(require,module,exports){
var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var JQueryGateway = CreateGateway({

  init: function() {
    if (window.jQuery === undefined) {
      throw new Utils.Exception(
        'JQueryGateway requires jQuery but it was not found! ' +
        'Change the gateway implementation or add jQuery on the page'
      );
    }
  },

  get: function() {
    this._jQueryAjax(this.opts);
    return this;
  },

  post: function() {
    return this._performRequest('POST');
  },

  put: function() {
    return this._performRequest('PUT');
  },

  patch: function() {
    return this._performRequest('PATCH');
  },

  delete: function() {
    return this._performRequest('DELETE');
  },

  _performRequest: function(method) {
    var requestMethod = method;

    if (this.shouldEmulateHTTP(method)) {
      requestMethod = 'POST';
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      this.opts.headers = Utils.extend(this.opts.header, {'X-HTTP-Method-Override': method});
    }

    var defaults = {type: requestMethod, data: Utils.params(this.body)};
    this._jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  },

  _jQueryAjax: function(config) {
    jQuery.ajax(Utils.extend({url: this.url}, config)).
    done(function() { this.successCallback.apply(this, arguments) }.bind(this)).
    fail(function() { this.failCallback.apply(this, arguments) }.bind(this)).
    always(function() { this.completeCallback.apply(this, arguments) }.bind(this));
  }

});

module.exports = JQueryGateway;

},{"../create-gateway":2,"../utils":8}],6:[function(require,module,exports){
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

},{"../create-gateway":2,"../utils":8}],7:[function(require,module,exports){
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
        url: this.urlFor(descriptor.path, params),
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

},{"./utils":8}],8:[function(require,module,exports){
var Utils = {
  r20: /%20/g,
  noop: function() {},

  isObjEmpty: function(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) return false;
    }

    return true;
  },

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

module.exports = Utils;

},{}]},{},[1])(1)
});