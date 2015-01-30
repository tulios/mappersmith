var shared = $shared;

describe('gateway impl', function() {

  gatewayImplSpecFor('VanillaGateway', Mappersmith.VanillaGateway);
  gatewayImplSpecFor('JQueryGateway', Mappersmith.JQueryGateway);

});
