import forge from '../../../src/mappersmith'
import { GlobalErrorHandlerMiddleware, setErrorHandler } from '../../../src'

setErrorHandler((response) => {
  console.log('global error handler')
  return response.status() === 500
})

forge({
  middleware: [GlobalErrorHandlerMiddleware()],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
