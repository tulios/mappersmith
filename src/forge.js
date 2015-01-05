var Mapper = require('./mapper');
var VanillaGateway = require('./gateway/vanilla-gateway');

module.exports = function(manifest, gateway, bodyAttr) {
  return new Mapper(
    manifest,
    gateway || VanillaGateway,
    bodyAttr || 'body'
  ).build();
}
