var Mappersmith = require('../index');

var shared = require('shared-examples-for');
var gatewayImplSpecFor = require('./helpers/shared-gateway-impl-spec');

describe('gateway impl', function() {

  gatewayImplSpecFor('VanillaGateway', Mappersmith.VanillaGateway);
  gatewayImplSpecFor('JQueryGateway', Mappersmith.JQueryGateway);

});
