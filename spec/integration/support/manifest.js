import LogMiddleware from 'src/middlewares/log'
import CsrfMiddleware from 'src/middlewares/csrf'
const Csrf = CsrfMiddleware('csrfToken', 'x-csrf-token')

export default function createManifest(host = null, middlewares = []) {
  return {
    host: host,
    resources: {
      Book: {
        all: { path: '/api/books.json' },
        byId: { path: '/api/books/{id}.json' },
      },
      PlainText: {
        get: { path: '/api/plain-text' },
      },
      Pictures: {
        upload: { method: 'post', path: '/api/pictures/upload' },
        create: { method: 'post', path: '/api/pictures/{category}' },
        add: { method: 'put', path: '/api/pictures/{category}' },
      },
      Failure: {
        get: { path: '/api/failure.json' },
        onOdd: { path: '/api/fail-on-odd.json' },
      },
      Secure: {
        get: { path: '/api/secure.json' },
      },
      Timeout: {
        get: { path: '/api/timeout.json' },
      },
      Binary: {
        get: { path: '/api/binary.pdf', binary: true },
      },
      Csrf: {
        get: { path: '/api/csrf' },
        test: { method: 'get', path: '/api/csrf/test' },
      },
    },
    middlewares: [LogMiddleware, Csrf].concat(middlewares),
  }
}
