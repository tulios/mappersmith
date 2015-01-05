var expect = chai.expect;
var Utils = Mappersmith.Utils;
var VanillaGateway = Mappersmith.VanillaGateway;
var JQueryGateway = Mappersmith.JQueryGateway;

describe('#forge', function() {
  var mapper,
  build,
  manifest;

  beforeEach(function() {
    mapper = sinon.spy(Mappersmith, 'Mapper');
    build = sinon.spy(Mappersmith.Mapper.prototype, 'build');
    manifest = {resources: {}};

    Mappersmith.forge.__set__('Mapper', mapper);
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
