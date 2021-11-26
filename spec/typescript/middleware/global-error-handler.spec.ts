import forge from 'mappersmith'
import GlobalErrorHandler, { setErrorHandler } from 'mappersmith/middleware/global-error-handler'

setErrorHandler((response) => {
  console.log('global error handler')
  return response.status() === 500
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = forge({
  middleware: [ GlobalErrorHandler ],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {}
})
