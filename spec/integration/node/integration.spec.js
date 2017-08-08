import 'babel-polyfill'
import integrationTestsForGateway from 'spec/integration/shared-examples'

import HTTP from 'src/gateway/http'

describe('integration', () => {
  describe('HTTP', () => {
    integrationTestsForGateway(HTTP, { host: 'http://localhost:9090' })
  })
})
