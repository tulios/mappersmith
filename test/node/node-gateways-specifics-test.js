require('./test-helper');
var Mappersmith = require('../../node');
var nock = require('nock');

describe('Gateways specifics', function() {
  var host,
      path,
      data,
      success;

  beforeEach(function() {
    host = 'http://test-host';
    path = '/test-path';
    data = {data: 'value'};
    success = sinon.spy(function(){});
  });

  function newGateway() {
    return new Mappersmith.node.NodeVanillaGateway({
      url: host + path,
      method: 'get'
    });
  }


  describe('NodeVanillaGateway', function() {
    describe('extra stats', function() {
      beforeEach(function(done) {
        nock(host).
          defaultReplyHeaders({'Content-Type': 'application/json'}).
          get(path).
          reply(200, JSON.stringify(data));

        newGateway().
          success(success).
          complete(function() { done() }).
          call();
      });

      it('returns response headers', function() {
        var stats = success.args[0][1];
        expect(stats).to.not.be.undefined;
        expect(stats).to.have.property('responseHeaders');
        expect(stats.responseHeaders).to.have.property('content-type', 'application/json');
      });

    });
  });
});
