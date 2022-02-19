import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import md5 from 'js-md5'

import integrationTestsForGateway from 'spec/integration/shared-examples'
import createManifest from 'spec/integration/support/manifest'
import { errorMessage, INVALID_ADDRESS } from 'spec/integration/support'

import XHR from 'src/gateway/xhr'
import Fetch from 'src/gateway/fetch'
import forge, { configs } from 'src/index'
import fileUploadSpec from './file-upload'
import csrfSpec from './csrf'

configs.fetch = window.fetch

describe('integration', () => {
  describe('Fetch', () => {
    const gateway = Fetch
    const params = { host: '/proxy' }

    integrationTestsForGateway(gateway, params, (gateway, params) => {
      describe('file upload', () => {
        fileUploadSpec(forge(createManifest(params.host), gateway))
      })
    })

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
            expect(response.error()).toMatch(/Error/i)
            done()
          })
      })
    })
  })

  describe('XHR', () => {
    const gateway = XHR
    const params = { host: '/proxy' }

    integrationTestsForGateway(gateway, params, (gateway, params) => {
      describe('file upload', () => {
        fileUploadSpec(forge(createManifest(params.host), gateway))
      })
    })

    describe('with raw binary', () => {
      it('GET /api/binary.pdf', (done) => {
        const Client = forge(createManifest(params.host), gateway)
        Client.Binary.get()
          .then((response) => {
            expect(response.status()).toEqual(200)
            const reader = new window.FileReader()
            reader.addEventListener('loadend', function () {
              expect(md5(reader.result)).toEqual('7e8dfc5e83261f49206a7cd860ccae0a')
              done()
            })
            reader.readAsArrayBuffer(response.data())
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
            expect(response.error()).toMatch(/network error/i)
            done()
          })
      })
    })
  })

  describe('CSRF', () => {
    integrationTestsForGateway(Fetch, { host: '/proxy' }, (gateway, params) => {
      csrfSpec(forge(createManifest(params.host), gateway))
    })
  })
})
