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

  describe('contructor', function() {
    it('holds a reference to manifest', function() {
      expect(mapper).to.have.property('manifest', manifest);
    });

    it('holds a reference to gateway', function() {
      expect(mapper).to.have.property('gateway', gateway);
    });

    it('holds a reference to host', function() {
      expect(mapper).to.have.property('host', manifest.host);
    });
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

  describe('#urlFor', function() {
    describe('without params and query string', function() {
      describe('host and path with "/"', function() {
        it('returns host and path', function() {
          mapper.host = mapper.host + '/';
          expect(mapper.urlFor('/path')).to.equals('http://full-url/path');
        });
      });

      describe('host and path without "/"', function() {
        it('returns host and path', function() {
          expect(mapper.urlFor('path')).to.equals('http://full-url/path');
        });
      });

      describe('host with "/" and path without', function() {
        it('returns host and path', function() {
          mapper.host = mapper.host + '/';
          expect(mapper.urlFor('path')).to.equals('http://full-url/path');
        });
      });

      describe('host without "/" and path with', function() {
        it('returns host and path', function() {
          expect(mapper.urlFor('/path')).to.equals('http://full-url/path');
        });
      });
    });

    describe('with params in the path', function() {
      it('replaces params and returns host and path', function() {
        expect(mapper.urlFor('{a}/{b}', {a: 1, b: 2})).to.equals('http://full-url/1/2');
      });
    });

    describe('with query string in the path', function() {
      it('includes query string and returns host and path', function() {
        expect(mapper.urlFor('path', {a: 1, b: 2})).to.equals('http://full-url/path?a=1&b=2');
      });
    });

    describe('with query string and params in the path', function() {
      it('includes query string, replaces params and returns host and path', function() {
        expect(mapper.urlFor('{a}', {a: 1, b: 2})).to.equals('http://full-url/1?b=2');
      });
    });
  });
});
