var expect = chai.expect;

describe('Env', function() {
  it('has USE_PROMISES = false', function() {
    expect(Mappersmith.Env.USE_PROMISES).to.eql(false);
  });
});
