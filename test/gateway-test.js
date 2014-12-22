var expect = chai.expect;

var Utils = Mappersmith.Utils;
var Gateway = Mappersmith.Gateway;

describe('Gateway', function() {
  var noop,
      gateway,
      url,
      verb,
      methodStub;

  beforeEach(function() {
    noop = Utils.noop;
    url = 'http://url';
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
          method: verb,
          params: {a: 1},
          body: 'some-value',
          opts: {b: 2}
        }

        gateway = new Gateway(args);
      });

      ['url', 'method', 'params', 'body', 'opts'].forEach(function(attr) {
        it(attr, function() {
          expect(gateway[attr]).to.equal(args[attr]);
        });
      });
    });
  });

  describe('#call', function() {
    it('calls the configured method with the url', function() {
      new Gateway({url: url, method: verb}).call();
      expect(methodStub).to.have.been.called;
    });
  });

  describe('#success', function() {
    var gateway;

    beforeEach(function() {
      gateway = new Gateway({url: url, method: verb});
    });

    it('configures the successCallback', function() {
      var success = function() {};
      gateway.success(success);
      expect(gateway.successCallback).to.equals(success);
    });

    it('return "this"', function() {
      expect(gateway.success(function() {})).to.equals(gateway);
    });
  });

  describe('#fail', function() {
    var gateway;

    beforeEach(function() {
      gateway = new Gateway({url: url, method: verb});
    });

    it('configures the failCallback', function() {
      var fail = function() {};
      gateway.fail(fail);
      expect(gateway.failCallback).to.equals(fail);
    });

    it('return "this"', function() {
      expect(gateway.fail(function() {})).to.equals(gateway);
    });
  });

  describe('#complete', function() {
    var gateway;

    beforeEach(function() {
      gateway = new Gateway({url: url, method: verb});
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

  ['get', 'head', 'post', 'put', 'delete', 'patch'].forEach(function(verb) {

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
