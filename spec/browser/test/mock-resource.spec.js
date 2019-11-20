import forge, { setContext } from 'src/index'
import MockAssert from 'src/mocks/mock-assert'
import EncodeJsonMiddleware from 'src/middlewares/encode-json'
import { getManifest, headerMiddleware, headerMiddlewareV2, asyncHeaderMiddleware } from 'spec/helper'

import {
  install as installMock,
  uninstall as uninstallMock,
  mockClient
} from 'src/test'

describe('Test lib / mock resources', () => {
  let client

  beforeEach(() => {
    installMock()
    client = forge(getManifest())
  })

  afterEach(() => {
    uninstallMock()
  })

  describe('#assertObject', () => {
    it('returns a MockAssert object', () => {
      const mock = mockClient(client)
        .resource('User')
        .method('all')
        .response({ ok1: true })
        .assertObject()

      expect(mock instanceof MockAssert).toEqual(true)
    })
  })

  it('defaults status 200 and automatically includes "application/json" for object responses', (done) => {
    mockClient(client)
      .resource('User')
      .method('all')
      .response({ ok1: true })

    client.User.all()
      .then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual({ ok1: true })
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'content-type': 'application/json'
        }))
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts custom status, headers, and params', (done) => {
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({ id: 1 })
      .headers({ 'x-test': 'mock' })
      .status(204)
      .response({ ok2: true })

    client.User.byId({ id: 1 })
      .then((response) => {
        expect(response.status()).toEqual(204)
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-test': 'mock' }))
        expect(response.data()).toEqual({ ok2: true })
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('triggers the catch block on http errors', async () => {
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({ id: 1 })
      .status(422)
      .response({ invalid: true })

    try {
      await client.User.byId({ id: 1 })
    } catch (response) {
      expect(response.status()).toEqual(422)
      expect(response.data()).toEqual({ invalid: true })
    }
  })

  it('works with different http methods', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .response({ created: true })

    client.Blog.post()
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual({ created: true })
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('works with text responses', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .response('just text!')

    client.Blog.post()
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('sets responseData and content type correctly over multiple mock requests', (done) => {
    mockClient(client)
      .resource('User')
      .method('all')
      .response({ key: 'value' })

    Promise
      .resolve()
      .then(() => client.User.all())
      .then((response) => {
        expect(response.responseData).toEqual('{"key":"value"}')
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'content-type': 'application/json'
        }))
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
      .then(() => client.User.all())
      .then((response) => {
        expect(response.responseData).toEqual('{"key":"value"}')
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'content-type': 'application/json'
        }))
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('works with functional responses', (done) => {
    const getStatus = (request, mock) => mock.callsCount() === 0 ? 204 : 200
    const getResponse = (request, mock) => mock.callsCount() === 0 ? 'first' : 'second'

    mockClient(client)
      .resource('Blog')
      .method('post')
      .status(getStatus)
      .response(getResponse)

    Promise
      .resolve()
      .then(() => client.Blog.post())
      .then((response) => { // returns first value of yield
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(204)
        expect(response.data()).toEqual('first')
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
      .then(() => client.Blog.post())
      .then((response) => { // returns second value of yield
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('second')
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
      .then(() => client.Blog.post())
      .then((response) => { // keeps returning second value
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('second')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('works without a response', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .status(204)

    client.Blog.post()
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(204)
        expect(response.data()).toBeNull()
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts a matcher function as a body', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .with({ body: (body) => body === 'ok' })

    client.Blog.post({ body: 'ok' })
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.Blog.post({ body: 'false' })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        done()
      })
  })

  it('accepts a matcher function for path parameters', (done) => {
    const id = 'match'
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({ id: (value) => value === id })

    client.User.byId({ id })
      .then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.User.byId({ id: 'not_match' })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        done()
      })
  })

  it('accepts a matcher function for query parameters', (done) => {
    const query = 'match'
    mockClient(client)
      .resource('User')
      .method('all')
      .with({ q: (value) => value === query })

    client.User.all({ q: query })
      .then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.User.all({ q: 'not_match' })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        done()
      })
  })

  it('matches the body params independent of order', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .with({ body: { param1: 'value1', param2: 'value2' } })

    client.Blog.post({ body: { param1: 'value1', param2: 'value2' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.Blog.post({ body: { param2: 'value2', param1: 'value1' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('matches the query params independent of order', (done) => {
    mockClient(client)
      .resource('User')
      .method('all')
      .with({ param1: 'value1', param2: 'value2' })

    client.User.all({ param1: 'value1', param2: 'value2' })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.User.all({ param2: 'value2', param1: 'value1' })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('matches headers', (done) => {
    mockClient(client)
      .resource('User')
      .method('all')
      .with({ headers: { 'x-custom-header': 'value' } })

    client.User.all({ headers: { 'x-custom-header': 'value' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.User.all({ headers: { 'x-another-header': 'another-value' } })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        done()
      })
  })

  it('skips matching headers if none are provided by the mock', (done) => {
    mockClient(client)
      .resource('User')
      .method('all')

    client.User.all({ headers: { 'x-custom-header': 'value' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts a matcher function for header parameter', (done) => {
    const isExpectedHeader = headers => headers['x-custom-header'] === 'value'

    mockClient(client)
      .resource('User')
      .method('all')
      .with({ headers: isExpectedHeader })

    client.User.all({ headers: { 'x-custom-header': 'value' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  describe('when using param matchers', () => {
    it('evaluates only params with matcher function, let others be', (done) => {
      mockClient(client)
        .resource('User')
        .method('all')
        .with({ param1: 'NOT_MATCHING', param2: () => true })

      client.User.all({ param1: 'THIS_SHOULD_NOT_MATCH', param2: 'anything' })
        .then(() => {
          done.fail(`should not find match`)
        })
        .catch(() => {
          done()
        })
    })
  })

  describe('when client is using middlewares', () => {
    let params

    beforeEach(() => {
      // client is using the `EncodeJson` middleware which will change the request body.
      // The mock request must go through the same transformation in order for them to match
      client = forge(getManifest([EncodeJsonMiddleware, headerMiddleware]))
      params = {
        body: {
          title: 'blog title',
          text: 'lorem ipsum'
        }
      }
    })

    it('executes the middlewares to modify the request and response', (done) => {
      mockClient(client)
        .resource('Blog')
        .method('post')
        .with(params)
        .status(200)
        .response({ ok: true })

      client.Blog
        .post(params)
        .then((response) => {
          expect(response.status()).toEqual(200)
          expect(response.request().headers()['x-middleware-phase']).toEqual('request')
          expect(response.headers()['x-middleware-phase']).toEqual('response')
          expect(response.headers()['x-resource-name']).toEqual('Blog')
          expect(response.headers()['x-resource-method']).toEqual('post')
          done()
        })
        .catch((response) => {
          done.fail(response.data())
        })
    })

    it('executes async middlewares', (done) => {
      client = forge(getManifest([EncodeJsonMiddleware, headerMiddlewareV2]))

      mockClient(client)
        .resource('Blog')
        .method('post')
        .with(params)
        .status(200)
        .response({ ok: true })
        .assertObject()

      client.Blog
        .post(params)
        .then((response) => {
          expect(response.status()).toEqual(200)
          expect(response.request().headers()['x-middleware-phase']).toEqual('prepare-request')
          expect(response.headers()['x-middleware-phase']).toEqual('response')
          expect(response.headers()['x-resource-name']).toEqual('Blog')
          expect(response.headers()['x-resource-method']).toEqual('post')
          done()
        })
        .catch((response) => {
          done.fail(response.data())
        })
    })
  })

  describe('when client is using middleware with async request', () => {
    let params

    beforeEach(() => {
      // client is using the `EncodeJson` middleware which will change the request body.
      // The mock request must go through the same transformation in order for them to match
      client = forge(getManifest([EncodeJsonMiddleware, asyncHeaderMiddleware]))
      params = {
        body: {
          title: 'blog title',
          text: 'lorem ipsum'
        }
      }
    })

    it('executes the middlewares to modify the request and response', async () => {
      await mockClient(client)
        .resource('Blog')
        .method('post')
        .with(params)
        .status(200)
        .response({ ok: true })
        .assertObjectAsync()

      const response = await client.Blog.post(params)
      expect(response.status()).toEqual(200)
      expect(response.request().headers()['x-middleware-phase']).toEqual('request')
      expect(response.headers()['x-middleware-phase']).toEqual('response')
      expect(response.headers()['x-resource-name']).toEqual('Blog')
      expect(response.headers()['x-resource-method']).toEqual('post')
    })
  })

  describe('when client is using middlewares with context', () => {
    let params

    beforeEach(() => {
      const ContextMiddleware = ({ context }) => ({
        request: req => req.enhance({ headers: { 'x-context': context.headerFromContext } })
      })
      client = forge(getManifest([ContextMiddleware]))
      params = {
        body: {
          title: 'blog title',
          text: 'lorem ipsum'
        }
      }
    })

    it('executes the middlewares using context', (done) => {
      mockClient(client)
        .resource('Blog')
        .method('post')
        .with(params)
        .status(200)
        .response({ ok: true })

      setContext({ headerFromContext: 'header from context' })

      client.Blog
        .post(params)
        .then((response) => {
          expect(response.status()).toEqual(200)
          expect(response.request().headers()['x-context']).toEqual('header from context')
          done()
        })
        .catch((response) => {
          done.fail(response.data())
        })
    })
  })
})
