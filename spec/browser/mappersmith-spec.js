import forge from 'src/index'
import { configs } from 'src/index'

describe('mappersmith', () => {
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

      gatewayInstance = jasmine.createSpyObj('instance', ['call'])
      gatewayClass = jasmine.createSpy('GatewayClass').and.returnValue(gatewayInstance)
    })

    afterEach(() => {
      configs.gateway = originalConfig
    })

    it('builds a new client with the configured gateway', () => {
      configs.gateway = gatewayClass

      const client = forge(manifest)
      expect(client.Test).toEqual(jasmine.any(Object))
      expect(client.Test.method).toEqual(jasmine.any(Function))

      client.Test.method()
      expect(gatewayClass).toHaveBeenCalled()
      expect(gatewayInstance.call).toHaveBeenCalled()
    })

    describe('when config.gateway changes', () => {
      it('make calls using the new configuration', () => {
        configs.gateway = gatewayClass
        const client = forge(manifest)

        client.Test.method()
        expect(gatewayClass).toHaveBeenCalled()
        expect(gatewayClass.calls.count()).toEqual(1)

        const newGatewayInstance = jasmine.createSpyObj('instance2', ['call'])
        const newGatewayClass = jasmine.createSpy('GatewayClass2').and.returnValue(newGatewayInstance)
        configs.gateway = newGatewayClass

        client.Test.method()
        expect(newGatewayClass).toHaveBeenCalled()
        expect(gatewayClass.calls.count()).toEqual(1)
      })
    })
  })
})
