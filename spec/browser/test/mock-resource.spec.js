import forge from 'src/index'
import MockAssert from 'src/mocks/mock-assert'
import EncodeJsonMiddleware from 'src/middlewares/encode-json'
import { getManifest, headerMiddleware } from 'spec/helper'

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

    client.User.all().then((response) => {
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

    client.User.byId({ id: 1 }).then((response) => {
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

  it('triggers the catch block on http errors', (done) => {
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({ id: 1 })
      .status(422)
      .response({ invalid: true })

    client.User.byId({ id: 1 }).then((response) => {
      const error = response.rawData ? response.rawData() : response
      done.fail(`Expected this request to fail: ${error}`)
    })
    .catch((response) => {
      expect(response.status()).toEqual(422)
      expect(response.data()).toEqual({ invalid: true })
      done()
    })
  })

  it('works with different http methods', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .response({ created: true })

    client.Blog.post().then((response) => {
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

    client.Blog.post().then((response) => {
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

  it('works without a response', (done) => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .status(204)

    client.Blog.post().then((response) => {
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

    client.Blog.post({ body: 'ok' }).then((response) => {
      expect(response.request().method()).toEqual('post')
      expect(response.status()).toEqual(200)
      done()
    })
    .catch((response) => {
      const error = response.rawData ? response.rawData() : response
      done.fail(`test failed with promise error: ${error}`)
    })

    client.Blog.post({ body: 'false' }).then((response) => {
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

    client.User.byId({ id }).then((response) => {
      expect(response.request().method()).toEqual('get')
      expect(response.status()).toEqual(200)
      done()
    })
    .catch((response) => {
      const error = response.rawData ? response.rawData() : response
      done.fail(`test failed with promise error: ${error}`)
    })

    client.User.byId({ id: 'not_match' }).then((response) => {
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

    client.User.all({ q: query }).then((response) => {
      expect(response.request().method()).toEqual('get')
      expect(response.status()).toEqual(200)
      done()
    })
    .catch((response) => {
      const error = response.rawData ? response.rawData() : response
      done.fail(`test failed with promise error: ${error}`)
    })

    client.User.all({ q: 'not_match' }).then((response) => {
      const error = response.rawData ? response.rawData() : response
      done.fail(`Expected this request to fail: ${error}`)
    })
    .catch((response) => {
      done()
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
  })
})
