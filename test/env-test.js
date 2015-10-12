var Mappersmith = require('../index');

describe('Env', function() {
  it('has USE_PROMISES = false', function() {
    expect(Mappersmith.Env.USE_PROMISES).to.eql(false);
  });

  it('has USE_FIXTURES = false', function() {
    expect(Mappersmith.Env.USE_FIXTURES).to.eql(false);
  });

  // We don't want fixtures in "production" scripts
  it('has Fixture = null', function() {
    expect(Mappersmith.Env.Fixture).to.eql(null);
  });
});
