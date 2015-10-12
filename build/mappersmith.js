(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Mappersmith = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Mappersmith 0.9.0
 * https://github.com/tulios/mappersmith
 */
module.exports = {
  Env: require('./src/env'),
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),

  forge: require('./src/forge'),
  createGateway: require('./src/create-gateway')
}

},{"./src/create-gateway":2,"./src/env":3,"./src/forge":4,"./src/gateway":5,"./src/gateway/jquery-gateway":6,"./src/gateway/vanilla-gateway":7,"./src/mapper":8,"./src/utils":9}],2:[function(require,module,exports){
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

},{"./gateway":5,"./utils":9}],3:[function(require,module,exports){
module.exports = {
  USE_FIXTURES: false,
  USE_PROMISES: false,
  Fixture: null,
  Promise: typeof Promise === 'function' ? Promise : null
}

},{}],4:[function(require,module,exports){
var Mapper = require('./mapper');
var VanillaGateway = require('./gateway/vanilla-gateway');

module.exports = function(manifest, gateway, bodyAttr) {
  return new Mapper(
    manifest,
    gateway || VanillaGateway,
    bodyAttr || 'body'
  ).build();
}

},{"./gateway/vanilla-gateway":7,"./mapper":8}],5:[function(require,module,exports){
var Env = require('./env');
var Utils = require('./utils');
var Promise = require('./env').Promise;

/**
 * Gateway constructor
 * @param args {Object} with url, method, params and opts
 *
 * * url: The full url of the resource, including host and query strings
 * * host: The resolved host
 * * path: The resolved path (e.g. /path?a=true&b=3)
 * * method: The name of the HTTP method (get, head, post, put, delete and patch)
 *           to be used, in lower case.
 * * params: request params (query strings, url params and body)
 * * opts: gateway implementation specific options
 */
var Gateway = function(args) {
  this.url = args.url;
  this.host = args.host;
  this.path = args.path;
  this.params = args.params || {};

  this.method = args.method;
  this.body = args.body;
  this.processor = args.processor;
  this.opts = args.opts || {};

  this.timeStart = null;
  this.timeEnd = null;
  this.timeElapsed = null;

  this.successCallback = Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
}

Gateway.prototype = {

  call: function() {
    this.timeStart = Utils.performanceNow();

    if (Env.USE_FIXTURES && Env.Fixture) {
      this.callWithFixture();

    } else {
      this[this.method].apply(this, arguments);
    }

    return this;
  },

  callWithFixture: function() {
    var resource = this.getRequestedResource();
    var entry = Env.Fixture.lookup(this.method, resource);

    if (!entry) {
      throw new Utils.Exception(
        'No fixture provided for ' + JSON.stringify(resource)
      );
    }

    setTimeout(function() {
      if (entry.isSuccess()) {
        this.successCallback(entry.data());

      } else {
        this.failCallback(entry.data());
      }
    }.bind(this), 1);
  },

  promisify: function(thenCallback) {
    var promise = new Promise(function(resolve, reject) {
      this.success(function(data, stats) {
        resolve({data: data, stats: stats});
      });
      this.fail(function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        var request = args.shift();
        reject({request: request, err: args});
      });

      this.call();
    }.bind(this));

    if (thenCallback !== undefined) return promise.then(thenCallback);
    return promise;
  },

  success: function(callback) {
    this.successCallback = function(data, extraStats) {
      this.timeEnd = Utils.performanceNow();
      this.timeElapsed = this.timeEnd - this.timeStart;
      if (this.processor) data = this.processor(data);
      var requestedResource = this.getRequestedResource();

      var stats = Utils.extend({
        timeElapsed: this.timeElapsed,
        timeElapsedHumanized: Utils.humanizeTimeElapsed(this.timeElapsed)
      }, requestedResource, extraStats);

      callback(data, stats);
    }.bind(this);

    return this;
  },

  fail: function(callback) {
    this.failCallback = function() {
      var args = [this.getRequestedResource()];

      // remember, `arguments` isn't an array
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      callback.apply(this, args);
    }.bind(this);

    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  getRequestedResource: function() {
    return {
      url: this.url,
      host: this.host,
      path: this.path,
      params: this.params
    }
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

},{"./env":3,"./utils":9}],6:[function(require,module,exports){
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
      this.opts.headers = Utils.extend({'X-HTTP-Method-Override': method}, this.opts.headers);
    }

    var defaults = {type: requestMethod, data: Utils.params(this.body)};
    this._jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  },

  _jQueryAjax: function(config) {
    jQuery.ajax(Utils.extend({url: this.url}, config)).
      done(function() { this.successCallback(arguments[0]) }.bind(this)).
      fail(function() { this.failCallback.apply(this, arguments) }.bind(this)).
      always(function() { this.completeCallback.apply(this, arguments) }.bind(this));
  }

});

module.exports = JQueryGateway;

},{"../create-gateway":2,"../utils":9}],7:[function(require,module,exports){
var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var VanillaGateway = CreateGateway({

  get: function() {
    var request = new XMLHttpRequest();
    this._configureCallbacks(request);
    request.open('GET', this.url, true);
    this._setHeaders(request);
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
    this._setHeaders(request);

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

  _setHeaders: function(request) {
    var headers = Utils.extend({}, this.opts.headers);
    Object.keys(headers).forEach(function(headerName) {
      request.setRequestHeader(headerName, headers[headerName]);
    });
  },

  _isContentTypeJSON: function(request) {
    return /application\/json/.test(request.getResponseHeader('Content-Type'));
  }

});

module.exports = VanillaGateway;

},{"../create-gateway":2,"../utils":9}],8:[function(require,module,exports){
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
      if (Env.USE_PROMISES) return gateway.promisify(callback);
      return gateway.success(callback).call();

    }.bind(this);
  }

}

module.exports = Mapper;

},{"./env":3,"./utils":9}],9:[function(require,module,exports){
if (typeof window !== 'undefined' && window !== null) {
  window.performance = window.performance || {};
  performance.now = (function() {
    return performance.now       ||
           performance.mozNow    ||
           performance.msNow     ||
           performance.oNow      ||
           performance.webkitNow ||
           function() { return new Date().getTime(); };
  })();
}

// avoid browserify shim
var _process;
try {_process = eval("process")} catch (e) {}

var hasProcessHrtime = function() {
  return (typeof _process !== 'undefined' && _process !== null) && _process.hrtime;
}

var getNanoSeconds, loadTime;
if (hasProcessHrtime()) {
  getNanoSeconds = function() {
    var hr = _process.hrtime();
    return hr[0] * 1e9 + hr[1];
  }
  loadTime = getNanoSeconds();
}

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

  /*
   * Gives time in miliseconds, but with sub-milisecond precision for Browser
   * and Nodejs
   */
  performanceNow: function() {
    if (hasProcessHrtime()) {
      return (getNanoSeconds() - loadTime) / 1e6;
    }

    return performance.now();
  },

  humanizeTimeElapsed: function(timeElapsed) {
    if (timeElapsed >= 1000.0) {
     return (timeElapsed / 1000.0).toFixed(2) + ' s';
   }

   return timeElapsed.toFixed(2) + ' ms';
  },

  Exception: function(message) {
    var err = new Error('[Mappersmith] ' + message);
    this.message = err.message;
    this.stack = err.stack;
    this.toString = function() { return this.message; }
  }
}

module.exports = Utils;

},{}]},{},[1])(1)
});