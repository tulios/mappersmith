import forge from 'mappersmith'
import CSRF from 'mappersmith/middleware/csrf'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ CSRF('csrfToken', 'x-csrf-token') ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
