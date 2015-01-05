var expect = chai.expect;

describe('Mappersmith', function() {
  it('exposes Utils', function() {
    expect(Mappersmith.Utils).to.exist();
  });

  it('exposes Gateway', function() {
    expect(Mappersmith.Gateway).to.exist();
  });

  it('exposes Mapper', function() {
    expect(Mappersmith.Mapper).to.exist();
  });

  it('exposes JQueryGateway', function() {
    expect(Mappersmith.JQueryGateway).to.exist();
  });

  it('exposes VanillaGateway', function() {
    expect(Mappersmith.VanillaGateway).to.exist();
  });

  it('exposes method forge', function() {
    expect(Mappersmith.forge).to.exist();
  });
});
