var Utils = module.exports = {
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

  Exception: function(message) {
    this.message = message;
    this.toString = function() { return '[Mappersmith] ' + this.message; }
  }
}
