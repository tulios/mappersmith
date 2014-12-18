module.exports = {
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper.js'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),
  forge: function(manifest, gateway) {
    return new this.Mapper(
      manifest,
      gateway || this.VanillaGateway
    ).build();
  }
}
