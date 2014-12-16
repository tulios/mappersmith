var expect = chai.expect;

describe('Gateway implementations', function() {
  [

    ['VanillaGateway', Mappersmith.VanillaGateway],
    ['JQueryGateway', Mappersmith.JQueryGateway]

  ].forEach(function(arg) {
    var name = arg[0];
    var GatewayImpl = arg[1];

    describe(name, function() {
      var gateway,
          fakeServer,
          url,
          method,
          data,
          success,
          fail,
          complete;

      function requestWithGateway(status, rawData) {
        rawData = rawData || '';
        fakeServer.respondWith(
          method,
          url,
          [status, {'Content-Type': 'application/json'}, rawData]
        );

        new GatewayImpl(url, method, success).fail(fail).complete(complete);
        fakeServer.respond();
      }

      beforeEach(function() {
        fakeServer = sinon.fakeServer.create();
      });

      afterEach(function() {
        fakeServer.restore();
      });

      describe('#get', function() {
        beforeEach(function(){
          url = 'http://full-url/';
          method = 'get';
          success = sinon.spy(function(){});
          fail = sinon.spy(function(){});
          complete = sinon.spy(function(){});
          data = {id: 1, enable: false};
        });

        describe('success', function() {
          describe('with valid JSON', function() {
            beforeEach(function() {
              requestWithGateway(200, JSON.stringify(data));
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
              requestWithGateway(200, '{');
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
            requestWithGateway(503);
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
});
