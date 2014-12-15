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
