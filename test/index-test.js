var expect = chai.expect;
var Utils = Mappersmith.Utils;
var VanillaGateway = Mappersmith.VanillaGateway;
var JQueryGateway = Mappersmith.JQueryGateway;
var Mapper = Mappersmith.Mapper;

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

  describe('#forge', function() {
    var mapper,
        build,
        manifest;

    beforeEach(function() {
      mapper = sinon.spy(Mappersmith, 'Mapper');
      build = sinon.spy(Mappersmith.Mapper.prototype, 'build');
      manifest = {resources: {}};
    });

    afterEach(function() {
      Mappersmith.Mapper.restore();
      Mappersmith.Mapper.prototype.build.restore();
    });

    it('builds a new mapper with default gateway', function() {
      Mappersmith.forge(manifest);

      expect(mapper).to.have.been.calledWith(manifest, VanillaGateway);
      expect(build).to.have.been.called;
    });

    it('accepts a custom gateway', function() {
      Mappersmith.forge(manifest, JQueryGateway);

      expect(mapper).to.have.been.calledWith(manifest, JQueryGateway);
      expect(build).to.have.been.called;
    });
  });

});
