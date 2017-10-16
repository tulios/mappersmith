import 'babel-polyfill'
import md5 from 'js-md5'
import integrationTestsForGateway from 'spec/integration/shared-examples'

import HTTP from 'src/gateway/http'
import forge from 'src/index'
import createManifest from 'spec/integration/support/manifest'
import { errorMessage } from 'spec/integration/support'

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
  })
})
