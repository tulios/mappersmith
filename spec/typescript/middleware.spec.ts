import forge, { Middleware, MiddlewareParams } from 'mappersmith'
import { responseFactory } from 'mappersmith/test'

const MyMiddleware: Middleware = () => ({
  prepareRequest(next) {
    return next().then((response) =>
      response.enhance({
        headers: { 'x-special-request': '->' },
      })
    )
  },

  response(next) {
    return next().then((response) =>
      response.enhance({
        headers: { 'x-special-response': '<-' },
      })
    )
  },
})

const MyMiddlewareWithOptions: Middleware = ({
  resourceName,
  resourceMethod,
  context,
  clientId,
}: MiddlewareParams) => {
  console.log({ resourceName, resourceMethod, context, clientId })
  return {}
}

const MyMiddlewareWithSecondArgument: Middleware = () => ({
  prepareRequest(next, abort) {
    return next().then((request) =>
      request.header('x-special') ? request : abort(new Error('"x-special" must be set!'))
    )
  },
  response(next, renew) {
    return next().catch((response) => {
      if (response.status() === 401) {
        return renew()
      }

      return next()
    })
  },
})

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  middleware: [MyMiddleware, MyMiddlewareWithOptions, MyMiddlewareWithSecondArgument],
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

const myMiddleware = MyMiddleware({
  clientId: 'github',
  resourceName: 'Status',
  resourceMethod: 'current',
  context: {},
})

const renewFn = async () => responseFactory()

export const test = async () => {
  if (myMiddleware.response) {
    const originalResponse = responseFactory({ data: { a: 1 } })
    const originalData = originalResponse.data()
    const response = await myMiddleware.response(async () => originalResponse, renewFn)
    const data = response.data()
    // Right now these are different types
    console.log({ originalData, data })
  }
}
