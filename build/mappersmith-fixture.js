(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MappersmithFixture = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*!
 * Mappersmith 0.11.0, Fixture support
 * https://github.com/tulios/mappersmith
 */
var Mappersmith = (typeof window !== "undefined" ? window['Mappersmith'] : typeof global !== "undefined" ? global['Mappersmith'] : null);
var Fixture = require('./src/fixture');

if (Mappersmith) {
  Mappersmith.Env.USE_FIXTURES = true;
  Mappersmith.Env.Fixture = Fixture;
}

module.exports = Fixture;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/fixture":2}],2:[function(require,module,exports){
(function (global){
var Utils = (typeof window !== "undefined" ? window['Mappersmith'] : typeof global !== "undefined" ? global['Mappersmith'] : null).Utils;
var STORE = {};

function FixtureEntry(method) {
  this.opts = {
    calls: [],
    method: method.toLowerCase(),
    success: true
  }
}

FixtureEntry.prototype = {
  matching: function(params) {
    this.opts.matchingParams = params;
    return this;
  },

  failure: function(params) {
    this.opts.success = false;
    this.opts.errorParams = Utils.extend({status: 400}, params || {});
    return this;
  },

  response: function(value) {
    this.opts.value = value;
    var opts = this.opts;
    var calls = opts.calls;

    return {
      remove: function() {
        return Fixture.clear(opts.method, opts.matchingParams);
      },

      calls: function() {
        return calls;
      },

      callsCount: function() {
        return calls.length;
      },

      firstCall: function() {
        return calls[0] || null;
      },

      mostRecentCall: function() {
        return calls[calls.length - 1] || null;
      }
    }
  },

  data: function() {
    if (typeof entry !== 'object') return this.opts.value;
    return Utils.extend({}, this.opts.value);
  },

  callWith: function(requestedResource) {
    this.opts.calls.push(requestedResource);

    var data = this.data();
    var errorParams = this.opts.errorParams || {};
    var errorObj = {status: errorParams.status, args: [data]};

    return this.isSuccess() ? data : errorObj;
  },

  isSuccess: function() {
    return this.opts.success;
  },

  match: function(requestedResource) {
    return this.matchObjects(this.opts.matchingParams, requestedResource);
  },

  matchObjects: function(match, target) {
    return Object.
      keys(match).
      reduce(function(result, key) {
        return result = result && this.compare(match[key], target[key]);
      }.bind(this), true);
  },

  compare: function(match, value) {
    if (match instanceof RegExp) return match.test(value);
    if (typeof match === 'object') return this.matchObjects(match, value);
    return match === value;
  }
}

var Fixture = {

  define: function(method) {
    var entry = new FixtureEntry(method);
    STORE[method] = STORE[method] || [];
    STORE[method].push(entry);
    return entry;
  },

  lookup: function(method, requestedResource) {
    var entries = STORE[method] || [];
    return entries.filter(function(entry) {
      return entry.match(requestedResource);
    }).pop();
  },

  count: function() {
    return Object.keys(STORE).reduce(function(count, key) {
      var isMethodDefined = (STORE[key] && STORE[key].length);
      return count += isMethodDefined ? STORE[key].length : 0;
    }, 0);
  },

  clear: function(method, matchingParams) {
    if (method === undefined && matchingParams === undefined) {
      STORE = {};
      return true;
    }

    if (method !== undefined && matchingParams === undefined) {
      STORE[method] = null;
      return true;
    }

    var entry = this.lookup(method, matchingParams);
    var index = STORE[method].lastIndexOf(entry);

    if (index > -1) {
      STORE[method].splice(index, 1);
      return true;
    }

    return false;
  }

}

module.exports = Fixture;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});