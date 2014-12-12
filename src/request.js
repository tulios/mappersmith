var noop = function() {};
var extend = function(out) {
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

var Request = function(url, callback) {
  this.successCallback = callback || noop;
  this.failCallback = noop;
  this.completeCallback = noop;
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

var JQueryRequest = function() {
  return Request.apply(this, arguments);
}

JQueryRequest.prototype = extend({}, Request.prototype, {

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

var VanillaRequest = function() {
  return Request.apply(this, arguments);
}

VanillaRequest.prototype = extend({}, Request.prototype, {

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
