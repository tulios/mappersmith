import LogMiddleware from 'src/middlewares/log'

export default function createManifest(host = null) {
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
        get: { path: '/api/failure.json' }
      }
    },
    middlewares: [
      LogMiddleware
    ]
  }
}
