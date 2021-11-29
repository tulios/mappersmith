import forge from 'mappersmith'
import Log from 'mappersmith/middleware/log'

forge({
  middleware: [Log],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
