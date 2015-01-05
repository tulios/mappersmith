var Mapper = require('./mapper');
var VanillaGateway = require('./gateway/vanilla-gateway');

module.exports = function(manifest, gateway) {
  return new Mapper(
    manifest,
    gateway || VanillaGateway
  ).build();
}
