import forge from '../../src/mappersmith'
import { Middleware } from '../../src/middleware'

const MyMiddleware: Middleware = () => ({
  async prepareRequest(next) {
    const request = await next()
    return request.enhance({
      headers: { 'x-special-request': '->' },
    })
  },

  response(next) {
    return next().then((response) =>
      response.enhance({
        headers: { 'x-special-response': '<-' },
      })
    )
  },
})

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  middleware: [MyMiddleware],
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' },
    },
  },
})

github.Status.lastMessage().then((response) => {
  console.log(`status: ${response.data()}`)
})
