import ClientBuilder from 'src/client-builder'
import Manifest from 'src/manifest'
import Request from 'src/request'
import { getManifest, getManifestWithResourceConf } from 'spec/helper'

describe('ClientBuilder', () => {
  let manifest, gatewayClass, configs, gatewayInstance, GatewayClassFactory, clientBuilder, client

  beforeEach(() => {
    manifest = getManifest()

    gatewayInstance = { call: jest.fn() }
    gatewayClass = jest.fn(() => gatewayInstance)
    configs = {
      Promise,
      gatewayConfigs: {
        gateway: 'configs',
      },
      middleware: [],
      context: {},
    }

    GatewayClassFactory = () => gatewayClass
    clientBuilder = new ClientBuilder(manifest, GatewayClassFactory, configs)
    client = clientBuilder.build()
  })

  it('creates an object with all resources, methods, and a reference to the manifest', () => {
    expect(client.User).toEqual(expect.any(Object))
    expect(client.User.byId).toEqual(expect.any(Function))

    expect(client.Blog).toEqual(expect.any(Object))
    expect(client.Blog.post).toEqual(expect.any(Function))
    expect(client.Blog.addComment).toEqual(expect.any(Function))

    expect(client._manifest instanceof Manifest).toEqual(true)
  })

  it('accepts custom gatewayConfigs', async () => {
    const customGatewayConfigs = { custom: 'configs' }
    manifest = getManifest([], customGatewayConfigs)
    clientBuilder = new ClientBuilder(manifest, GatewayClassFactory, configs)
    client = clientBuilder.build()

    gatewayInstance.call.mockReturnValue(Promise.resolve('value'))
    const response = await client.User.byId({ id: 1 })
    expect(response).toEqual('value')
    expect(gatewayClass).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        custom: 'configs',
        gateway: 'configs',
      })
    )

    expect(gatewayInstance.call).toHaveBeenCalled()
  })

  it('accepts manifest level resource configs', async () => {
    manifest = getManifestWithResourceConf()

    gatewayInstance = { call: jest.fn() }
    gatewayClass = jest.fn(() => gatewayInstance)
    configs = {
      Promise,
      gatewayConfigs: {
        gateway: 'configs',
      },
      middleware: [],
      context: {},
    }

    GatewayClassFactory = () => gatewayClass
    clientBuilder = new ClientBuilder(manifest, GatewayClassFactory, configs)
    client = clientBuilder.build()

    gatewayInstance.call.mockReturnValue(Promise.resolve('value'))
    const response = await client.Blog.post({ customAttr: 'blog post' })
    expect(response).toEqual('value')
    expect(gatewayClass).toHaveBeenCalledWith(expect.any(Request), configs.gatewayConfigs)
    expect(gatewayInstance.call).toHaveBeenCalled()

    const request = gatewayClass.mock.calls[0][0]
    expect(request).toEqual(expect.any(Request))
    expect(request.method()).toEqual('post')
    expect(request.host()).toEqual('http://example.org')
    expect(request.path()).toEqual('/blogs')
    expect(request.body()).toEqual('blog post')
  })

  describe('when a resource method is called', () => {
    it('calls the gateway with the correct request', async () => {
      gatewayInstance.call.mockReturnValue(Promise.resolve('value'))
      const response = await client.User.byId({ id: 1 })
      expect(response).toEqual('value')
      expect(gatewayClass).toHaveBeenCalledWith(expect.any(Request), configs.gatewayConfigs)
      expect(gatewayInstance.call).toHaveBeenCalled()

      const request = gatewayClass.mock.calls[0][0]
      expect(request).toEqual(expect.any(Request))
      expect(request.method()).toEqual('get')
      expect(request.host()).toEqual('http://example.org')
      expect(request.path()).toEqual('/users/1')
      expect(request.params()).toEqual({ id: 1 })
    })
  })

  describe('when manifest is not defined', () => {
    it('raises error', () => {
      expect(() => new ClientBuilder()).toThrowError('[Mappersmith] invalid manifest (undefined)')
    })
  })

  describe('when gatewayClass is not defined', () => {
    it('raises error', () => {
      expect(() => new ClientBuilder(manifest, null)).toThrowError(
        '[Mappersmith] gateway class not configured (configs.gateway)'
      )
    })
  })

  describe('when a resource path is not defined', () => {
    it('raises error', () => {
      manifest = { resources: { User: { all: {} } } }
      expect(() => new ClientBuilder(manifest, gatewayClass, configs).build()).toThrowError(
        '[Mappersmith] path is undefined for resource "User" method "all"'
      )
    })
  })
})
