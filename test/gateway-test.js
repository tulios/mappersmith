var expect = chai.expect;

var Utils = Mappersmith.Utils;
var Gateway = Mappersmith.Gateway;

describe('Gateway', function() {
  var noop,
      gateway,
      host,
      path,
      url,
      verb,
      methodStub;

  beforeEach(function() {
    noop = Utils.noop;
    host = 'http://host';
    path = '/path';
    url = host + path;
    verb = 'get';
    methodStub = sinon.stub(Gateway.prototype, verb);
  });

  afterEach(function() {
    if (Gateway.prototype[verb].restore) {
      Gateway.prototype[verb].restore();
    }
  });

  describe('constructor', function() {
    it('configures successCallback with noop', function() {
      gateway = new Gateway({url: url, method: verb});
      expect(gateway.successCallback).to.equals(noop);
    });

    it('configures failCallback with noop', function() {
      gateway = new Gateway({url: url, method: verb});
      expect(gateway.failCallback).to.equals(noop);
    });

    it('configures completeCallback with noop', function() {
      gateway = new Gateway({url: url, method: verb});
      expect(gateway.completeCallback).to.equals(noop);
    });

    describe('exposed args values', function() {
      var args;

      beforeEach(function() {
        args = {
          url: url,
          host: host,
          path: path,
          params: {a: 1},
          method: verb,
          body: 'some-value',
          opts: {b: 2}
        }

        gateway = new Gateway(args);
      });

      ['url', 'host', 'path', 'params', 'method', 'body', 'opts'].forEach(function(attr) {
        it(attr, function() {
          expect(gateway[attr]).to.equal(args[attr]);
        });
      });
    });
  });

  describe('#call', function() {
    var gateway, performanceNowValue;

    beforeEach(function() {
      performanceNowValue = 88;
      sinon.stub(Utils, 'performanceNow').returns(performanceNowValue);
      gateway = new Gateway({url: url, method: verb}).call();
    });

    afterEach(function() {
      Utils.performanceNow.restore();
    });

    it('records the start time', function() {
      expect(gateway.timeStart).to.equal(performanceNowValue);
    });

    it('calls the configured method with the url', function() {
      expect(methodStub).to.have.been.called;
    });
  });

  describe('#promisify', function() {
    var gateway, data, params;

    beforeEach(function() {
      gateway = new Gateway({
        url: url,
        host: host,
        path: path,
        params: params,
        method: verb
      });

      data = 'data';
      params = {a: 1, b: false};
    });

    it('returns a Promise', function() {
      expect(gateway.promisify()).to.be.an.instanceof(Promise);
    });

    describe('when success is called', function() {
      it('resolves with {data, stats}', function(done) {
        gateway.promisify().then(function(result) {

          expect(result.data).to.eql(data);
          expect(result.stats).to.eql({
            url: url,
            host: host,
            path: path,
            params: params,
            timeElapsed: gateway.timeElapsed,
            timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
          });
          done();

        }).catch(function(err) {
          done(err);
        });

        gateway.successCallback(data);
      });
    });

    describe('when fail is called', function() {
      it('rejects with {request, err}', function(done) {
        var error1 = 'error1';
        var error2 = 'error2';

        gateway.promisify().then(function() {
          done(new Error('should have called "catch"'));

        }).catch(function(err) {
          try {
            expect(err.request).to.eql({
              url: url,
              host: host,
              path: path,
              params: params,
            });

            expect(err.err).to.eql([error1, error2]);
            done();
          } catch(e) {
            done(e);
          }
        });

        gateway.failCallback(error1, error2);
      });
    });
  });

  describe('#success', function() {
    var gateway, params;

    beforeEach(function() {
      params = {a: 1, b: false};
      gateway = new Gateway({
        url: url,
        host: host,
        path: path,
        params: params,
        method: verb
      });
    });

    it('return "this"', function() {
      expect(gateway.success(function() {})).to.equals(gateway);
    });

    describe('when configuring successCallback with time measure wrapper', function() {
      var success, performanceNowValue, data;

      beforeEach(function() {
        success = sinon.spy(function() {});
        performanceNowValue = 88;
        data = 'data';

        gateway.timeStart = Utils.performanceNow();
        sinon.stub(Utils, 'performanceNow').returns(gateway.timeStart + performanceNowValue);
        gateway.success(success);
      });

      afterEach(function() {
        Utils.performanceNow.restore();
      });

      it('records the end time', function() {
        gateway.successCallback(data);
        expect(gateway.timeEnd).to.equal(gateway.timeStart + performanceNowValue);
      });

      it('records the time elapsed time', function() {
        gateway.successCallback(data);
        expect(gateway.timeElapsed).to.equal(gateway.timeEnd - gateway.timeStart);
      });

      it('calls the callback with data and stats object', function() {
        gateway.successCallback(data);
        expect(success).to.have.been.deep.calledWith(data, {
          url: url,
          host: host,
          path: path,
          params: params,
          timeElapsed: gateway.timeElapsed,
          timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
        });
      });

      it('merges extraStats with default stats', function() {
        var extraStats = {
          a: 1,
          b: true
        }
        gateway.successCallback(data, extraStats);
        expect(success).to.have.been.deep.calledWith(data, Utils.extend({
          url: url,
          host: host,
          path: path,
          params: params,
          timeElapsed: gateway.timeElapsed,
          timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
        }, extraStats));
      });

      describe('with a configured processor', function() {
        it('calls the callback with processed data and stats object', function() {
          var processedData = 'new';
          gateway.processor = function(data) { return processedData };
          gateway.successCallback(data);
          expect(success).to.have.been.deep.calledWith(processedData, {
            url: url,
            host: host,
            path: path,
            params: params,
            timeElapsed: gateway.timeElapsed,
            timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
          });
        });
      });

    });
  });

  describe('#fail', function() {
    var gateway, params;

    beforeEach(function() {
      params = {a: 1, b: false};
      gateway = new Gateway({
        url: url,
        host: host,
        path: path,
        params: params,
        method: verb
      });
    });

    it('calls failCallback with requested resource object and errors', function() {
      var error1 = 'error1';
      var error2 = 'error2';
      var fail = sinon.spy(function() {});

      gateway.fail(fail);
      gateway.failCallback(error1, error2);
      expect(fail).to.have.been.deep.calledWith({
        url: url,
        host: host,
        path: path,
        params: params,
      }, error1, error2);
    });

    it('return "this"', function() {
      expect(gateway.fail(function() {})).to.equals(gateway);
    });
  });

  describe('#complete', function() {
    var gateway;

    beforeEach(function() {
      gateway = new Gateway({
        url: url,
        host: host,
        path: path,
        method: verb
      });
    });

    it('configures the completeCallback', function() {
      var complete = function() {};
      gateway.complete(complete);
      expect(gateway.completeCallback).to.equals(complete);
    });

    it('return "this"', function() {
      expect(gateway.complete(function() {})).to.equals(gateway);
    });
  });

  describe('#shouldEmulateHTTP', function() {
    ['delete', 'put', 'patch'].forEach(function(method) {
      describe('when method is ' + method, function() {
        describe('and emulating HTTP methods is enable', function() {
          beforeEach(function() {
            gateway = new Gateway({
              url: url,
              host: host,
              path: path,
              method: method,
              opts: {emulateHTTP: true}
            });
          });

          it('returns true', function() {
            expect(gateway.shouldEmulateHTTP(method)).to.be.true();
          });
        });

        describe('and emulating HTTP methods is not enable', function() {
          beforeEach(function() {
            gateway = new Gateway({url: url, method: method, opts: {emulateHTTP: false}});
          });

          it('returns false', function() {
            expect(gateway.shouldEmulateHTTP(method)).to.be.false();
          });
        });
      });
    });

    ['post', 'get'].forEach(function(method) {
      describe('when method is ' + method, function() {
        describe('and emulating HTTP methods is enable', function() {
          beforeEach(function() {
            gateway = new Gateway({url: url, method: method, opts: {emulateHTTP: true}});
          });

          it('returns false', function() {
            expect(gateway.shouldEmulateHTTP(method)).to.be.false();
          });
        });

        describe('and emulating HTTP methods is not enable', function() {
          beforeEach(function() {
            gateway = new Gateway({url: url, method: method, opts: {emulateHTTP: false}});
          });

          it('returns false', function() {
            expect(gateway.shouldEmulateHTTP(method)).to.be.false();
          });
        });
      });
    });

  });

  ['get', 'post', 'put', 'delete', 'patch'].forEach(function(verb) {

    describe('#' + verb, function() {
      beforeEach(function() {
        if (Gateway.prototype[verb].restore) {
          Gateway.prototype[verb].restore();
        }
      });

      it('throws Utils.Exception with NotImplemented message', function() {
        expect(function() { new Gateway({url: url, method: verb}).call() }).to.throw(Utils.Exception, /not implemented/);
      });
    });

  });
});
