import forge from '../../../src/mappersmith'
import EncodeJson from '../../../src/middleware/encode-json'

forge({
  middleware: [EncodeJson],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
