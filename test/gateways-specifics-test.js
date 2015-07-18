var $ = require('jquery');

var Mappersmith = require('../index');
var Promise = require('promise');
var shared = require('shared-examples-for');
var Utils = Mappersmith.Utils;

describe('Gateways specifics', function() {
  var fakeServer,
      url,
      method,
      data,
      processedData,
      success,
      fail,
      complete,
      processor;

  beforeEach(function() {
    fakeServer = sinon.fakeServer.create();
    fakeServer.lastRequest = function() {
      return fakeServer.requests[fakeServer.requests.length - 1];
    }

    url = 'http://full-url/';
    success = sinon.spy(function(){});
    fail = sinon.spy(function(){});
    complete = sinon.spy(function(){});

    data = {id: 1, enable: false};
    processedData = 'processed data';
  });

  afterEach(function() {
    fakeServer.restore();
  });

  function newGateway(GatewayImpl, opts) {
    opts = opts || {};
    return new GatewayImpl(Utils.extend({
      url: url,
      method: method,
      processor: processor
    }, opts));
  }

  function requestWithGateway(status, rawData, gateway) {
    rawData = rawData || '';
    var contentType = 'application/json';

    try { JSON.parse(rawData) }
    catch(e1) { contentType = 'text/plain' }

    fakeServer.respondWith(
      method,
      url,
      [status, {'Content-Type': contentType}, rawData]
    );

    gateway.
      success(success).
      fail(fail).
      complete(complete).
      call();

    fakeServer.respond();
  }

  describe('VanillaGateway', function() {
    var configure;

    beforeEach(function() {
      method = 'get';
      configure = sinon.spy(function() {});
    });

    describe('configure callback', function() {
      it('calls the callback with the request object', function() {
        requestWithGateway(
          200,
          JSON.stringify(data),
          newGateway(Mappersmith.VanillaGateway, {opts: {configure: configure}})
        );

        var firstCallArgs = configure.args[0];
        expect(configure).to.have.been.called;
        expect(firstCallArgs[0]).to.be.an.instanceOf(XMLHttpRequest);
      });
    });
  });

  describe('JQueryGateway', function() {
    var ajax;

    beforeEach(function() {
      ajax = {
        done: function() {return this},
        fail: function() {return this},
        always: function() {return this}
      };

      sinon.spy(ajax, 'done');
      sinon.spy(ajax, 'fail');
      sinon.spy(ajax, 'always');

      sinon.stub($, 'ajax').returns(ajax);
      method = 'get';
    });

    afterEach(function() {
      $.ajax.restore();
    });

    describe('custom opts', function() {
      it('merges opts with $.ajax defaults', function() {
        var opts = {jsonp: true};
        var defaults = {url: url};
        var config = Utils.extend(defaults, opts);

        requestWithGateway(
          200,
          JSON.stringify(data),
          newGateway(Mappersmith.JQueryGateway, {opts: opts})
        );

        expect($.ajax).to.have.been.calledWith(config);
      });
    });
  });
});
