import forge from 'mappersmith'
import Retry from 'mappersmith/middleware/retry'

const client = forge({
  middleware: [ Retry ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
