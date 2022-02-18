import forge from '../../../src/mappersmith'
import Retry from '../../../src/middleware/retry/v1'

forge({
  middleware: [Retry],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
