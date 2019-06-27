import forge from 'mappersmith'
import Duration from 'mappersmith/middleware/duration'

const client = forge({
  middleware: [ Duration ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
