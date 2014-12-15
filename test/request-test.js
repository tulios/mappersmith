var expect = chai.expect;
// var sinon = require("sinon");
// var sinonChai = require("sinon-chai");

var Utils = Mappersmith.Utils;
var Request = Mappersmith.Request;

describe('Request', function() {
  var noop,
      request,
      url,
      ajax;

  beforeEach(function() {
    noop = Utils.noop;
    url = 'http://url';
    ajax = sinon.stub(Request.prototype, "ajax");
  });

  afterEach(function() {
    if (Request.prototype.ajax.restore) {
      Request.prototype.ajax.restore();
    }
  });

  describe('constructor', function() {
    it('configures the successCallback', function() {
      var callback = function() {};
      request = new Request(url, callback);
      expect(request.successCallback).to.equals(callback);
    });

    describe('when the successCallback is undefined', function() {
      it('configures with noop', function() {
        request = new Request(url);
        expect(request.successCallback).to.equals(noop);
      });
    });

    it('configures failCallback with noop', function() {
      request = new Request(url);
      expect(request.failCallback).to.equals(noop);
    });

    it('configures completeCallback with noop', function() {
      request = new Request(url);
      expect(request.completeCallback).to.equals(noop);
    });

    it('calls ajax with the url', function() {
      request = new Request(url);
      expect(ajax).to.have.been.calledWith(url);
    });
  });

  describe('#fail', function() {
    var request;

    beforeEach(function() {
      request = new Request(url);
    });

    it('configures the failCallback', function() {
      var fail = function() {};
      request.fail(fail);
      expect(request.failCallback).to.equals(fail);
    });

    it('return "this"', function() {
      expect(request.fail(function() {})).to.equals(request);
    });
  });

  describe('#complete', function() {
    var request;

    beforeEach(function() {
      request = new Request(url);
    });

    it('configures the completeCallback', function() {
      var complete = function() {};
      request.complete(complete);
      expect(request.completeCallback).to.equals(complete);
    });

    it('return "this"', function() {
      expect(request.complete(function() {})).to.equals(request);
    });
  });

  describe('#ajax', function() {
    beforeEach(function() {
      Request.prototype.ajax.restore();
    });

    it('throws Utils.Exception with NotImplemented message', function() {
      expect(function() { new Request(url) }).to.throw(Utils.Exception, /not implemented/);
    });
  });
});
