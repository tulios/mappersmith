import forge from '../../../src/mappersmith'
import CSRF from '../../../src/middleware/csrf'

forge({
  middleware: [CSRF('csrfToken', 'x-csrf-token')],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
