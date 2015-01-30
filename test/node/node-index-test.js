require('./test-helper');
var Mappersmith = require('../../node');

describe('Mappersmith', function() {
  describe('attribute "node"', function() {

    it('exposes NodeVanillaGateway', function() {
      expect(Mappersmith.node.NodeVanillaGateway).to.exist();
    });

  });
});
