function gatewayImplSpecFor(GatewayName, GatewayImpl) {

  describe(GatewayName, function() {
    var context = {};
    var makeRequest,
        Utils;

    if (typeof window === 'undefined') {
      makeRequest = require('./node-generate-make-request')(context);
      Utils = require('../../').Utils;

    } else {
      makeRequest = browserGenerateMakeRequest(context);
      Utils = window.Mappersmith.Utils;
    }

    function newGateway(opts) {
      opts = opts || {};
      return new GatewayImpl(Utils.extend({
        url: context.url,
        method: context.method,
        processor: context.processor
      }, opts));
    }

    beforeEach(function() {
      context.url = 'http://full-url/';
      context.success = sinon.spy(function(){});
      context.fail = sinon.spy(function(){});
      context.complete = sinon.spy(function(){});

      context.data = {id: 1, enable: false};
      context.processedData = 'processed data';
    });

    shared.examplesFor(GatewayName + ' success JSON response', function() {
      describe('JSON response', function() {
        beforeEach(function(done) {
          makeRequest({
            status: 200,
            rawData: JSON.stringify(context.data),
            gateway: newGateway()
          }, done);
        });

        it('calls success callback', function() {
          expect(context.success).to.have.been.calledWith(context.data);
        });

        it('calls complete callback', function() {
          expect(context.complete).to.have.been.calledWith(context.data);
        });

        it('does not call fail callback', function() {
          expect(context.fail).to.not.have.been.called;
        });
      });
    });

    shared.examplesFor(GatewayName + ' success with unexpected data', function() {
      describe('with unexpected data', function() {
        beforeEach(function(done) {
          makeRequest({
            status: 200,
            rawData: 'OK',
            gateway: newGateway()
          }, done);
        });

        it('calls success callback', function() {
          expect(context.success).to.have.been.calledWith('OK');
        });

        it('calls complete callback', function() {
          expect(context.complete).to.have.been.called;
        });

        it('does not call fail callback', function() {
          expect(context.fail).to.not.have.been.called;
        });
      });
    });

    shared.examplesFor(GatewayName + ' success with processor', function() {
      describe('with processor', function() {
        beforeEach(function(done) {
          context.processor = sinon.spy(function() { return context.processedData; });
          makeRequest({
            status: 200,
            rawData: JSON.stringify(context.data),
            gateway: newGateway()
          }, done);
        });

        afterEach(function() {
          context.processor = undefined;
        });

        it('is called on success', function() {
          expect(context.processor).to.have.been.calledWith(context.data);
        });

        it('passes processed data to success callback', function() {
          expect(context.success).to.have.been.calledWith(context.processedData);
        });
      });
    });

    shared.examplesFor(GatewayName + ' fail response', function() {
      describe('response', function() {
        beforeEach(function(done) {
          makeRequest({
            status: 503,
            rawData: null,
            gateway: newGateway()
          }, done);
        });

        it('calls fail callback', function() {
          expect(context.fail).to.have.been.called;
        });

        it('calls complete callback', function() {
          expect(context.complete).to.have.been.called;
        });

        it('does not call success callback', function() {
          expect(context.success).to.not.have.been.called;
        });
      });
    });

    shared.examplesFor(GatewayName + ' fail with processor', function() {
      describe('with processor', function() {
        beforeEach(function(done) {
          context.processor = sinon.spy(function(){ return context.processedData; });
          makeRequest({
            status: 500,
            rawData: JSON.stringify(context.data),
            gateway: newGateway()
          }, done);
        });

        afterEach(function() {
          context.processor = undefined;
        });

        it('is not called on failure', function() {
          expect(context.processor).to.not.have.been.called;
        });
      });
    });

    describe('#get', function() {
      beforeEach(function() {
        context.method = 'get';
      });

      describe('success', function() {
        shared.shouldBehaveLike(GatewayName + ' success JSON response');
        shared.shouldBehaveLike(GatewayName + ' success with unexpected data');
        shared.shouldBehaveLike(GatewayName + ' success with processor');
      });

      describe('fail', function() {
        shared.shouldBehaveLike(GatewayName + ' fail response');
        shared.shouldBehaveLike(GatewayName + ' fail with processor');
      });
    });

    ['post', 'put', 'delete', 'patch'].forEach(function(methodName) {
      describe('#' + methodName, function() {
        beforeEach(function() {
          context.method = methodName;
        });

        describe('success', function() {
          shared.shouldBehaveLike(GatewayName + ' success JSON response');
          shared.shouldBehaveLike(GatewayName + ' success with unexpected data');
          shared.shouldBehaveLike(GatewayName + ' success with processor');

          describe('with body data', function() {
            it('includes the formatted body to the request', function(done) {
              var body = {val1: 1, val2: 2};
              var bodyData = Utils.params(body);

              makeRequest({
                status: 200,
                rawData: 'OK',
                gateway: newGateway({body: body}),
                assertBodyData: bodyData
              }, done);
            });
          });
        });

        describe('fail', function() {
          shared.shouldBehaveLike(GatewayName + ' fail response');
          shared.shouldBehaveLike(GatewayName + ' fail with processor');
        });
      });
    });

    ['put', 'patch', 'delete'].forEach(function(methodName) {
      describe('emulating HTTP method ' + methodName.toUpperCase(), function() {
        var body, localGateway;

        beforeEach(function() {
          context.method = 'post';
          localGateway = newGateway({method: methodName, opts: {emulateHTTP: true}});
        });

        it('sends as POST', function(done) {
          makeRequest({
            status: 200,
            rawData: 'OK',
            gateway: localGateway
          }, done);

          expect(context.method).to.equal('post');
        });

        it('adds _method=' + methodName + ' to the body', function(done) {
          var body = {_method: methodName.toUpperCase()};
          var bodyData = Utils.params(body);

          makeRequest({
            status: 200,
            rawData: 'OK',
            gateway: localGateway,
            assertBodyData: bodyData
          }, done);
        });

        it('adds header X-HTTP-Method-Override=' + methodName.toUpperCase(), function(done) {
          makeRequest({
            status: 200,
            rawData: 'OK',
            gateway: localGateway,
            assertHeader: {'X-HTTP-Method-Override': methodName.toUpperCase()}
          }, done);
        });
      });
    });
  });

}

if (typeof window === 'undefined') {
  module.exports = gatewayImplSpecFor;
}
