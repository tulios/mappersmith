(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["mappersmith"] = factory();
	else
		root["mappersmith"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

exports.toQueryString = toQueryString;
exports.performanceNow = performanceNow;
exports.parseResponseHeaders = parseResponseHeaders;
exports.lowerCaseObjectKeys = lowerCaseObjectKeys;
exports.isPlainObject = isPlainObject;
var _process = void 0,
    getNanoSeconds = void 0,
    loadTime = void 0;
try {
  _process = eval('typeof __TEST_WEB__ === "undefined" && typeof process === "object" ? process : undefined');
} catch (e) {} // eslint-disable-line no-eval

var hasProcessHrtime = function hasProcessHrtime() {
  return typeof _process !== 'undefined' && _process !== null && _process.hrtime;
};

if (hasProcessHrtime()) {
  getNanoSeconds = function getNanoSeconds() {
    var hr = _process.hrtime();
    return hr[0] * 1e9 + hr[1];
  };
  loadTime = getNanoSeconds();
}

var R20 = /%20/g;

var validKeys = function validKeys(entry) {
  return Object.keys(entry).filter(function (key) {
    return entry[key] !== undefined && entry[key] !== null;
  });
};

var buildRecursive = function buildRecursive(key, value, suffix) {
  suffix = suffix || '';
  var isArray = Array.isArray(value);
  var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';

  if (!isArray && !isObject) {
    return encodeURIComponent(key + suffix) + '=' + encodeURIComponent(value);
  }

  if (isArray) {
    return value.map(function (v) {
      return buildRecursive(key, v, suffix + '[]');
    }).join('&');
  }

  return validKeys(value).map(function (k) {
    return buildRecursive(key, value[k], suffix + '[' + k + ']');
  }).join('&');
};

function toQueryString(entry) {
  if (!isPlainObject(entry)) {
    return entry;
  }

  return validKeys(entry).map(function (key) {
    return buildRecursive(key, entry[key]);
  }).join('&').replace(R20, '+');
}

/**
 * Gives time in miliseconds, but with sub-milisecond precision for Browser
 * and Nodejs
 */
function performanceNow() {
  if (hasProcessHrtime()) {
    return (getNanoSeconds() - loadTime) / 1e6;
  }

  return Date.now();
}

/**
 * borrowed from: {@link https://gist.github.com/monsur/706839}
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * {@link http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method}
 * This method parses that string into a user-friendly key/value pair object.
 */
function parseResponseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }

  var headerPairs = headerStr.split('\r\n');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    var index = headerPair.indexOf(': ');
    if (index > 0) {
      var key = headerPair.substring(0, index).toLowerCase();
      var val = headerPair.substring(index + 2).trim();
      headers[key] = val;
    }
  }
  return headers;
}

