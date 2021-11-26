import forge from 'mappersmith'
import EncodeJson from 'mappersmith/middleware/encode-json'

// eslint-disable-next-line no-unused-vars
const client = forge({
  middleware: [ EncodeJson ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
