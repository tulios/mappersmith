import 'babel-polyfill'
import integrationTestsForGateway from 'spec/integration/shared-examples'

import XHR from 'src/gateway/xhr'

describe('integration', () => {
  describe('XHR', () => {
    integrationTestsForGateway(XHR, { host: '/proxy' })
  })
})
