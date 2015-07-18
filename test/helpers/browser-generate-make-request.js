function browserGenerateMakeRequest(context) {
  var fakeServer;

  beforeEach(function() {
    fakeServer = sinon.fakeServer.create();
    fakeServer.lastRequest = function() {
      return fakeServer.requests[fakeServer.requests.length - 1];
    }
  });

  afterEach(function() {
    fakeServer.restore();
  });

  return function(opts, done) {
    opts.rawData = opts.rawData || '';
    var contentType = 'application/json; charset=utf-8';

    try { JSON.parse(opts.rawData) }
    catch(e1) { contentType = 'text/plain' }

    fakeServer.respondWith(
      context.method,
      context.url,
      [opts.status, {'Content-Type': contentType}, opts.rawData]
    );

    opts.gateway.
      success(context.success).
      fail(context.fail).
      complete(context.complete).
      call();

    fakeServer.respond();

    if (opts.assertHeader) {
      for (var header in opts.assertHeader) {
        var headerValue = fakeServer.lastRequest().requestHeaders[header];
        expect(headerValue).to.equal(opts.assertHeader[header]);
      }
    }

    if (opts.assertBodyData) {
      expect(fakeServer.lastRequest().requestBody).to.equal(opts.assertBodyData);
    }

    done();
  }
}

module.exports = browserGenerateMakeRequest;
