import forge from 'mappersmith'
import Log from 'mappersmith/middleware/log'

// eslint-disable-next-line no-unused-vars
const client = forge({
  middleware: [ Log ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
