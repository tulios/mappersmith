import '@babel/polyfill'
import md5 from 'js-md5'
import integrationTestsForGateway from 'spec/integration/shared-examples'

import HTTP from 'src/gateway/http'
import forge from 'src/index'
import createManifest from 'spec/integration/support/manifest'
import { errorMessage, INVALID_ADDRESS } from 'spec/integration/support'

describe('integration', () => {
  describe('HTTP', () => {
    const gateway = HTTP
    const params = { host: 'http://localhost:9090' }

    integrationTestsForGateway(gateway, params)

    describe('with raw binary', () => {
      it('GET /api/binary.pdf', (done) => {
        const Client = forge(createManifest(params.host), gateway)
        Client.Binary.get().then((response) => {
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
        Client.PlainText.get().then((response) => {
          done.fail(`Expected this request to fail: ${errorMessage(response)}`)
        })
        .catch((response) => {
          expect(response.status()).toEqual(400)
          expect(response.error()).toMatch(/ENOTFOUND/i)
          done()
        })
      })
    })
  })
})
