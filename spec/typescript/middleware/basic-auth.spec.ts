import forge from '../../../src/mappersmith'
import BasicAuthMiddleware from '../../../src/middleware/basic-auth'

const BasicAuth = BasicAuthMiddleware({ username: 'bob', password: 'bob' })

forge({
  middleware: [BasicAuth],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
