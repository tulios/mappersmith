import forge from 'mappersmith'
import Retry from 'mappersmith/middleware/retry'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ Retry ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
