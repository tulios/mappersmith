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

function hasProcessHrtime() {
  return (typeof _process !== 'undefined' && _process !== null) && _process.hrtime;
}

function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
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

  // Code based on: https://github.com/jquery/jquery/blob/2.1.4/src/core.js#L124
  extend: function(out) {
    var options, name, src, copy, clone;
  	var target = arguments[0] || {};
  	var length = arguments.length;

  	// Handle case when target is a string or something
  	if (typeof target !== 'object') target = {};

  	for (var i = 1; i < length; i++) {
  		// Only deal with non-null/undefined values
      if ((options = arguments[i]) === null) continue;

  		// Extend the base object
  		for (name in options) {
  		  src = target[name];
  			copy = options[name];

  			// Prevent never-ending loop
  			if (target === copy) continue;

  			// Recurse if we're merging plain objects or arrays
  			if (copy && isObject(copy)) {
					clone = src && isObject(src) ? src : {};
  				// Never move original objects, clone them
  				target[name] = this.extend(clone, copy);

  		  // Don't bring in undefined values
  			} else if (copy !== undefined) {
  				target[name] = copy;
  			}
  		}
  	}

  	return target;
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
   * borrowed from: https://gist.github.com/monsur/706839
   * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
   * headers according to the format described here:
   * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
   * This method parses that string into a user-friendly key/value pair object.
   */
  parseResponseHeaders: function(headerStr) {
    var headers = {};
    if (!headerStr) return headers;

    var headerPairs = headerStr.split('\u000d\u000a');
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf('\u003a\u0020');
      if (index > 0) {
        var key = headerPair.substring(0, index).toLowerCase();
        var val = headerPair.substring(index + 2);
        headers[key] = val;
      }
    }
    return headers;
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
