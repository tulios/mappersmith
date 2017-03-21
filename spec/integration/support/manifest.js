import LogMiddleware from 'src/middlewares/log'

export default function createManifest(host = null, middlewares = []) {
  return {
    host: host,
    resources: {
      Book: {
        all:  { path: '/api/books.json' },
        byId: { path: '/api/books/{id}.json' }
      },
      PlainText: {
        get: { path: '/api/plain-text' }
      },
      Pictures: {
        upload: { method: 'post', path: '/api/pictures/upload' },
        create: { method: 'post', path: '/api/pictures/{category}' },
        add: { method: 'put', path: '/api/pictures/{category}' }
      },
      Failure: {
        get: { path: '/api/failure.json' },
        onOdd: { path: '/api/fail-on-odd.json' }
      }
    },
    middlewares: [LogMiddleware].concat(middlewares)
  }
}
