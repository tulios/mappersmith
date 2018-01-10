import forge, { setContext, configs } from 'src/index'

describe('mappersmith', () => {
  describe('#setContext', () => {
    it('changes configs context', () => {
      configs.context = {}
      setContext({ foo: 'bar' })
      setContext({ bar: 'baz' })

      expect(configs.context).toEqual({
        foo: 'bar',
        bar: 'baz'
      })
    })
  })

  describe('#forge', () => {
    let originalConfig,
      manifest,
      gatewayClass,
      gatewayInstance

    beforeEach(() => {
      if (!originalConfig) {
        originalConfig = configs.gateway
      }

      manifest = {
        resources: {
          Test: {
            method: { path: '/test' }
          }
        }
      }

      gatewayInstance = { call: jest.fn(() => Promise.resolve('response')) }
      gatewayClass = jest.fn(() => gatewayInstance)
    })

    afterEach(() => {
      configs.gateway = originalConfig
    })

    it('builds a new client with the configured gateway', async () => {
      configs.gateway = gatewayClass

      const client = forge(manifest)
      expect(client.Test).toEqual(expect.any(Object))
      expect(client.Test.method).toEqual(expect.any(Function))

      await client.Test.method()
      expect(gatewayClass).toHaveBeenCalled()
      expect(gatewayInstance.call).toHaveBeenCalled()
    })

    describe('when config.gateway changes', () => {
      it('make calls using the new configuration', async () => {
        configs.gateway = gatewayClass
        const client = forge(manifest)

        await client.Test.method()
        expect(gatewayClass).toHaveBeenCalled()
        expect(gatewayClass.mock.calls.length).toEqual(1)

        const newGatewayInstance = { call: jest.fn(() => Promise.resolve('response')) }
        const newGatewayClass = jest.fn(() => newGatewayInstance)
        configs.gateway = newGatewayClass

        await client.Test.method()
        expect(newGatewayClass).toHaveBeenCalled()
        expect(gatewayClass.mock.calls.length).toEqual(1)
      })
    })
  })
})
