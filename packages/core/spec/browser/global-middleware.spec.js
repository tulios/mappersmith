import forge, { configs } from '../../src/mappersmith'
import Response from '../../src/response'
import { getManifest } from '../ts-helper'

/**
 * There is a weird side-effect going on when importing from this file
 * where it runs `src/index` and sets configs.gateway:
 * `defaultGateway = require('./gateway/xhr').default`
 */
import * as thisIsFishy from '../helper' // eslint-disable-line @typescript-eslint/no-unused-vars

describe('when global middleware is present', () => {
  beforeEach(() => {
    configs.middleware = ['global']
  })

  it('adds it to each client manifest', () => {
    const manifest = getManifest()
    const client1 = forge(Object.assign(manifest, { middleware: ['first'] }))
    const client2 = forge(Object.assign(manifest, { middleware: ['second'] }))

    expect(client1._manifest.middleware).toEqual(['first', 'global'])
    expect(client2._manifest.middleware).toEqual(['second', 'global'])
  })

  it('can be ignore with "ignoreGlobalMiddleware"', () => {
    const manifest = getManifest()
    manifest.ignoreGlobalMiddleware = true

    const client1 = forge(Object.assign(manifest, { middleware: ['first'] }))
    const client2 = forge(Object.assign(manifest, { middleware: ['second'] }))

    expect(client1._manifest.middleware).toEqual(['first'])
    expect(client2._manifest.middleware).toEqual(['second'])
  })

  describe('with middleware on resource', () => {
    let gatewayInstance,
      response,
      callOrder,
      client,
      globalMiddleware,
      clientMiddleware,
      resourceMiddleware

    beforeEach(() => {
      gatewayInstance = { call: jest.fn() }
      configs.gateway = jest.fn((request) => {
        response = new Response(request, 200, 'success')
        gatewayInstance.call.mockReturnValue(Promise.resolve(response))
        return gatewayInstance
      })

      callOrder = []
      resourceMiddleware = jest.fn().mockImplementation(() => callOrder.push('resourceMiddleware'))
      clientMiddleware = jest.fn().mockImplementation(() => callOrder.push('clientMiddleware'))
      globalMiddleware = jest.fn().mockImplementation(() => callOrder.push('globalMiddleware'))
      configs.middleware = [globalMiddleware]

      const manifest = getManifest([clientMiddleware])
      manifest.resources.User.byId.middleware = [resourceMiddleware]
      client = forge(manifest)
    })

    it('invokes middlewares in correct order', async () => {
      await client.User.byId({ id: 1 })

      expect(globalMiddleware).toHaveBeenCalled()
      expect(clientMiddleware).toHaveBeenCalled()
      expect(resourceMiddleware).toHaveBeenCalled()

      expect(callOrder).toEqual(['resourceMiddleware', 'clientMiddleware', 'globalMiddleware'])
    })
  })
})
