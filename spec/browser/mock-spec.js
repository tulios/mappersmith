import forge from 'src/index'
import MockAssert from 'src/test/mock-assert'
import EncodeJsonMiddleware from 'src/middlewares/encode-json'
import { getManifest, headerMiddleware } from 'spec/helper'

import {
  install as installMock,
  uninstall as uninstallMock,
  mockClient,
  mockRequest
} from 'src/test'

describe('Test lib', () => {
  let client

  beforeEach(() => {
    installMock()
    client = forge(getManifest())
  })

  afterEach(() => {
    uninstallMock()
  })

  describe('mock resources', () => {
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
            done()
          })
          .catch((response) => {
            done.fail(response.data())
          })
      })
    })
  })

  describe('mock requests', () => {
    it('returns a MockAssert object', () => {
      const mock = mockRequest({
        method: 'get',
        url: 'http://example.org/users?sort=desc',
        response: {
          body: { ok3: true }
        }
      })

      expect(mock instanceof MockAssert).toEqual(true)
    })

    it('defaults status 200 and automatically includes "application/json" for object responses', (done) => {
      mockRequest({
        method: 'get',
        url: 'http://example.org/users?sort=desc',
        response: {
          body: { ok3: true }
        }
      })

      client.User.all({ sort: 'desc' }).then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual({ ok3: true })
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
      mockRequest({
        url: 'http://example.org/users/16',
        response: {
          status: 201,
          headers: { 'x-test-response': 'mock' },
          body: { ok4: true }
        }
      })

      client.User.byId({ id: 16 }).then((response) => {
        expect(response.status()).toEqual(201)
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-test-response': 'mock' }))
        expect(response.data()).toEqual({ ok4: true })
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
    })

    it('triggers the catch block on http errors', (done) => {
      mockRequest({
        method: 'get',
        url: 'http://example.org/users/15',
        response: {
          status: 503,
          body: { error: true }
        }
      })

      client.User.byId({ id: 15 }).then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        expect(response.status()).toEqual(503)
        expect(response.data()).toEqual({ error: true })
        done()
      })
    })

    it('works with different http methods', (done) => {
      mockRequest({
        method: 'post',
        url: 'http://example.org/blogs',
        body: 'param1=A&param2=B',
        response: {
          body: { created: true }
        }
      })

      client.Blog
        .post({ body: { param1: 'A', param2: 'B' } })
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
      mockRequest({
        method: 'post',
        url: 'http://example.org/blogs',
        response: {
          body: 'just text!'
        }
      })

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
  })

  describe('mock assert', () => {
    let mock

    beforeEach(() => {
      mock = mockClient(client)
        .resource('User')
        .method('all')
        .response({ ok1: true })
        .assertObject()
    })

    it('keeps track of the number of calls', (done) => {
      expect(mock.callsCount()).toEqual(0)
      client.User.all()
        .then(() => expect(mock.callsCount()).toEqual(1))
        .then(() => client.User.all())
        .then(() => expect(mock.callsCount()).toEqual(2))
        .then(() => done())
        .catch((response) => {
          const error = response.rawData ? response.rawData() : response
          done.fail(`test failed with promise error: ${error}`)
        })
    })

    it('returns the most recent call', (done) => {
      expect(mock.mostRecentCall()).toEqual(null)
      client.User.all({ headers: { call: 1 }})
        .then((response) => expect(mock.mostRecentCall().headers()).toEqual(response.request().headers()))
        .then(() => client.User.all({ headers: { call: 2 }}))
        .then((response) => expect(mock.mostRecentCall().headers()).toEqual(response.request().headers()))
        .then(() => done())
        .catch((response) => {
          const error = response.rawData ? response.rawData() : response
          done.fail(`test failed with promise error: ${error}`)
        })
    })
  })
})
