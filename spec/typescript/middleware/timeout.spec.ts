import forge from 'mappersmith'
import TimeoutMiddleware from 'mappersmith/middleware/timeout'

const Timeout = TimeoutMiddleware(500)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ Timeout ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
