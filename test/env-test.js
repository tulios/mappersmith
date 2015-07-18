var Mappersmith = require('../index');

describe('Env', function() {
  it('has USE_PROMISES = false', function() {
    expect(Mappersmith.Env.USE_PROMISES).to.eql(false);
  });
});
