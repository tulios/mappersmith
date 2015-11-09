var Mappersmith = require('../index');
var Utils = Mappersmith.Utils;

describe('Utils', function() {
  describe('#noop', function() {
    it('is a function', function() {
      expect(typeof Utils.noop).to.equal('function');
    });
  });

  describe('#isObjEmpty', function() {
    it('returns true for blank objects', function() {
      expect(Utils.isObjEmpty({})).to.equal(true);
    });

    it('returns false for populated objects', function() {
      expect(Utils.isObjEmpty({key: 'value'})).to.equal(false);
    });
  });

  describe('#extend', function() {
    it('extends the object attributes', function() {
      var objA = {a: 1, b: 2};
      var objB = {b: 1, c: 2};
      var result = Utils.extend({}, objA, objB);

      expect(result.a).to.equal(1);
      expect(result.b).to.equal(1);
      expect(result.c).to.equal(2);
    });

    it('ignores undefined values', function() {
      var objA = {a: 1, b: 2};
      var objB = {b: 1, c: undefined};
      var result = Utils.extend({}, objA, objB);

      expect(result).to.deep.equal({a: 1, b: 1});
    });

    it('merge object keys deeply', function() {
      var objA = {a: {a1: 1, b1: 'yes'}};
      var objB = {a: {a1: 2, c1: false}, b: true, c: 2};
      var objC = {c: {c1: [1, 2]}};
      var result = Utils.extend({}, objA, objB, objC);

      expect(result.a).to.deep.equal({a1: 2, b1: 'yes', c1: false});
      expect(result.b).to.equal(true);
      expect(result.c).to.deep.equal({c1: [1, 2]});
    });
  });

  describe('#params', function() {
    describe('for non-object', function() {
      it('returns the original entry', function() {
        expect(Utils.params(1)).to.equal(1);
        expect(Utils.params(1.1)).to.equal(1.1);
        expect(Utils.params('value')).to.equal('value');
      });
    });

    describe('for objects', function() {
      it('ignores undefined or null values', function() {
        expect(Utils.params({a: 1, b: undefined, c: null})).to.equal('a=1')
      });

      it('appends & for multiple values', function() {
        expect(Utils.params({a: 1, b: 'val', c: true})).to.equal('a=1&b=val&c=true');
      });

      it('encodes "%20" to "+"', function() {
        var params = {a: 'some big string'};
        expect(Utils.params(params)).to.equal('a=some+big+string');
      });

      describe('in blank', function() {
        it('returns an empty string', function() {
          expect(Utils.params({})).to.equal('');
        });
      });

      describe('with object values', function() {
        it('converts the keys to "key[another-key]" pattern', function() {
          var params = decodeURIComponent(Utils.params({a: {b: 1, c: 2}}));
          expect(params).to.equal('a[b]=1&a[c]=2');
        });

        it('works with nested objects', function() {
          var params = decodeURIComponent(Utils.params({a: {b: 1, c: {d: 2}}, e: 3}));
          expect(params).to.equal('a[b]=1&a[c][d]=2&e=3');
        });
      });

      describe('with array values', function() {
        it('converts the keys to "key[]" pattern', function() {
          var params = decodeURIComponent(Utils.params({a: [1, 2, 3]}));
          expect(params).to.equal('a[]=1&a[]=2&a[]=3');
        });

        it('works with nested arrays', function() {
          var params = decodeURIComponent(Utils.params({a: [1, [2, [3, 4]]]}));
          expect(params).to.equal('a[]=1&a[][]=2&a[][][]=3&a[][][]=4');
        });
      });
    });
  });

  describe('#parseResponseHeaders', function() {
    var responseHeaders;

    beforeEach(function() {
      responseHeaders = 'X-RateLimit-Remaining: 57\
\r\nLast-Modified: Mon, 09 Nov 2015 19:06:15 GMT\
\r\nETag: W/"679e71e24e6d901f5b36a55c5d80a32d"\
\r\nContent-Type: application/json; charset=utf-8\
\r\nCache-Control: public, max-age=60, s-maxage=60\
\r\nX-RateLimit-Reset: 1447102379\
\r\nX-RateLimit-Limit: 60\
';
    });

    it('returns an object with all headers with lowercase keys', function() {
      var headers = Utils.parseResponseHeaders(responseHeaders);
      expect(headers).to.have.property('x-ratelimit-remaining', '57');
      expect(headers).to.have.property('last-modified', 'Mon, 09 Nov 2015 19:06:15 GMT');
      expect(headers).to.have.property('etag', 'W/"679e71e24e6d901f5b36a55c5d80a32d"');
      expect(headers).to.have.property('content-type', 'application/json; charset=utf-8');
      expect(headers).to.have.property('cache-control', 'public, max-age=60, s-maxage=60');
      expect(headers).to.have.property('x-ratelimit-reset', '1447102379');
      expect(headers).to.have.property('x-ratelimit-limit', '60');
    });
  });

  describe('#performanceNow', function() {
    it('returns the same value as "performance.now()"', function() {
      sinon.stub(performance, 'now').returns(999);
      expect(Utils.performanceNow()).to.equal(999);
      performance.now.restore();
    });
  });

  describe('#humanizeTimeElapsed', function() {
    describe('with a time >= 1000 milliseconds', function() {
      it('returns in seconds fixed with 2 decimals', function() {
        expect(Utils.humanizeTimeElapsed(1000)).to.equal('1.00 s');
        expect(Utils.humanizeTimeElapsed(1000.01)).to.equal('1.00 s');
        expect(Utils.humanizeTimeElapsed(2500)).to.equal('2.50 s');
      });
    });

    describe('with a time < 1000 milliseconds', function() {
      it('returns in milliseconds fixed with 2 decimals', function() {
        expect(Utils.humanizeTimeElapsed(999.99)).to.equal('999.99 ms');
        expect(Utils.humanizeTimeElapsed(999)).to.equal('999.00 ms');
        expect(Utils.humanizeTimeElapsed(30)).to.equal('30.00 ms');
      });
    });
  });

  describe('#Exception', function() {
    var myError;

    beforeEach(function() {
      myError = new Utils.Exception('wrong!');
    });

    it('creates an object with "message" attribute', function() {
      expect(myError).to.have.property('message', '[Mappersmith] wrong!');
    });

    it('prepends "[Mappersmith]" to the "toString" method', function() {
      expect(myError.toString()).to.match(/^\[Mappersmith\]/);
    });
  });
});
