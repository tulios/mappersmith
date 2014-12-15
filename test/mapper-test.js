var expect = chai.expect;
var Mapper = Mappersmith.Mapper;

describe('Mapper', function() {
  var mapper,
      manifest,
      gateway;

  beforeEach(function() {
    manifest = {
      host: 'http://full-url',
      resources: {
        Book: {
          'all':  {path: '/v1/books.json'},
          'byId': {path: '/v1/books/{id}.json'}
        },
        Photo: {
          'byCategory': {path: '/v1/photos/{category}/all.json'}
        }
      }
    }

    gateway = sinon.stub({get: function() {}}, 'get');
    mapper = new Mapper(manifest, gateway);
  });

  describe('#newGatewayRequest', function() {
    var method,
        fullUrl,
        path,
        params,
        callback;

    beforeEach(function() {
      method = 'get';
      fullUrl = 'http://full-url/path';
      path = 'path';
      params = {a: true};
      callback = function() {};
    });

    it('returns a function', function() {
      var output = typeof mapper.newGatewayRequest(method, path);
      expect(output).to.equals('function');
    });

    it('returns a configured gateway', function() {
      var request = mapper.newGatewayRequest(method, path);

      expect(request(params, callback)).to.be.an.instanceof(gateway);
      expect(gateway).to.have.been.calledWith(fullUrl + '?a=true', method, callback);
    });

    describe('without params', function() {
      it('considers callback as the first argument', function() {
        var request = mapper.newGatewayRequest(method, path);

        expect(request(callback)).to.be.an.instanceof(gateway);
        expect(gateway).to.have.been.calledWith(fullUrl, method, callback);
      });
    });
  });

});
