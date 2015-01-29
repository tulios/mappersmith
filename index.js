module.exports = {
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),

  forge: require('./src/forge'),
  createGateway: require('./src/create-gateway'),

  node: function() {
    return (typeof window === 'undefined') ? {
      NodeVanillaGateway: require('./src/gateway/node-vanilla-gateway')
    } : null
  }
}
