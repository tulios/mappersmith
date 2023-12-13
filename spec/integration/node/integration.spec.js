import { Agent as HttpAgent } from 'http'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import md5 from 'js-md5'
import integrationTestsForGateway from 'spec/integration/shared-examples'

import HTTP from 'src/gateway/http'
import forge, { configs } from 'src/index'
import createManifest from 'spec/integration/support/manifest'
import { errorMessage, INVALID_ADDRESS } from 'spec/integration/support'

import keepAlive from './support/keep-alive'

describe('integration', () => {
  describe('HTTP', () => {
    const gateway = HTTP
    const params = { host: 'http://localhost:9090' }
    const keepAliveHelper = keepAlive(params.host, gateway)

    integrationTestsForGateway(gateway, params)

    describe('with raw binary', () => {
      it('GET /api/binary.pdf', (done) => {
        const Client = forge(createManifest(params.host), gateway)
        Client.Binary.get()
          .then((response) => {
            expect(response.status()).toEqual(200)
            expect(md5(response.data())).toEqual('7e8dfc5e83261f49206a7cd860ccae0a')
            done()
          })
          .catch((response) => {
            done.fail(`test failed with promise error: ${errorMessage(response)}`)
          })
      })
    })

    describe('on network errors', () => {
      it('returns the original error', (done) => {
        const Client = forge(createManifest(INVALID_ADDRESS), gateway)
        Client.PlainText.get()
          .then((response) => {
            done.fail(`Expected this request to fail: ${errorMessage(response)}`)
          })
          .catch((response) => {
            expect(response.status()).toEqual(400)
            expect(response.error()).toMatch(/ENOTFOUND/i)
            done()
          })
      })
    })

    describe('event callbacks', () => {
      let gatewayConfigs = {}

      beforeEach(() => {
        gatewayConfigs = {
          onRequestWillStart: jasmine.createSpy('onRequestWillStart'),
          onRequestSocketAssigned: jasmine.createSpy('onRequestSocketAssigned'),
          onSocketLookup: jasmine.createSpy('onSocketLookup'),
          onSocketConnect: jasmine.createSpy('onSocketConnect'),
          onResponseReadable: jasmine.createSpy('onResponseReadable'),
          onResponseEnd: jasmine.createSpy('onResponseEnd'),
        }

        configs.gatewayConfigs.HTTP = gatewayConfigs
      })

      it('should call the callbacks', (done) => {
        const Client = forge(createManifest(params.host), gateway)
        Client.Book.all().then(() => {
          expect(gatewayConfigs.onRequestWillStart).toHaveBeenCalledWith(jasmine.any(Object))
          expect(gatewayConfigs.onRequestSocketAssigned).toHaveBeenCalledWith(jasmine.any(Object))
          expect(gatewayConfigs.onSocketLookup).toHaveBeenCalledWith(jasmine.any(Object))
          expect(gatewayConfigs.onSocketConnect).toHaveBeenCalledWith(jasmine.any(Object))
          expect(gatewayConfigs.onResponseReadable).toHaveBeenCalledWith(jasmine.any(Object))
          expect(gatewayConfigs.onResponseEnd).toHaveBeenCalledWith(jasmine.any(Object))
          done()
        })
      })

      describe('without keep alive', () => {
        let httpAgent

        beforeEach(() => {
          httpAgent = new HttpAgent({ keepAlive: false })
          configs.gatewayConfigs.HTTP.configure = () => ({ agent: httpAgent })
        })

        it('does not reuse the socket and only attaches listeners once to the http agent sockets', (done) => {
          keepAliveHelper.callApiTwice().then(() => {
            keepAliveHelper.verifySockets(1, httpAgent.sockets)
            keepAliveHelper.verifySockets(0, httpAgent.freeSockets)
            done()
          })
        })
      })

      describe('with keep alive', () => {
        let httpAgent

        beforeEach(() => {
          httpAgent = new HttpAgent({ keepAlive: true })
          configs.gatewayConfigs.HTTP.configure = () => ({ agent: httpAgent })
        })

        it('reuses the socket, and only attaches listeners once to the reused socket', (done) => {
          keepAliveHelper.callApiTwice().then(() => {
            keepAliveHelper.verifySockets(0, httpAgent.sockets)
            keepAliveHelper.verifySockets(1, httpAgent.freeSockets)
            done()
          })
        })
      })
    })
  })
})
