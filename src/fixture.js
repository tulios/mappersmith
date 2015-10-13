var Utils = require('mappersmith').Utils;
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
    return this;
  },

  response: function(value) {
    this.opts.value = value;
    var entry = this;

    return {
      remove: function() {
        return Fixture.clear(entry.opts.method, entry.opts.matchingParams);
      },

      calledWith: function() {
        return entry.opts.calls.pop() || null;
      }
    }
  },

  data: function() {
    if (typeof entry !== 'object') return this.opts.value;
    return Utils.extend({}, this.opts.value);
  },

  callWith: function(requestedResource) {
    this.opts.calls.push(requestedResource);
    return this.data();
  },

  isSuccess: function() {
    return this.opts.success;
  },

  match: function(requestedResource) {
    return Object.
      keys(this.opts.matchingParams).
      reduce(function(result, key) {
        var value = this.opts.matchingParams[key];
        if (value['test']) return result = result && value.test(requestedResource[key]);
        return result = result && requestedResource[key] === value;
      }.bind(this), true);
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
