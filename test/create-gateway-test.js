var Mappersmith = require('../index');
var Utils = Mappersmith.Utils;
var Gateway = Mappersmith.Gateway;

describe('#createGateway', function() {

  it('creates a new class that inherits from Gateway', function() {
    var otherGateway = Mappersmith.createGateway();

    Object.getOwnPropertyNames(Gateway.prototype).
      forEach(function(property) {
        expect(otherGateway.prototype).to.have.property(property, Gateway.prototype[property]);
      });
  });

  it('accepts a "init" method to be used as a constructor', function() {
    var obj = {myConstructor: Utils.noop};
    var myConstructor = sinon.spy(obj, 'myConstructor');
    var otherGateway = Mappersmith.createGateway({init: myConstructor});

    new otherGateway({url: 'http://url', method: 'GET'});
    expect(myConstructor).to.have.been.called;
  });

});
