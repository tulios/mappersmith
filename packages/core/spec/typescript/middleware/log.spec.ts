import forge from '../../../src/mappersmith'
import { LogMiddleware } from '../../../src'

forge({
  middleware: [LogMiddleware()],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
