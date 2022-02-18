import forge from '../../../src/mappersmith'
import Duration from '../../../src/middleware/duration'

forge({
  middleware: [Duration],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
