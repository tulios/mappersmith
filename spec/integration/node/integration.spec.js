/* eslint-disable no-undef */
const { Agent: HttpAgent } = require('http')

require('core-js/stable/index.js')
require('regenerator-runtime/runtime.js')
const md5 = require('js-md5')
const { integrationTestsForGateway } = require('../shared-examples.js')
const nodeFetch = require('node-fetch')

const { HTTP } = require('../../../src/gateway/http.ts')
const { Fetch } = require('../../../src/gateway/fetch.ts')
const { default: forge, configs } = require('../../../src/index.ts')
const { createManifest } = require('../support/manifest.js')
const { errorMessage, INVALID_ADDRESS } = require('../support/index.js')
const { keepAlive } = require('./support/keep-alive.js')

describe('integration', () => {
  describe('HTTP', () => {
    const gateway = HTTP
    const params = { host: 'http://localhost:9090' }
    const keepAliveHelper = keepAlive(params.host, gateway)

    beforeAll(() => {
      configs.gateway = HTTP
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

        // eslint-disable-next-line jest/expect-expect
        it('does not reuse the socket and only attaches listeners once to the http agent sockets', (done) => {
          keepAliveHelper
            .callApiTwice()
            .then(() => {
              keepAliveHelper.verifySockets(1, httpAgent.sockets)
              keepAliveHelper.verifySockets(0, httpAgent.freeSockets)
              done()
            })
            .catch((response) => {
              done.fail(`test failed with promise error: ${errorMessage(response)}`)
            })
        })

        it('calls the `onRequestSocketAssigned` callback on every request', (done) => {
          keepAliveHelper
            .callApiTwice()
            .then(() => {
              expect(gatewayConfigs.onRequestSocketAssigned).toHaveBeenCalledTimes(2)
              done()
            })
            .catch((response) => {
              done.fail(`test failed with promise error: ${errorMessage(response)}`)
            })
        })
      })

      describe('with keep alive', () => {
        let httpAgent

        beforeEach(() => {
          httpAgent = new HttpAgent({ keepAlive: true })
          configs.gatewayConfigs.HTTP.configure = () => ({ agent: httpAgent })
        })

        // eslint-disable-next-line jest/expect-expect
        it('reuses the socket, and only attaches listeners once to the reused socket', (done) => {
          keepAliveHelper
            .callApiTwice()
            .then(() => {
              keepAliveHelper.verifySockets(0, httpAgent.sockets)
              keepAliveHelper.verifySockets(1, httpAgent.freeSockets)
              done()
            })
            .catch((response) => {
              done.fail(`test failed with promise error: ${errorMessage(response)}`)
            })
        })

        it('calls the `onRequestSocketAssigned` callback on every request', (done) => {
          keepAliveHelper
            .callApiTwice()
            .then(() => {
              expect(gatewayConfigs.onRequestSocketAssigned).toHaveBeenCalledTimes(2)
              done()
            })
            .catch((response) => {
              done.fail(`test failed with promise error: ${errorMessage(response)}`)
            })
        })
      })
    })

    integrationTestsForGateway(gateway, params)

    describe('with raw binary', () => {
      it('GET /api/binary.pdf', (done) => {
        const Client = forge(
          {
            host: params.host,
            resources: {
              Binary: {
                get: { path: '/api/binary.pdf', binary: true },
              },
            },
          },
          gateway
        )
        Client.Binary.get()
          .then((response) => {
            expect(response.status()).toEqual(200)
            expect(md5(response.data())).toEqual('7e8dfc5e83261f49206a7cd860ccae0a')
            done()
          })
          .catch((response) => {
            console.error('error', response.data())
            done.fail(`test failed with promise error: ${errorMessage(response)}`)
          })
      })
    })

    describe('on network errors', () => {
      it('returns the original error', (done) => {
        const Client = forge(
          {
            host: INVALID_ADDRESS,
            resources: {
              PlainText: {
                get: { path: '/api/plain-text' },
              },
            },
          },
          gateway
        )
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

    describe('aborting a request', () => {
      it('aborts the request', (done) => {
        const Client = forge(
          {
            host: params.host,
            resources: {
              Timeout: {
                get: { path: '/api/timeout.json' },
              },
            },
          },
          gateway
        )
        const abortController = new AbortController()
        const request = Client.Timeout.get({ waitTime: 666, signal: abortController.signal })
        // Fire the request, but abort after 1ms
        setTimeout(() => {
          abortController.abort()
        }, 1)
        request
          .then((response) => {
            done.fail(`Expected this request to fail: ${errorMessage(response)}`)
          })
          .catch((response) => {
            expect(response.status()).toEqual(400)
            expect(response.error()).toMatch(/The operation was aborted/i)
            done()
          })
      })
    })
  })

  describe('Fetch', () => {
    const gateway = Fetch
    const params = { host: 'http://localhost:9090' }

    beforeAll(() => {
      configs.gateway = Fetch
    })

    describe('aborting a request', () => {
      it('aborts the request on user signal', (done) => {
        const Client = forge(
          {
            host: params.host,
            fetch: nodeFetch,
            resources: {
              Timeout: {
                get: { path: '/api/timeout.json' },
              },
            },
          },
          gateway
        )
        const abortController = new AbortController()
        const request = Client.Timeout.get({ waitTime: 666, signal: abortController.signal })
        // Fire the request, but abort after 1ms
        setTimeout(() => {
          abortController.abort()
        }, 1)
        request
          .then((response) => {
            done.fail(`Expected this request to fail: ${errorMessage(response)}`)
          })
          .catch((response) => {
            expect(response.status()).toEqual(400)
            expect(response.error()).toMatch(/This operation was aborted/i)
            done()
          })
      })

      it('aborts the request after specified timeout', (done) => {
        const Client = forge(
          {
            host: params.host,
            fetch: nodeFetch,
            resources: {
              Timeout: {
                get: { path: '/api/timeout.json' },
              },
            },
          },
          gateway
        )
        const request = Client.Timeout.get({ timeout: 100, waitTime: 666 })

        request
          .then((response) => {
            done.fail(`Expected this request to fail: ${errorMessage(response)}`)
          })
          .catch((response) => {
            expect(response.status()).toEqual(400)
            expect(response.error()).toMatch(/Timeout \(100ms\)/i)
            done()
          })
      })
    })
  })
})
