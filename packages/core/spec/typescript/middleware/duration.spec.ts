import forge from '../../../src/mappersmith'
import { DurationMiddleware } from '../../../src'

forge({
  middleware: [DurationMiddleware()],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
