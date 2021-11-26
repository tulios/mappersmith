import forge, { Middleware } from 'mappersmith'

const MyMiddleware: Middleware = () => ({
  request (request) {
    return request.enhance({
      headers: { 'x-special-request': '->' }
    })
  },

  response (next) {
    return next().then((response) => response.enhance({
      headers: { 'x-special-response': '<-' }
    }))
  }
})

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  middleware: [MyMiddleware],
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' }
    }
  }
})

github.Status.lastMessage().then((response) => {
  console.log(`status: ${response.data()}`)
})