function lowerCaseObjectKeys(obj) {
  return Object.keys(obj).reduce(function (target, key) {
    target[key.toLowerCase()] = obj[key];
    return target;
  }, {});
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
var assign = exports.assign = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

var toString = Object.prototype.toString;
function isPlainObject(value) {
  return toString.call(value) === '[object Object]' && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
}

/**
 * borrowed from: {@link https://github.com/davidchambers/Base64.js}
 */
var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var btoa = exports.btoa = function btoa(input) {
  var output = '';
  var map = CHARS;
  var str = String(input);
  for (
  // initialize result and counter
  var block, charCode, idx = 0;
  // if the next str index does not exist:
  //   change the mapping table to "="
  //   check if d has no fractional digits
  str.charAt(idx | 0) || (map = '=', idx % 1);
  // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
  output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error("[Mappersmith] 'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configs = undefined;
exports.default = forge;

var _clientBuilder = __webpack_require__(4);

var _clientBuilder2 = _interopRequireDefault(_clientBuilder);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var configs = exports.configs = {
  Promise: typeof Promise === 'function' ? Promise : null,
  fetch: typeof fetch === 'function' ? fetch : null, // eslint-disable-line no-undef

  /**
   * Gateway implementation, it defaults to "lib/gateway/xhr" for browsers and
   * "lib/gateway/http" for node
   */
  gateway: null,
  gatewayConfigs: {
    /**
     * Setting this option will fake PUT, PATCH and DELETE requests with a HTTP POST. It will
     * add "_method" and "X-HTTP-Method-Override" with the original requested method
     * @default false
     */
    emulateHTTP: false,

    XHR: {
      /**
       * Indicates whether or not cross-site Access-Control requests should be made using credentials
       * such as cookies, authorization headers or TLS client certificates.
       * Setting withCredentials has no effect on same-site requests
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
       *
       * @default false
       */
      withCredentials: false,

      /**
       * For aditional configurations to the XMLHttpRequest object.
       * @param {XMLHttpRequest} xhr
       * @default null
       */
      configure: null
    },

    HTTP: {
      /**
       * For aditional configurations to the http/https module
       * For http: https://nodejs.org/api/http.html#http_http_request_options_callback
       * For https: https://nodejs.org/api/https.html#https_https_request_options_callback
       *
       * @param {object} options
       * @default null
       */
      configure: null
    },

    Fetch: {
      /**
       * Indicates whether the user agent should send cookies from the other domain in the case of cross-origin
       * requests. This is similar to XHR’s withCredentials flag, but with three available values (instead of two):
       *
       * "omit": Never send cookies.
       * "same-origin": Only send cookies if the URL is on the same origin as the calling script.
       * "include": Always send cookies, even for cross-origin calls.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
       *
       * @default "omit"
       */
      credentials: 'omit'
    }

    /**
     * @param {Object} manifest
     */
  } };function forge(manifest) {
  var GatewayClassFactory = function GatewayClassFactory() {
    return configs.gateway;
  };
  return new _clientBuilder2.default(manifest, GatewayClassFactory, configs.gatewayConfigs).build();
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

/**
 * @typedef Response
 * @param {Request} originalRequest, for auth it hides the password
 * @param {Integer} responseStatus
 * @param {String} responseData, defaults to null
 * @param {Object} responseHeaders, defaults to an empty object ({})
 */
function Response(originalRequest, responseStatus, responseData, responseHeaders) {
  if (originalRequest.requestParams && originalRequest.requestParams.auth) {
    var maskedAuth = (0, _utils.assign)({}, originalRequest.requestParams.auth, { password: '***' });
    this.originalRequest = originalRequest.enhance({ auth: maskedAuth });
  } else {
    this.originalRequest = originalRequest;
  }

  this.responseStatus = responseStatus;
  this.responseData = responseData !== undefined ? responseData : null;
  this.responseHeaders = responseHeaders || {};
  this.timeElapsed = null;
}

Response.prototype = {
  /**
   * @return {Request}
   */
  request: function request() {
    return this.originalRequest;
  },

  /**
   * @return {Integer}
   */
  status: function status() {
    // IE sends 1223 instead of 204
    if (this.responseStatus === 1223) {
      return 204;
    }

    return this.responseStatus;
  },

  /**
   * Returns true if status is greater or equal 200 or lower than 400
   *
   * @return {Boolean}
   */
  success: function success() {
    var status = this.status();
    return status >= 200 && status < 400;
  },

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers: function headers() {
    return (0, _utils.lowerCaseObjectKeys)(this.responseHeaders);
  },

  /**
   * Utility method to get a header value by name
   *
   * @param {String} name
   *
   * @return {String|Undefined}
   */
  header: function header(name) {
    return this.headers()[name.toLowerCase()];
  },

  /**
   * Returns the original response data
   */
  rawData: function rawData() {
    return this.responseData;
  },

  /**
   * Returns the response data, if "Content-Type" is "application/json"
   * it parses the response and returns an object
   *
   * @return {String|Object}
   */
  data: function data() {
    var data = this.responseData;

    if (this.isContentTypeJSON()) {
      try {
        data = JSON.parse(this.responseData);
      } catch (e) {}
    }

    return data;
  },
  isContentTypeJSON: function isContentTypeJSON() {
    return (/application\/json/.test(this.headers()['content-type'])
    );
  },

  /**
   * Enhances current Response returning a new Response
   *
   * @param {Object} extras
   *   @param {Integer} extras.status - it will replace the current status
   *   @param {String} extras.rawData - it will replace the current rawStatus
   *   @param {Object} extras.headers - it will be merged with current headers
   *
   * @return {Response}
   */
  enhance: function enhance(extras) {
    return new Response(this.request(), extras.status || this.status(), extras.rawData || this.rawData(), (0, _utils.assign)({}, this.headers(), extras.headers));
  }
};

exports.default = Response;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lib = __webpack_require__(1);
var _process, defaultGateway;

// Prevents webpack to load the nodejs processs polyfill
try {
  _process = eval('typeof process === "object" ? process : undefined');
} catch (e) {} // eslint-disable-line no-eval

if (typeof XMLHttpRequest !== 'undefined') {
  // For browsers use XHR adapter
  defaultGateway = __webpack_require__(8).default;
} else if (typeof _process !== 'undefined') {
  // For node use HTTP adapter
  defaultGateway = __webpack_require__(10).default;
}

lib.configs.gateway = defaultGateway;
module.exports = lib;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manifest = __webpack_require__(5);

var _manifest2 = _interopRequireDefault(_manifest);

var _request = __webpack_require__(7);

var _request2 = _interopRequireDefault(_request);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder(manifest, GatewayClassFactory, defaultGatewayConfigs) {
  if (!manifest) {
    throw new Error('[Mappersmith] invalid manifest (' + manifest + ')');
  }

  if (!GatewayClassFactory || !GatewayClassFactory()) {
    throw new Error('[Mappersmith] gateway class not configured (configs.gateway)');
  }

  this.manifest = new _manifest2.default(manifest, defaultGatewayConfigs);
  this.GatewayClassFactory = GatewayClassFactory;
}

ClientBuilder.prototype = {
  build: function build() {
    var _this = this;

    var client = { _manifest: this.manifest };

    this.manifest.eachResource(function (name, methods) {
      client[name] = _this.buildResource(name, methods);
    });

    return client;
  },
  buildResource: function buildResource(resourceName, methods) {
    var _this2 = this;

    return methods.reduce(function (resource, method) {
      return (0, _utils.assign)(resource, _defineProperty({}, method.name, function (requestParams) {
        var request = new _request2.default(method.descriptor, requestParams);
        return _this2.invokeMiddlewares(resourceName, method.name, request);
      }));
    }, {});
  },
  invokeMiddlewares: function invokeMiddlewares(resourceName, resourceMethod, initialRequest) {
    var middlewares = this.manifest.createMiddlewares({ resourceName: resourceName, resourceMethod: resourceMethod });
    var finalRequest = middlewares.reduce(function (request, middleware) {
      return middleware.request(request);
    }, initialRequest);

    var GatewayClass = this.GatewayClassFactory();
    var gatewayConfigs = this.manifest.gatewayConfigs;
    var callGateway = function callGateway() {
      return new GatewayClass(finalRequest, gatewayConfigs).call();
    };

    var execute = middlewares.reduce(function (next, middleware) {
      return function () {
        return middleware.response(next);
      };
    }, callGateway);

    return execute();
  }
};

exports.default = ClientBuilder;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _methodDescriptor = __webpack_require__(6);

var _methodDescriptor2 = _interopRequireDefault(_methodDescriptor);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {Object} obj.gatewayConfigs - default: base values from mappersmith
 *   @param {Object} obj.resources - default: {}
 *   @param {Array}  obj.middlewares - default: []
 */
function Manifest(obj) {
  var defaultGatewayConfigs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  this.host = obj.host;
  this.gatewayConfigs = (0, _utils.assign)({}, defaultGatewayConfigs, obj.gatewayConfigs);
  this.resources = obj.resources || {};
  this.middlewares = obj.middlewares || [];
}

Manifest.prototype = {
  eachResource: function eachResource(callback) {
    var _this = this;

    Object.keys(this.resources).forEach(function (resourceName) {
      var methods = _this.eachMethod(resourceName, function (methodName) {
        return {
          name: methodName,
          descriptor: _this.createMethodDescriptor(resourceName, methodName)
        };
      });

      callback(resourceName, methods);
    });
  },
  eachMethod: function eachMethod(resourceName, callback) {
    return Object.keys(this.resources[resourceName]).map(function (name) {
      return callback(name);
    });
  },
  createMethodDescriptor: function createMethodDescriptor(resourceName, methodName) {
    var definition = this.resources[resourceName][methodName];

    if (!definition || !definition.path) {
      throw new Error('[Mappersmith] path is undefined for resource "' + resourceName + '" method "' + methodName + '"');
    }

    return new _methodDescriptor2.default((0, _utils.assign)({ host: this.host }, definition));
  },

  /**
   * @param {Object} args
   *   @param {String} args.resourceName
   *   @param {String} args.resourceMethod
   *   @param {Boolean} args.mockRequest
   *
   * @return {Array<Object>}
   */
  createMiddlewares: function createMiddlewares() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var createInstance = function createInstance(middlewareFactory) {
      return (0, _utils.assign)({
        request: function request(_request) {
          return _request;
        },
        response: function response(next) {
          return next();
        }
      }, middlewareFactory(args));
    };

    return this.middlewares.map(function (middleware) {
      return createInstance(middleware);
    });
  }
};

exports.default = Manifest;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MethodDescriptor;
/**
 * @typedef MethodDescriptor
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {String} obj.path
 *   @param {String} obj.method
 *   @param {Object} obj.headers
 *   @param {Object} obj.params
 *   @param {String} obj.bodyAttr - body attribute name. Default: 'body'
 *   @param {String} obj.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} obj.authAttr - auth attribute name. Default: 'auth'
 *   @param {Number} obj.timeoutAttr - timeout attribute name. Default: 'timeout'
 */
function MethodDescriptor(obj) {
  this.host = obj.host;
  this.path = obj.path;
  this.method = obj.method || 'get';
  this.headers = obj.headers;
  this.params = obj.params;
  this.binary = obj.binary || false;

  this.bodyAttr = obj.bodyAttr || 'body';
  this.headersAttr = obj.headersAttr || 'headers';
  this.authAttr = obj.authAttr || 'auth';
  this.timeoutAttr = obj.timeoutAttr || 'timeout';
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

var REGEXP_DYNAMIC_SEGMENT = new RegExp('{([^}]+)}');

/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {Object} requestParams, defaults to an empty object ({})
 */
function Request(methodDescriptor, requestParams) {
  this.methodDescriptor = methodDescriptor;
  this.requestParams = requestParams || {};
}

Request.prototype = {
  /**
   * @return {Object}
   */
  params: function params() {
    var _this = this;

    var params = (0, _utils.assign)({}, this.methodDescriptor.params, this.requestParams);

    var isParam = function isParam(key) {
      return key !== _this.methodDescriptor.headersAttr && key !== _this.methodDescriptor.bodyAttr && key !== _this.methodDescriptor.authAttr && key !== _this.methodDescriptor.timeoutAttr;
    };

    return Object.keys(params).reduce(function (obj, key) {
      if (isParam(key)) {
        obj[key] = params[key];
      }
      return obj;
    }, {});
  },

  /**
   * Returns the HTTP method in lowercase
   *
   * @return {String}
   */
  method: function method() {
    return this.methodDescriptor.method.toLowerCase();
  },

  /**
   * Returns host name without trailing slash
   * Example: http://example.org
   *
   * @return {String}
   */
  host: function host() {
    return (this.methodDescriptor.host || '').replace(/\/$/, '');
  },

  /**
   * Returns path with parameters and leading slash.
   * Example: /some/path?param1=true
   *
   * @throws {Error} if any dynamic segment is missing.
   * Example:
   * Imagine the path '/some/{name}', the error will be similar to:
   * '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
   *
   * @return {String}
   */
  path: function path() {
    var path = this.methodDescriptor.path;

    if (this.methodDescriptor.path[0] !== '/') {
      path = '/' + this.methodDescriptor.path;
    }

    var params = this.params();
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      var pattern = '{' + key + '}';

      if (new RegExp(pattern).test(path)) {
        path = path.replace('{' + key + '}', value);
        delete params[key];
      }
    });

    var missingDynamicSegmentMatch = path.match(REGEXP_DYNAMIC_SEGMENT);
    if (missingDynamicSegmentMatch) {
      throw new Error('[Mappersmith] required parameter missing (' + missingDynamicSegmentMatch[1] + '), "' + path + '" cannot be resolved');
    }

    var queryString = (0, _utils.toQueryString)(params);
    if (queryString.length !== 0) {
      path += '?' + queryString;
    }

    return path;
  },

  /**
   * Returns the full URL
   * Example: http://example.org/some/path?param1=true
   *
   * @return {String}
   */
  url: function url() {
    return '' + this.host() + this.path();
  },

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers: function headers() {
    return (0, _utils.lowerCaseObjectKeys)((0, _utils.assign)({}, this.methodDescriptor.headers, this.requestParams[this.methodDescriptor.headersAttr]));
  },
  body: function body() {
    return this.requestParams[this.methodDescriptor.bodyAttr];
  },
  auth: function auth() {
    return this.requestParams[this.methodDescriptor.authAttr];
  },
  timeout: function timeout() {
    return this.requestParams[this.methodDescriptor.timeoutAttr];
  },

  /**
   * Enhances current request returning a new Request
   * @param {Object} extras
   *   @param {Object} extras.params - it will be merged with current params
   *   @param {Object} extras.headers - it will be merged with current headers
   *   @param {String|Object} extras.body - it will replace the current body
   *   @param {Object} extras.auth - it will replace the current auth
   *   @param {Number} extras.timeout - it will replace the current timeout
   */
  enhance: function enhance(extras) {
    var headerKey = this.methodDescriptor.headersAttr;
    var bodyKey = this.methodDescriptor.bodyAttr;
    var authKey = this.methodDescriptor.authAttr;
    var timeoutKey = this.methodDescriptor.timeoutAttr;
    var requestParams = (0, _utils.assign)({}, this.requestParams, extras.params);

    requestParams[headerKey] = (0, _utils.assign)({}, this.requestParams[headerKey], extras.headers);
    extras.body && (requestParams[bodyKey] = extras.body);
    extras.auth && (requestParams[authKey] = extras.auth);
    extras.timeout && (requestParams[timeoutKey] = extras.timeout);

    return new Request(this.methodDescriptor, requestParams);
  },

  /**
   * Is the request expecting a binary response?
   *
   * @return {Boolean}
   */
  isBinary: function isBinary() {
    return this.methodDescriptor.binary;
  }
};

exports.default = Request;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gateway = __webpack_require__(9);

var _gateway2 = _interopRequireDefault(_gateway);

var _response = __webpack_require__(2);

var _response2 = _interopRequireDefault(_response);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var toBase64 = window.btoa || _utils.btoa;

function XHR(request) {
  _gateway2.default.apply(this, arguments);
}

XHR.prototype = _gateway2.default.extends({
  get: function get() {
    var xmlHttpRequest = this.createXHR();
    xmlHttpRequest.open('get', this.request.url(), true);
    this.setHeaders(xmlHttpRequest, {});
    this.configureTimeout(xmlHttpRequest);
    xmlHttpRequest.send();
  },
  post: function post() {
    this.performRequest('post');
  },
  put: function put() {
    this.performRequest('put');
  },
  patch: function patch() {
    this.performRequest('patch');
  },
  delete: function _delete() {
    this.performRequest('delete');
  },
  configureTimeout: function configureTimeout(xmlHttpRequest) {
    var _this = this;

    this.canceled = false;
    this.timer = null;

    var timeout = this.request.timeout();

    if (timeout) {
      xmlHttpRequest.timeout = timeout;
      xmlHttpRequest.addEventListener('timeout', function () {
        _this.canceled = true;
        clearTimeout(_this.timer);
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      });

      // PhantomJS doesn't support timeout for XMLHttpRequest
      this.timer = setTimeout(function () {
        _this.canceled = true;
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      }, timeout + 1);
    }
  },
  configureCallbacks: function configureCallbacks(xmlHttpRequest) {
    var _this2 = this;

    xmlHttpRequest.addEventListener('load', function () {
      if (_this2.canceled) {
        return;
      }

      clearTimeout(_this2.timer);
      _this2.dispatchResponse(_this2.createResponse(xmlHttpRequest));
    });

    xmlHttpRequest.addEventListener('error', function () {
      if (_this2.canceled) {
        return;
      }

      clearTimeout(_this2.timer);
      _this2.dispatchClientError('Network error');
    });

    var xhrOptions = this.options().XHR;
    if (xhrOptions.withCredentials) {
      xmlHttpRequest.withCredentials = true;
    }

    if (xhrOptions.configure) {
      xhrOptions.configure(xmlHttpRequest);
    }
  },
  performRequest: function performRequest(method) {
    var requestMethod = this.shouldEmulateHTTP() ? 'post' : method;
    var xmlHttpRequest = this.createXHR();
    xmlHttpRequest.open(requestMethod, this.request.url(), true);

    var customHeaders = {};
    var body = this.prepareBody(method, customHeaders);
    this.setHeaders(xmlHttpRequest, customHeaders);
    this.configureTimeout(xmlHttpRequest);

    var args = [];
    body && args.push(body);

    xmlHttpRequest.send.apply(xmlHttpRequest, args);
  },
  createResponse: function createResponse(xmlHttpRequest) {
    var status = xmlHttpRequest.status;
    var data = this.request.isBinary() ? xmlHttpRequest.response : xmlHttpRequest.responseText;
    var responseHeaders = (0, _utils.parseResponseHeaders)(xmlHttpRequest.getAllResponseHeaders());
    return new _response2.default(this.request, status, data, responseHeaders);
  },
  setHeaders: function setHeaders(xmlHttpRequest, customHeaders) {
    var auth = this.request.auth();
    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      customHeaders['authorization'] = 'Basic ' + toBase64(username + ':' + password);
    }

    var headers = (0, _utils.assign)(customHeaders, this.request.headers());
    Object.keys(headers).forEach(function (headerName) {
      xmlHttpRequest.setRequestHeader(headerName, headers[headerName]);
    });
  },
  createXHR: function createXHR() {
    var xmlHttpRequest = new XMLHttpRequest(); // eslint-disable-line no-undef
    this.configureCallbacks(xmlHttpRequest);
    if (this.request.isBinary()) {
      xmlHttpRequest.responseType = 'blob';
    }
    return xmlHttpRequest;
  }
});

exports.default = XHR;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

var _mappersmith = __webpack_require__(1);

var _response = __webpack_require__(2);

var _response2 = _interopRequireDefault(_response);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function Gateway(request) {
  var configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  this.request = request;
  this.configs = configs;
  this.successCallback = function () {};
  this.failCallback = function () {};
}

Gateway.extends = function (methods) {
  return (0, _utils.assign)({}, Gateway.prototype, methods);
};

Gateway.prototype = {
  options: function options() {
    return this.configs;
  },
  shouldEmulateHTTP: function shouldEmulateHTTP() {
    return this.options().emulateHTTP && /^(delete|put|patch)/i.test(this.request.method());
  },
  call: function call() {
    var _this = this,
        _arguments = arguments;

    var timeStart = (0, _utils.performanceNow)();
    return new _mappersmith.configs.Promise(function (resolve, reject) {
      _this.successCallback = function (response) {
        response.timeElapsed = (0, _utils.performanceNow)() - timeStart;
        resolve(response);
      };

      _this.failCallback = function (response) {
        response.timeElapsed = (0, _utils.performanceNow)() - timeStart;
        reject(response);
      };

      try {
        _this[_this.request.method()].apply(_this, _arguments);
      } catch (e) {
        _this.dispatchClientError(e.message);
      }
    });
  },
  dispatchResponse: function dispatchResponse(response) {
    response.success() ? this.successCallback(response) : this.failCallback(response);
  },
  dispatchClientError: function dispatchClientError(message) {
    this.failCallback(new _response2.default(this.request, 400, message));
  },
  prepareBody: function prepareBody(method, headers) {
    var body = this.request.body();

    if (this.shouldEmulateHTTP()) {
      body = body || {};
      (0, _utils.isPlainObject)(body) && (body._method = method);
      headers['x-http-method-override'] = method;
    }

    var bodyString = (0, _utils.toQueryString)(body);

    if (bodyString) {
      // If it's not simple, let the browser (or the user) set it
      if ((0, _utils.isPlainObject)(body)) {
        headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
      }
    }

    return bodyString;
  }
};

exports.default = Gateway;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })
/******/ ]);
});
//# sourceMappingURL=mappersmith.map