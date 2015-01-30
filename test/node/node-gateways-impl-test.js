require('./test-helper');
var gatewayImplSpecFor = require('../helpers/shared-gateway-impl-spec');
var Mappersmith = require('../../node');

describe('gateway impl', function() {

  gatewayImplSpecFor('NodeVanillaGateway', Mappersmith.node.NodeVanillaGateway);

});
