import forge from 'mappersmith'
import BasicAuthMiddleware from 'mappersmith/middleware/basic-auth'

const BasicAuth = BasicAuthMiddleware({ username: 'bob', password: 'bob' })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ BasicAuth ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
