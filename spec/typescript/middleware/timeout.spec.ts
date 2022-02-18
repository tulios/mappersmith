import forge from '../../../src/mappersmith'
import TimeoutMiddleware from '../../../src/middleware/timeout'

const Timeout = TimeoutMiddleware(500)

forge({
  middleware: [Timeout],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
