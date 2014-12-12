!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mappersmith=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Mapper = require('./src/mapper.js');

module.exports = {
  Request: require('./src/request'),
  VanillaRequest: require('./src/transport/vanillaRequest'),
  JQueryRequest: require('./src/transport/jqueryRequest'),
  forge: function(manifest, transport) {
    return new Mapper(manifest, transport).build();
  }
}

},{"./src/mapper.js":3,"./src/request":4,"./src/transport/jqueryRequest":5,"./src/transport/vanillaRequest":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var HttpGateway = require('./httpGateway');
var VanillaRequest = require('./transport/vanillaRequest');

var Mapper = function(manifest, transport) {
  this.manifest = manifest;
  this.gateway = new HttpGateway(transport || VanillaRequest);
  this.host = this.manifest.host;
}

Mapper.prototype = {

  build: function() {
    return Object.keys(this.manifest.resources).
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
      var httpMethod = (descriptor.method || 'get').toLowerCase();

      context.methods[methodName] = this.gateway[httpMethod](
        this.urlFor.bind(this),
        descriptor.path
      );

      return context;

    }.bind(this), {name: resourceName, methods: {}});
  },

  urlFor: function(path, urlParams) {
    var params = urlParams || {};
    var normalizedPath = /^\//.test(path) ? path : '/' + path;

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

    return this.host + normalizedPath + paramsString;
  }

}

module.exports = Mapper;

},{"./httpGateway":2,"./transport/vanillaRequest":6}],4:[function(require,module,exports){
var Utils = require('./utils');

var Request = function(url, callback) {
  this.successCallback = callback || Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
  return this.ajax(url);
}

Request.prototype = {

  fail: function(callback) {
    this.failCallback = callback;
    return this;
  },

  complete: function(callback) {
    this.completeCallback = callback;
    return this;
  },

  ajax: function(url) {
    setTimeout(function() {
      true ? this.successCallback() : this.failCallback();
      this.completeCallback();
    }.bind(this), 0);

    return this;
  }

}

module.exports = Request;

},{"./utils":7}],5:[function(require,module,exports){
var Utils = require('../utils');
var Request = require('../request');

var JQueryRequest = function() {
  return Request.apply(this, arguments);
}

JQueryRequest.prototype = Utils.extend({}, Request.prototype, {

  ajax: function(url) {
    $.getJSON(url, function() {
      this.successCallback.apply(this, arguments);
    }.bind(this)).
    fail(function() {
      this.failCallback.apply(this, arguments)
    }.bind(this)).
    always(function() {
      this.completeCallback.apply(this, arguments)
    }.bind(this));

    return this;
  }

});

module.exports = JQueryRequest;

},{"../request":4,"../utils":7}],6:[function(require,module,exports){
var Utils = require('../utils');
var Request = require('../request');

var VanillaRequest = function() {
  return Request.apply(this, arguments);
}

VanillaRequest.prototype = Utils.extend({}, Request.prototype, {

  ajax: function(url) {
    request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400){
        data = JSON.parse(request.responseText);
        this.successCallback(data);

      } else {
        this.failCallback(request);
      }

      this.completeCallback(data);

    }.bind(this);

    request.onerror = function() {
      this.failCallback.apply(this, arguments);
      this.completeCallback.apply(this, arguments);
    }.bind(this);

    request.send();
  }

});

module.exports = VanillaRequest;

},{"../request":4,"../utils":7}],7:[function(require,module,exports){
var Utils = module.exports = {
  noop: function() {},
  extend: function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }

    return out;
  }
}

},{}]},{},[1])(1)
});