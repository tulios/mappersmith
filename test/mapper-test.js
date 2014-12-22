var expect = chai.expect;
var Mapper = Mappersmith.Mapper;

describe('Mapper', function() {
  var mapper,
      manifest,
      test,
      gateway;

  beforeEach(function() {
    manifest = {
      host: 'http://full-url',
      resources: {
        Book: {
          all:  {path: '/v1/books.json'},
          byId: {path: '/v1/books/{id}.json'},
          archived: '/v1/books/archived.json',
          byCategory: 'get:/v1/books/{category}/all.json'
        },
        Photo: {
          byCategory: {path: '/v1/photos/{category}/all.json'},
          add: {method: 'post', path: '/v1/photos/create.json'},
          byId: {
            path: '/v1/photos/{id}.json',
            processor: function(data) {
              return data.thumb;
            }
          }
        }
      }
    }

    test = {};
    test.gateway = function() {};
    test.gateway.prototype.get = function() {return this};
    test.gateway.prototype.success = function() {return this};
    test.gateway.prototype.call = function() {return this};

    sinon.spy(test, 'gateway');
    sinon.spy(test.gateway.prototype, 'get');
    sinon.spy(test.gateway.prototype, 'success');
    sinon.spy(test.gateway.prototype, 'call');

    gateway = test.gateway;
    mapper = new Mapper(manifest, gateway);
  });

  afterEach(function() {
    test.gateway.restore();
    test.gateway.prototype.get.restore();
    test.gateway.prototype.success.restore();
    test.gateway.prototype.call.restore();
  });

  describe('contructor', function() {
    it('holds a reference to manifest', function() {
      expect(mapper).to.have.property('manifest', manifest);
    });

    it('holds a reference to gateway', function() {
      expect(mapper).to.have.property('Gateway', gateway);
    });

    it('holds a reference to host', function() {
      expect(mapper).to.have.property('host', manifest.host);
    });

    it('holds a reference to bodyAttr', function() {
      mapper = new Mapper(manifest, gateway, 'data');
      expect(mapper).to.have.property('bodyAttr', 'data');
    });

    it('has a default value for bodyAttr', function() {
      expect(mapper).to.have.property('bodyAttr', 'body');
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
      expect(gateway.prototype.success).to.have.been.calledWith(callback);
      expect(gateway.prototype.call).to.have.been.called;
      expect(gateway).to.have.been.calledWith({
        url: fullUrl + '?a=true',
        method: method,
        params: params
      });
    });

    describe('without params', function() {
      it('considers callback as the first argument', function() {
        var request = mapper.newGatewayRequest(method, path);

        expect(request(callback)).to.be.an.instanceof(gateway);
        expect(gateway.prototype.success).to.have.been.calledWith(callback);
        expect(gateway.prototype.call).to.have.been.called;
        expect(gateway).to.have.been.calledWith({
          url: fullUrl,
          method: method
        });
      });

      describe('with opts for gateway', function() {
        it('considers opts as the second argument', function() {
          var request = mapper.newGatewayRequest(method, path);
          var opts = {jsonp: true};

          expect(request(callback, opts)).to.be.an.instanceof(gateway);
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
          expect(gateway.prototype.call).to.have.been.called;
          expect(gateway).to.have.been.calledWith({
            url: fullUrl,
            method: method,
            opts: opts
          });
        });
      });
    });

    describe('with body param', function() {
      it('includes the value defined by bodyAttr in the key "body"', function() {
        params[mapper.bodyAttr] = 'some-value';
        var request = mapper.newGatewayRequest(method, path);
        var result = {
          url: fullUrl + '?a=true',
          method: method,
          params: params
        }

        result[mapper.bodyAttr] = params[mapper.bodyAttr];

        expect(request(params, callback)).to.be.an.instanceof(gateway);
        expect(gateway.prototype.success).to.have.been.calledWith(callback);
        expect(gateway.prototype.call).to.have.been.called;
        expect(gateway).to.have.been.calledWith(result);
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

    describe('with bodyAttr in params', function() {
      it('does not include into the URL', function() {
        var params = {};
        params[mapper.bodyAttr] = 'some-value';
        expect(mapper.urlFor('/path', params)).to.equals('http://full-url/path');
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

  describe('#build', function() {
    var result;

    beforeEach(function() {
      result = mapper.build();
    });

    it('returns an object', function() {
      expect(result).to.be.a('object');
    });

    it('creates the namespaces', function() {
      expect(result.Book).to.be.a('object');
      expect(result.Photo).to.be.a('object');
    });

    it('creates configured methods for each namespace', function() {
      expect(result.Book.all).to.be.a('function');
      expect(result.Book.byId).to.be.a('function');
      expect(result.Book.archived).to.be.a('function');
      expect(result.Photo.byCategory).to.be.a('function');
    });

    describe('when calling the created methods', function() {
      var callback, method;

      beforeEach(function() {
        callback = function() {};
        method = 'get';
      });

      describe('without params', function() {
        it('calls the gateway with the configured values', function() {
          var path = manifest.resources.Book.all.path;
          var url = mapper.urlFor(path);

          result.Book.all(callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('with query string', function() {
        it('calls the gateway with the configured values', function() {
          var path = manifest.resources.Book.all.path;
          var params = {b: 2};
          var url = mapper.urlFor(path, params);

          result.Book.all(params, callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method,
            params: params
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('with params in the path', function() {
        it('calls the gateway with the configured values', function() {
          var path = manifest.resources.Book.byId.path;
          var params = {id: 3};
          var url = mapper.urlFor(path, params);

          result.Book.byId(params, callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method,
            params: params
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('with params in the path and query string', function() {
        it('calls the gateway with the configured values', function() {
          var path = manifest.resources.Book.byId.path;
          var params = {id: 3, d: 4};
          var url = mapper.urlFor(path, params);

          result.Book.byId(params, callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method,
            params: params
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('with non-default method', function() {
        it('calls the gateway with the configured values', function() {
          var path = manifest.resources.Photo.add.path;
          var url = mapper.urlFor(path);
          method = 'post';

          result.Photo.add(callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('with syntatic sugar for GET methods with no parameters', function() {
        it('calls the gateway with method GET', function() {
          var path = manifest.resources.Book.archived;
          var url = mapper.urlFor(path);

          result.Book.archived(callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });

        it('calls the gateway with query string', function() {
          var path = manifest.resources.Book.archived;
          var params = {author: 'Daniel'};
          var url = mapper.urlFor(path, params);

          result.Book.archived(params, callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method,
            params: params
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });

      describe('resource definition compact syntax', function() {

        it('parses HTTP method and URL', function() {
          var compactDefinition = manifest.resources.Book.byCategory;
          var definitionComponents = compactDefinition.split(':');
          expect(definitionComponents).to.have.length(2);

          var method = definitionComponents[0];
          var path = definitionComponents[1];

          var url = mapper.urlFor(path);

          result.Book.byCategory(callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });

      });

      describe('processors', function() {
        it('should be passed to gateway', function() {
          var path = manifest.resources.Photo.byId.path;
          var processor = manifest.resources.Photo.byId.processor;
          var params = {id: 3};
          var url = mapper.urlFor(path, params);

          result.Photo.byId(params, callback);
          expect(gateway).to.have.been.calledWith({
            url: url,
            method: method,
            params: params,
            processor: processor
          });
          expect(gateway.prototype.success).to.have.been.calledWith(callback);
        });
      });
    });
  });
});
