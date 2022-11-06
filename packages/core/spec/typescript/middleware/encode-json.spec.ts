import forge from '../../../src/mappersmith'
import { EncodeJsonMiddleware } from '../../../src'

forge({
  middleware: [EncodeJsonMiddleware()],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
