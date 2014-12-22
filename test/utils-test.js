var expect = chai.expect;
var Utils = Mappersmith.Utils;

describe('Utils', function() {
  describe('#noop', function() {
    it('is a function', function() {
      expect(typeof Utils.noop).to.equal('function');
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

  describe('#Exception', function() {
    var myError;

    beforeEach(function() {
      myError = new Utils.Exception('wrong!');
    });

    it('creates an object with "message" attribute', function() {
      expect(myError).to.have.property('message', 'wrong!');
    });

    it('prepends "[Mappersmith]" to the "toString" method', function() {
      expect(myError.toString()).to.match(/^\[Mappersmith\]/);
    });
  });
});
