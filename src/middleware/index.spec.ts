import forge from '../index'
import { Middleware } from 'middleware'
import { install, uninstall, mockRequest } from '../test'

describe('integration', () => {
  beforeAll(install)
  afterAll(uninstall)

  describe('middleware', () => {
    describe('prepareRequest', () => {
      const host = 'http://example.org'
      const path = '/api/test'

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
        // 1st mw
        expect(spy).toHaveBeenNthCalledWith(1, {})
        expect(spy).toHaveBeenNthCalledWith(2, { foo: 'bar' })
        // 2nd mw
        expect(spy).toHaveBeenNthCalledWith(3, { foo: 'bar' })
        expect(spy).toHaveBeenNthCalledWith(4, { ctx: 'yup', foo: 'bar' })
        // 3rd mw
        expect(spy).toHaveBeenNthCalledWith(5, { ctx: 'yup', foo: 'bar' })
        expect(spy).toHaveBeenNthCalledWith(6, { ctx: 'bts', foo: 'bar' })
      })
    })
  })
})
