import forge from '../../../src/mappersmith'
import { TimeoutMiddleware } from '../../../src'

forge({
  middleware: [TimeoutMiddleware(500)],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
