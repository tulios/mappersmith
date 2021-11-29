import forge from 'mappersmith'
import BasicAuthMiddleware from 'mappersmith/middleware/basic-auth'

const BasicAuth = BasicAuthMiddleware({ username: 'bob', password: 'bob' })

forge({
  middleware: [BasicAuth],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
