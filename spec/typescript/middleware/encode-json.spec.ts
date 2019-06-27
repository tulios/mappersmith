import forge from 'mappersmith'
import EncodeJson from 'mappersmith/middleware/encode-json'

const client = forge({
  middleware: [ EncodeJson ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
