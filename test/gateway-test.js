var Mappersmith = require('../index');
var Promise = require('promise');

var Utils = Mappersmith.Utils;
var Gateway = Mappersmith.Gateway;

describe('Gateway', function() {
  var noop,
      gateway,
      host,
      path,
      url,
      verb,
      methodStub,
      stats;

  beforeEach(function() {
    Mappersmith.Env.Promise = Promise;
    Mappersmith.Gateway.__set__('Promise', Mappersmith.Env.Promise);

    noop = Utils.noop;
    host = 'http://host';
    path = '/path';
    url = host + path;
    verb = 'get';
    methodStub = sinon.stub(Gateway.prototype, verb);
    stats = {
      url: url,
      host: host,
      path: path
    }
  });

  afterEach(function() {
    if (Gateway.prototype[verb].restore) {
      Gateway.prototype[verb].restore();
    }
  });

  describe('constructor', function() {
    it('configures successCallback with noop', function() {
      sinon.spy(Utils, 'noop');
      gateway = new Gateway({url: url, method: verb});
      gateway.successCallback();
      expect(Utils.noop).to.have.been.called;
      Utils.noop.restore();
    });

    it('configures failCallback with noop', function() {
      sinon.spy(Utils, 'noop');
      gateway = new Gateway({url: url, method: verb});
      gateway.failCallback();
      expect(Utils.noop).to.have.been.called;
      Utils.noop.restore();
    });

    it('configures completeCallback with noop', function() {
      sinon.spy(Utils, 'noop');
      gateway = new Gateway({url: url, method: verb});
      gateway.completeCallback();
      expect(Utils.noop).to.have.been.called;
      Utils.noop.restore();
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

  describe('#setErrorHandler', function() {
    it('assigns errorHandler', function() {
      gateway = new Gateway({url: url, method: verb});
      expect(gateway.errorHandler).to.be.undefined;
      gateway.setErrorHandler(Utils.noop);
      expect(gateway.errorHandler).to.equal(Utils.noop);
    });
  });

  describe('#setSuccessHandler', function() {
    it('assigns successHandler', function() {
      gateway = new Gateway({url: url, method: verb});
      expect(gateway.successHandler).to.be.undefined;
      gateway.setSuccessHandler(Utils.noop);
      expect(gateway.successHandler).to.equal(Utils.noop);
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
      data = 'data';
      params = {a: 1, b: false};

      gateway = new Gateway({
        url: url,
        host: host,
        path: path,
        params: params,
        method: verb
      });
    });

    it('returns a Promise', function() {
      expect(gateway.promisify()).to.be.an.instanceof(Promise);
    });

    describe('when a callback is provided', function() {
      it('configures the first "then"', function(done) {
        var callback = sinon.spy(function() {});
        gateway.promisify(callback).then(function() {

          expect(callback).to.have.been.calledWith({
            data: data,
            stats: Utils.extend({}, stats, {
              params: params,
              timeElapsed: gateway.timeElapsed,
              timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
            })
          });
          done();

        }).catch(function(err) {
          done(err);
        });

        gateway.successCallback(data);
      });
    });

    describe('when success is called', function() {
      it('resolves with {data, stats}', function(done) {
        gateway.promisify().then(function(result) {

          expect(result.data).to.eql(data);
          expect(result.stats).to.eql(Utils.extend({}, stats, {
            params: params,
            timeElapsed: gateway.timeElapsed,
            timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
          }));
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
              status: 400
            });

            expect(err.err).to.eql([error1, error2]);
            done();
          } catch(e) {
            done(e);
          }
        });

        gateway.failCallback({status: 400, args: [error1, error2]});
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
        method: verb,
        opts: {
          headers: {
            Authorization: 'token'
          }
        }
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
        expect(success).to.have.been.deep.calledWith(data, Utils.extend({}, stats, {
          params: params,
          headers: {Authorization: 'token'},
          timeElapsed: gateway.timeElapsed,
          timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
        }));
      });

      it('merges extraStats with default stats', function() {
        var extraStats = {
          a: 1,
          b: true
        }
        gateway.successCallback(data, extraStats);
        expect(success).to.have.been.deep.calledWith(data, Utils.extend({}, stats, {
          params: params,
          headers: {Authorization: 'token'},
          timeElapsed: gateway.timeElapsed,
          timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
        }, extraStats));
      });

      describe('with a configured processor', function() {
        it('calls the callback with processed data and stats object', function() {
          var processedData = 'new';
          gateway.processor = function(data) { return processedData };
          gateway.successCallback(data);
          expect(success).to.have.been.deep.calledWith(processedData, Utils.extend({}, stats, {
            params: params,
            headers: {Authorization: 'token'},
            timeElapsed: gateway.timeElapsed,
            timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
          }));
        });
      });

    });

    describe('with a successHandler defined', function() {
      it('calls handler with stats object and data', function() {
        var data = 'data';
        var success = sinon.spy(function() {});
        var successHandler = sinon.spy(function() {});

        gateway.setSuccessHandler(successHandler);
        gateway.success(success);
        gateway.successCallback(data);

        expect(success).to.have.been.called;
        expect(successHandler).to.have.been.deep.calledWith(Utils.extend({}, stats, {
          params: params,
          headers: {Authorization: 'token'},
          timeElapsed: gateway.timeElapsed,
          timeElapsedHumanized: Utils.humanizeTimeElapsed(gateway.timeElapsed)
        }), data);
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
      gateway.failCallback({status: 400, args: [error1, error2]});
      expect(fail).to.have.been.deep.calledWith({
        url: url,
        host: host,
        path: path,
        params: params,
        status: 400
      }, error1, error2);
    });

    it('return "this"', function() {
      expect(gateway.fail(function() {})).to.equals(gateway);
    });

    describe('with a errorHandler defined', function() {
      it('calls handler with the requested object and the errors list', function() {
        var error1 = 'error1';
        var error2 = 'error2';
        var fail = sinon.spy(function() {});
        var errorHandler = sinon.spy(function() {});

        gateway.setErrorHandler(errorHandler);
        gateway.fail(fail);

        gateway.failCallback({status: 400, args: [error1, error2]});
        expect(fail).to.have.been.called;
        expect(errorHandler).to.have.been.deep.calledWith({
          url: url,
          host: host,
          path: path,
          params: params,
          status: 400
        }, error1, error2);
      });

      it('returning true, skips the local error callback', function() {
        var error1 = 'error1';
        var error2 = 'error2';
        var fail = sinon.spy(function() {});
        var errorHandler = sinon.spy(function() { return true });

        gateway.setErrorHandler(errorHandler);
        gateway.fail(fail);

        gateway.failCallback({status: 400, args: [error1, error2]});
        expect(fail).to.not.have.been.called;
        expect(errorHandler).to.have.been.deep.calledWith({
          url: url,
          host: host,
          path: path,
          params: params,
          status: 400
        }, error1, error2);
      });
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
