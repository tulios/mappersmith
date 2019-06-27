import forge from 'mappersmith'
import Log from 'mappersmith/middleware/log'

const client = forge({
  middleware: [ Log ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
