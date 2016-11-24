import ClientBuilder from 'src/client-builder'
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

describe('ClientBuilder middlewares', () => {
  let manifest,
      gatewayInstance,
      gatewayClass,
      response,
      responseValue

  const createClient = () => new ClientBuilder(manifest, gatewayClass).build()

  beforeEach(() => {
    responseValue = 'success'
    manifest = getManifest()

    gatewayInstance = jasmine.createSpyObj('gatewayInstance', ['call'])
    gatewayClass = jasmine.createSpy('GatewayConstructor')
      .and
      .callFake((request) => {
        response = new Response(request, 200, responseValue)
        gatewayInstance.call.and.returnValue(Promise.resolve(response))
        return gatewayInstance
      })

    manifest.middlewares = [ headerMiddleware ]
  })

  afterEach(() => resetCountMiddleware())

  it('calls request and response phase', () => {
    const requestPhase = jasmine.createSpy('requestPhase')
    const responsePhase = jasmine.createSpy('responsePhase')
      .and
      .returnValue(() => Promise.resolve())

    const middleware = () => ({ request: requestPhase, response: responsePhase })
    manifest.middlewares = [ middleware ]

    createClient().User.byId({ id: 1 })
    expect(requestPhase).toHaveBeenCalledWith(jasmine.any(Request))
    expect(responsePhase).toHaveBeenCalledWith(jasmine.any(Function))
  })

  it('can change the final request object', (done) => {
    createClient().User
      .byId({ id: 1 })
      .then((response) => {
        expect(response.request().headers())
          .toEqual(jasmine.objectContaining({ 'x-middleware-phase': 'request' }))
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
          .toEqual(jasmine.objectContaining({ 'x-middleware-phase': 'response' }))
      })
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('calls all middlewares chainning the "next" function', (done) => {
    responseValue = getCountMiddlewareCurrent()

    manifest.middlewares = [
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

  it('accepts middlewares with only one phase defined', (done) => {
    let m1RequestCalled = false
    let m2ResponseCalled = false

    const m1 = () => ({
      request: (request) => { m1RequestCalled = true; return request }
    })

    const m2 = () => ({
      response: (next) => { m2ResponseCalled = true; return next() }
    })

    manifest.middlewares = [ m1, m2 ]

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
