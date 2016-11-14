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
        create: { method: 'post', path: '/api/pictures/{category}' },
        add: { method: 'put', path: '/api/pictures/{category}' }
      }
    }
  }
}
