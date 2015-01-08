var expect = chai.expect;
var shared = $shared;
var Utils = Mappersmith.Utils;

describe('Gateway implementations', function() {
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

  shared.examplesFor('success JSON response', function(GatewayImpl) {
    beforeEach(function() {
      requestWithGateway(200, JSON.stringify(data), newGateway(GatewayImpl));
    });

    it('calls success callback', function() {
      expect(success).to.have.been.calledWith(data);
    });

    it('calls complete callback', function() {
      expect(complete).to.have.been.calledWith(data);
    });

    it('does not call fail callback', function() {
      expect(fail).to.not.have.been.called;
    });
  });

  shared.examplesFor('success with unexpected data', function(GatewayImpl) {
    beforeEach(function() {
      requestWithGateway(200, 'OK', newGateway(GatewayImpl));
    });

    it('calls success callback', function() {
      expect(success).to.have.been.calledWith('OK');
    });

    it('calls complete callback', function() {
      expect(complete).to.have.been.called;
    });

    it('does not call fail callback', function() {
      expect(fail).to.not.have.been.called;
    });
  });

  shared.examplesFor('success with processor', function(GatewayImpl) {
    beforeEach(function() {
      processor = sinon.spy(function() { return processedData; });
      requestWithGateway(200, JSON.stringify(data), newGateway(GatewayImpl));
    });

    afterEach(function() {
      processor = undefined;
    });

    it('is called on success', function() {
      expect(processor).to.have.been.calledWith(data);
    });

    it('passes processed data to success callback', function() {
      expect(success).to.have.been.calledWith(processedData);
    });
  });

  shared.examplesFor('fail response', function(GatewayImpl) {
    beforeEach(function() {
      requestWithGateway(503, null, newGateway(GatewayImpl));
    });

    it('calls fail callback', function() {
      expect(fail).to.have.been.called;
    });

    it('calls complete callback', function() {
      expect(complete).to.have.been.called;
    });

    it('does not call success callback', function() {
      expect(success).to.not.have.been.called;
    });
  });

  shared.examplesFor('fail with processor', function(GatewayImpl) {
    beforeEach(function() {
      processor = sinon.spy(function(){ return 'processed data'; });
      requestWithGateway(500, JSON.stringify(data), newGateway(GatewayImpl));
    });

    afterEach(function() {
      processor = undefined;
    });

    it('is not called on failure', function() {
      expect(processor).to.not.have.been.called;
    });
  });

  describe('common behavior', function() {
    [

      ['VanillaGateway', Mappersmith.VanillaGateway],
      ['JQueryGateway', Mappersmith.JQueryGateway]

    ].forEach(function(arg) {
      var name = arg[0];
      var GatewayImpl = arg[1];

      describe(name, function() {

        describe('#get', function() {
          beforeEach(function() {
            method = 'get';
          });

          describe('success', function() {
            shared.shouldBehaveLike('success JSON response', GatewayImpl);
            shared.shouldBehaveLike('success with unexpected data', GatewayImpl);
            shared.shouldBehaveLike('success with processor', GatewayImpl);
          });

          describe('fail', function() {
            shared.shouldBehaveLike('fail response', GatewayImpl);
            shared.shouldBehaveLike('fail with processor', GatewayImpl);
          });
        });

        ['put', 'patch', 'delete', 'post'].forEach(function(methodName) {
          describe('#' + methodName, function() {
            beforeEach(function() {
              method = methodName;
            });

            describe('success', function() {
              shared.shouldBehaveLike('success JSON response', GatewayImpl);
              shared.shouldBehaveLike('success with unexpected data', GatewayImpl);
              shared.shouldBehaveLike('success with processor', GatewayImpl);

              describe('with body data', function() {
                var body;

                beforeEach(function() {
                  body = {val1: 1, val2: 2};
                  requestWithGateway(200, 'OK', newGateway(GatewayImpl, {body: body}));
                });

                it('includes the formatted body to the request', function() {
                  expect(fakeServer.lastRequest().requestBody).to.equal(Utils.params(body));
                });
              });
            });

            describe('fail', function() {
              shared.shouldBehaveLike('fail response', GatewayImpl);
              shared.shouldBehaveLike('fail with processor', GatewayImpl);
            });
          });
        });

        ['put', 'patch', 'delete'].forEach(function(methodName) {
          describe('emulating HTTP method ' + methodName.toUpperCase(), function() {
            var body;

            beforeEach(function() {
              method = 'post';
            });

            describe('with body empty', function() {
              beforeEach(function() {
                body = {_method: methodName.toUpperCase()};
                var localGateway = newGateway(GatewayImpl, {method: methodName, opts: {emulateHTTP: true}});
                requestWithGateway(200, 'OK', localGateway);
              });

              it('adds _method=' + methodName + ' to the body', function() {
                expect(fakeServer.lastRequest().requestBody).to.equal(Utils.params(body));
              });

              it('adds header X-HTTP-Method-Override=' + methodName, function() {
                var headerValue = fakeServer.lastRequest().requestHeaders['X-HTTP-Method-Override'];
                expect(headerValue).to.equal(methodName.toUpperCase());
              });

              it('sends as POST', function() {
                expect(fakeServer.lastRequest().method).to.equal('POST');
              });
            });
          });
        });
      });
    });
  });

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
          newGateway(VanillaGateway, {opts: {configure: configure}})
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
          newGateway(JQueryGateway, {opts: opts})
        );

        expect($.ajax).to.have.been.calledWith(config);
      });
    });
  });
});
