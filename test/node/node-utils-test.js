require('./test-helper');
var rewire = require("rewire");
var Utils = rewire('../../src/utils');

describe('Utils', function() {
  var restore;

  beforeEach(function() {
    restore = Utils.__set__('loadTime', Utils.__get__('getNanoSeconds')());
  });

  afterEach(function() {
    restore();
  });

  describe('when in nodejs', function() {

    describe('#performanceNow', function() {
      it('initially gives a near zero (< 20 ms) time', function() {
        expect(Utils.performanceNow()).to.be.below(20);
      });

      it('gives a positive time', function() {
        expect(Utils.performanceNow()).to.be.above(0);
      });

      it('two subsequent calls return an increasing number', function() {
        expect(Utils.performanceNow()).to.be.below(Utils.performanceNow());
      });

      it('has less than 10 microseconds overhead', function() {
        expect(Math.abs(Utils.performanceNow() - Utils.performanceNow())).to.be.below(0.010);
      });

      it('shows that at least 990 ms has passed after a timeout of 1 second', function(done) {
        var a = Utils.performanceNow();
        setTimeout(function() {
          var b = Utils.performanceNow();
          var diff = b - a;
          if (diff < 990) return done('Diff (' + diff + ') lower than 990.');
          done();
        }, 1000);
      });

      it('shows that not more than 1020 ms has passed after a timeout of 1 second', function(done) {
        var a = Utils.performanceNow();
        setTimeout(function() {
          var b = Utils.performanceNow();
          var diff = b - a;
          if (diff > 1020) return done('Diff (' + diff + ') higher than 1020.');
          done();
        }, 1000);
      });

    });
  });
});
