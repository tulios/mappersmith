import forge from '../../../src/mappersmith'
import { BasicAuthMiddleware } from '../../../src'

forge({
  middleware: [BasicAuthMiddleware({ username: 'bob', password: 'bob' })],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
