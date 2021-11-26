import forge from 'mappersmith'
import CSRF from 'mappersmith/middleware/csrf'

forge({
  middleware: [CSRF('csrfToken', 'x-csrf-token')],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
