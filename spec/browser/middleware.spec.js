import forge, { setContext, configs } from 'src/mappersmith'
import Request from 'src/request'
import Response from 'src/response'

import {
  headerMiddleware,
  countMiddleware,
  getCountMiddlewareCurrent,
  getCountMiddlewareStack,
  resetCountMiddleware,
  getManifest
} from 'spec/helper'

describe('ClientBuilder middleware', () => {
  let manifest,
    gatewayInstance,
    response,
    responseValue

  const createClient = () => forge(manifest)

  beforeEach(() => {
    responseValue = 'success'
    manifest = getManifest()

    gatewayInstance = { call: jest.fn() }
    configs.gateway = jest.fn((request) => {
      response = new Response(request, 200, responseValue)
      gatewayInstance.call.mockReturnValue(Promise.resolve(response))
      return gatewayInstance
    })

    manifest.middleware = [ headerMiddleware ]
  })

  afterEach(() => resetCountMiddleware())

  it('receives an object with "resourceName", "resourceMethod" and empty "context"', () => {
    const middleware = jest.fn()
    manifest.middleware = [ middleware ]

    createClient().User.byId({ id: 1 })
    expect(middleware).toHaveBeenCalledWith(expect.objectContaining({
      resourceName: 'User',
      resourceMethod: 'byId',
      context: {},
      clientId: null
    }))
  })

  it('receives a clientId if present in manifest', () => {
    const middleware = jest.fn()
    const manifest = getManifest([middleware], null, 'someClient')
    const client = forge(manifest)

    client.User.byId({ id: 1 })

    expect(middleware).toBeCalledWith(expect.objectContaining({ clientId: 'someClient' }))
  })

  it('receives current context', () => {
    const middleware = jest.fn()
    manifest.middleware = [ middleware ]

    const client = createClient()

    setContext({ foo: 'bar' })
    client.User.byId({ id: 1 })

    expect(middleware).toBeCalledWith(expect.objectContaining({ context: { foo: 'bar' } }))

    const client2 = createClient()
    client2.User.byId({ id: 1 })
    expect(middleware).lastCalledWith(expect.objectContaining({ context: { foo: 'bar' } }))
    expect(middleware).toHaveBeenCalledTimes(2)

    setContext({ foo: 'baz' })
    client.User.byId({ id: 1 })
    expect(middleware).toBeCalledWith(expect.objectContaining({ context: { foo: 'baz' } }))
  })

  it('calls request and response phase', () => {
    const requestPhase = jest.fn()
    const responsePhase = jest.fn(() => Promise.resolve())

    const middleware = () => ({ request: requestPhase, response: responsePhase })
    manifest.middleware = [ middleware ]

    createClient().User.byId({ id: 1 })
    expect(requestPhase).toHaveBeenCalledWith(expect.any(Request))
    expect(responsePhase).toHaveBeenCalledWith(expect.any(Function))
  })

  it('can change the final request object', (done) => {
    createClient().User
      .byId({ id: 1 })
      .then((response) => {
        expect(response.request().headers())
          .toEqual(expect.objectContaining({ 'x-middleware-phase': 'request' }))
      })
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('can change the final response object', (done) => {
    createClient().User
      .byId({ id: 1 })
      .then((response) => {
        expect(response.headers())
          .toEqual(expect.objectContaining({ 'x-middleware-phase': 'response' }))
      })
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('calls all middleware chainning the "next" function', (done) => {
    responseValue = getCountMiddlewareCurrent()

    manifest.middleware = [
      countMiddleware,
      countMiddleware,
      countMiddleware,
      countMiddleware
    ]

    createClient().User
      .byId({ id: 1 })
      .then((response) => {
        expect(response.data()).toEqual(4)
        expect(getCountMiddlewareStack()).toEqual([0, 1, 2, 3])
      })
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts middleware with only one phase defined', (done) => {
    let m1RequestCalled = false
    let m2ResponseCalled = false

    const m1 = () => ({
      request: (request) => { m1RequestCalled = true; return request }
    })

    const m2 = () => ({
      response: (next) => { m2ResponseCalled = true; return next() }
    })

    manifest.middleware = [ m1, m2 ]

    createClient().User
      .byId({ id: 1 })
      .then((response) => {
        expect(response.data()).toEqual(responseValue)
        expect(m1RequestCalled).toEqual(true)
        expect(m2ResponseCalled).toEqual(true)
      })
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })
})
