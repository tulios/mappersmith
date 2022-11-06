import forge from '../../../src/mappersmith'
import { CsrfMiddleware } from '../../../src'

forge({
  middleware: [CsrfMiddleware('csrfToken', 'x-csrf-token')],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
