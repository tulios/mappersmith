var mainModule = require('./');
module.exports = mainModule.Utils.extend(mainModule, {
  node: {

    NodeVanillaGateway: require('./src/gateway/node-vanilla-gateway')

  }
});
