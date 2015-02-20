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

var hasProcessHrtime = function() {
  return (typeof process !== 'undefined' && process !== null) && process.hrtime;
}

var getNanoSeconds, loadTime;
if (hasProcessHrtime()) {
  getNanoSeconds = function() {
    var hr = process.hrtime();
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
    this.message = message;
    this.toString = function() { return '[Mappersmith] ' + this.message; }
  }
}

module.exports = Utils;
