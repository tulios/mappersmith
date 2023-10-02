import { configs } from '../../src/mappersmith'
import type { GatewayConfiguration } from '../../src/gateway/types'
import { Gateway } from '../../src/gateway/gateway'
import { requestFactory } from '../../src/test/request-factory'
import { responseFactory } from '../../src/test/response-factory'

describe('Gateway', () => {
  let originalConfigs: GatewayConfiguration

  beforeEach(() => {
    if (!originalConfigs) {
      originalConfigs = configs.gatewayConfigs
    }
  })

  afterEach(() => {
    configs.gatewayConfigs = originalConfigs
  })

  describe('#options', () => {
    it('returns gateway options', () => {
      expect(new Gateway(requestFactory(), configs.gatewayConfigs).options()).toEqual(
        configs.gatewayConfigs
      )
    })
  })

  describe('#shouldEmulateHTTP', () => {
    describe('when "delete", "put" or "patch" and emulateHTTP=true', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = true
      })

      it('returns true', () => {
        expect(
          new Gateway(
            requestFactory({ method: 'delete' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(true)
        expect(
          new Gateway(requestFactory({ method: 'put' }), configs.gatewayConfigs).shouldEmulateHTTP()
        ).toEqual(true)
        expect(
          new Gateway(
            requestFactory({ method: 'patch' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(true)
      })
    })

    describe('when "get" or "post" and emulateHTTP=true', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = true
      })

      it('returns false', () => {
        expect(
          new Gateway(requestFactory({ method: 'get' }), configs.gatewayConfigs).shouldEmulateHTTP()
        ).toEqual(false)
        expect(
          new Gateway(
            requestFactory({ method: 'post' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(false)
      })
    })

    describe('when emulateHTTP=false', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = false
      })

      it('returns false', () => {
        expect(
          new Gateway(
            requestFactory({ method: 'delete' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(false)
        expect(
          new Gateway(requestFactory({ method: 'put' }), configs.gatewayConfigs).shouldEmulateHTTP()
        ).toEqual(false)
        expect(
          new Gateway(
            requestFactory({ method: 'patch' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(false)
        expect(
          new Gateway(
            requestFactory({ method: 'post' }),
            configs.gatewayConfigs
          ).shouldEmulateHTTP()
        ).toEqual(false)
        expect(
          new Gateway(requestFactory({ method: 'get' }), configs.gatewayConfigs).shouldEmulateHTTP()
        ).toEqual(false)
      })
    })
  })

  describe('#call', () => {
    let gateway: Gateway

    beforeEach(() => {
      gateway = new Gateway(requestFactory(), configs.gatewayConfigs)
      gateway.get = jest.fn()
    })

    it('calls the http method defined in the gateway', () => {
      gateway.call()
      expect(gateway.get).toHaveBeenCalled()
    })

    describe('when successCallback is called', () => {
      it('assigns response.timeElapsed and resolve the promise', (done) => {
        gateway
          .call()
          .then((response) => {
            expect(response.timeElapsed).not.toBeNull()
            done()
          })
          .catch((response) => {
            const error = response.rawData ? response.rawData() : response
            done.fail(`test failed with promise error: ${error}`)
          })

        gateway.successCallback(responseFactory())
      })
    })

    describe('when failCallback is called', () => {
      it('assigns response.timeElapsed and reject the promise', (done) => {
        gateway
          .call()
          .then((response) => {
            done.fail(`Expected this promise to fail: ${response}`)
          })
          .catch((response) => {
            expect(response.timeElapsed).not.toBeNull()
            done()
          })

        gateway.failCallback(responseFactory())
      })
    })
  })
})
