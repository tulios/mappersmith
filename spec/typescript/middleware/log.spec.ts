import forge from '../../../src/mappersmith'
import Log from '../../../src/middleware/log'

forge({
  middleware: [Log],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
