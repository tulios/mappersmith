var expect = chai.expect;
var Utils = Mappersmith.Utils;

describe('Gateway implementations', function() {
  var fakeServer,
      url,
      method,
      data,
      success,
      fail,
      complete;

  beforeEach(function() {
    fakeServer = sinon.fakeServer.create();

    url = 'http://full-url/';
    method = 'get';
    success = sinon.spy(function(){});
    fail = sinon.spy(function(){});
    complete = sinon.spy(function(){});
    data = {id: 1, enable: false};
  });

  afterEach(function() {
    fakeServer.restore();
  });

  function requestWithGateway(status, rawData, GatewayImpl, opts) {
    rawData = rawData || '';
    fakeServer.respondWith(
      method,
      url,
      [status, {'Content-Type': 'application/json'}, rawData]
    );

    new GatewayImpl(url, method, opts).
      success(success).
      fail(fail).
      complete(complete).
      call();

    fakeServer.respond();
  }

  describe('common behavior', function() {
    [

      ['VanillaGateway', Mappersmith.VanillaGateway],
      ['JQueryGateway', Mappersmith.JQueryGateway]

    ].forEach(function(arg) {
      var name = arg[0];
      var GatewayImpl = arg[1];

      describe(name, function() {

        describe('success', function() {
          describe('with valid JSON', function() {
            beforeEach(function() {
              requestWithGateway(200, JSON.stringify(data), GatewayImpl);
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

          describe('with invalid JSON', function() {
            beforeEach(function() {
              requestWithGateway(200, '{', GatewayImpl);
            });

            it('does not call success callback', function() {
              expect(success).to.not.have.been.called;
            });

            it('calls complete callback', function() {
              expect(complete).to.have.been.called;
            });

            it('calls fail callback', function() {
              expect(fail).to.have.been.called;
            });
          });
        });

        describe('fail', function() {
          beforeEach(function() {
            requestWithGateway(503, null, GatewayImpl);
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

      });
    });
  });

  describe('VanillaGateway', function() {
    var configure;

    beforeEach(function() {
      configure = sinon.spy(function() {});
    });

    describe('configure callback', function() {
      it('calls the callback with the request object', function() {
        requestWithGateway(
          200,
          JSON.stringify(data),
          VanillaGateway,
          {configure: configure}
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
    });

    afterEach(function() {
      $.ajax.restore();
    });

    describe('custom opts', function() {
      it('merges opts with $.ajax defaults', function() {
        var opts = {jsonp: true};
        var defaults = {dataType: "json", url: url};
        var config = Utils.extend(defaults, opts);

        requestWithGateway(
          200,
          JSON.stringify(data),
          JQueryGateway,
          opts
        );

        expect($.ajax).to.have.been.calledWith(config);
      });
    });
  });
});
