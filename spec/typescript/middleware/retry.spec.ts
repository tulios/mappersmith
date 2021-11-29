import forge from 'mappersmith'
import Retry from 'mappersmith/middleware/retry'

forge({
  middleware: [Retry],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
