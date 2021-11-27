import forge from 'mappersmith'
import Duration from 'mappersmith/middleware/duration'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ Duration ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
