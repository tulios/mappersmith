function nodeGenerateMakeRequest(context) {
  var nock = require('nock');
  var url = require('url');

  function generateDoneCallback(newThis, callback, stub, done) {
    return function() {
      callback.apply(newThis, arguments);
      if (!done.done) {
        stub.done();
        done();
        done.done = true;
      }
    }
  }

  return function(opts, done) {
    opts.rawData = opts.rawData || '';
    var contentType = 'application/json';
    var isJSON = false;

    try { JSON.parse(opts.rawData); isJSON = true; }
    catch(e1) { contentType = 'text/plain' }

    var urlParts = url.parse(context.url);
    var host = urlParts.protocol + '//' + urlParts.host;

    var args = [host];
    if (opts.assertHeader) args.push({reqheaders: opts.assertHeader});
    var stub = nock.apply(this, args);

    if (isJSON) {
      stub = stub.defaultReplyHeaders({
        'Content-Type': 'application/json'
      });
    }

    stub = stub[context.method];
    args = [urlParts.path];
    if (opts.assertBodyData) {
      args.push(opts.assertBodyData);
    }

    stub = stub.apply(this, args).reply(opts.status, opts.rawData);

    return opts.gateway.
      success(context.success).
      fail(context.fail).
      complete(generateDoneCallback(
        opts.gateway,
        context.complete,
        stub,
        done
      )).
      call();
  }
}

module.exports = nodeGenerateMakeRequest;
