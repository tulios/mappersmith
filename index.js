var Mapper = require('./src/mapper.js');

module.exports = {
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),
  forge: function(manifest, gateway) {
    return new Mapper(manifest, gateway).build();
  }
}
