import forge from '../index'
import { Middleware } from './index'
import { install, uninstall, mockRequest, m } from '../../../test/src/index'

describe('middleware', () => {
  beforeAll(install)
  afterAll(uninstall)
  const host = 'http://example.org'
  const path = '/api/test'

  describe('prepareRequest', () => {
    beforeEach(() => {
      mockRequest({
        method: 'get',
        url: `${host}${path}`,
        body: undefined,
        headers: {},
        response: {
          body: { ok: true },
          status: 200,
        },
      })
    })

    const createContextMiddleware =
      (spy: jest.Mock, context: Record<string, unknown>): Middleware =>
      () => ({
        prepareRequest: async (next) => {
          const request = await next()
          const contextBefore = request.context()
          spy(contextBefore)

          const newRequest = request.enhance({}, context)
          const contextAfter = newRequest.context()
          spy(contextAfter)

          return newRequest
        },
      })

    it('invokes middleware and extends request context in given order', async () => {
      const spy = jest.fn()
      const mw1 = createContextMiddleware(spy, { foo: 'bar' })
      const mw2 = createContextMiddleware(spy, { ctx: 'yup' })
      const mw3 = createContextMiddleware(spy, { ctx: 'bts' })
      const client = forge({
        clientId: 'testMw',
        middleware: [mw1, mw2, mw3],
        host,
        resources: { Resource: { find: { path } } },
      })
      await client.Resource.find()
      // mw1 applied
      expect(spy).toHaveBeenNthCalledWith(1, {})
      expect(spy).toHaveBeenNthCalledWith(2, { foo: 'bar' })
      // mw2 applied
      expect(spy).toHaveBeenNthCalledWith(3, { foo: 'bar' })
      expect(spy).toHaveBeenNthCalledWith(4, { ctx: 'yup', foo: 'bar' })
      // mw3 applied
      expect(spy).toHaveBeenNthCalledWith(5, { ctx: 'yup', foo: 'bar' })
      expect(spy).toHaveBeenNthCalledWith(6, { ctx: 'bts', foo: 'bar' })
    })

    it('invokes resource specific middleware first', async () => {
      const spy = jest.fn()
      const mw1 = createContextMiddleware(spy, { foo: 'bar' })
      const mw2 = createContextMiddleware(spy, { ctx: 'yup' })
      const mw3 = createContextMiddleware(spy, { ctx: 'bts' })
      const client = forge({
        clientId: 'testMw',
        middleware: [mw1, mw3],
        host,
        resources: { Resource: { find: { path, middleware: [mw2] } } },
      })
      await client.Resource.find()
      // mw2 applied
      expect(spy).toHaveBeenNthCalledWith(1, {})
      expect(spy).toHaveBeenNthCalledWith(2, { ctx: 'yup' })
      // mw1 applied
      expect(spy).toHaveBeenNthCalledWith(3, { ctx: 'yup' })
      expect(spy).toHaveBeenNthCalledWith(4, { ctx: 'yup', foo: 'bar' })
      // mw3 applied
      expect(spy).toHaveBeenNthCalledWith(5, { ctx: 'yup', foo: 'bar' })
      expect(spy).toHaveBeenNthCalledWith(6, { ctx: 'bts', foo: 'bar' })
    })
  })

  describe('response', () => {
    beforeEach(() => {
      mockRequest({
        method: 'post',
        url: `${host}${path}`,
        body: m.anything(),
        headers: {},
        response: {
          body: { ok: true },
          status: 200,
        },
      })
    })

    const createMiddleware =
      (spy: jest.Mock, params: Record<string, string>): Middleware =>
      () => ({
        prepareRequest: async (next) => {
          const request = await next()
          return request.enhance({}, params)
        },
        response: async (next, _renew, request) => {
          const context = request.context()
          spy(params)
          spy(context)
          const response = await next()
          return response
        },
      })

    it('invokes middleware and extends response context in given order', async () => {
      const spy = jest.fn()
      const mw1 = createMiddleware(spy, { foo: 'mw1' })
      const mw2 = createMiddleware(spy, { ctx: 'mw2' })
      const mw3 = createMiddleware(spy, { ctx: 'mw3' })
      const client = forge({
        clientId: 'testMw',
        middleware: [mw1, mw2, mw3],
        host,
        resources: { Resource: { create: { method: 'post', path } } },
      })
      await client.Resource.create()
      // mw3 applied
      expect(spy).toHaveBeenNthCalledWith(1, { ctx: 'mw3' })
      expect(spy).toHaveBeenNthCalledWith(2, { foo: 'mw1', ctx: 'mw3' })
      // mw2 applied
      expect(spy).toHaveBeenNthCalledWith(3, { ctx: 'mw2' })
      expect(spy).toHaveBeenNthCalledWith(4, { foo: 'mw1', ctx: 'mw3' })
      // mw1 applied
      expect(spy).toHaveBeenNthCalledWith(5, { foo: 'mw1' })
      expect(spy).toHaveBeenNthCalledWith(6, { foo: 'mw1', ctx: 'mw3' })
    })

    it('invokes resource specific middleware first', async () => {
      const spy = jest.fn()
      const mw1 = createMiddleware(spy, { foo: 'mw1' })
      const mw2 = createMiddleware(spy, { ctx: 'mw2' })
      const mw3 = createMiddleware(spy, { ctx: 'mw3' })
      const client = forge({
        clientId: 'testMw',
        middleware: [mw1, mw3],
        host,
        resources: { Resource: { post: { method: 'post', path, middleware: [mw2] } } },
      })
      await client.Resource.post()
      // mw3 applied
      expect(spy).toHaveBeenNthCalledWith(1, { ctx: 'mw3' })
      expect(spy).toHaveBeenNthCalledWith(2, { foo: 'mw1', ctx: 'mw3' })
      // mw1 applied
      expect(spy).toHaveBeenNthCalledWith(3, { foo: 'mw1' })
      expect(spy).toHaveBeenNthCalledWith(4, { foo: 'mw1', ctx: 'mw3' })
      // mw2 applied
      expect(spy).toHaveBeenNthCalledWith(5, { ctx: 'mw2' })
      expect(spy).toHaveBeenNthCalledWith(6, { foo: 'mw1', ctx: 'mw3' })
    })
  })
})
