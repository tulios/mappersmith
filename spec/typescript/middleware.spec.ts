import forge, { Response } from '../../src/mappersmith'
import { Middleware, MiddlewareParams, RenewFn } from '../../src/middleware'
import { responseFactory } from '../../src/test'

const MyMiddleware: Middleware = () => ({
  async prepareRequest(next) {
    const response = await next()
    return response.enhance({
      headers: { 'x-special-request': '->' },
    })
  },

  async response(next) {
    const response = await next()
    return response.enhance({
      headers: { 'x-special-response': '<-' },
    })
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
  async prepareRequest(next, abort) {
    const request = await next()
    return request.header('x-special') ? request : abort(new Error('"x-special" must be set!'))
  },
  async response(next, renew) {
    try {
      return await next()
    } catch (response) {
      if (response instanceof Response && response.status() === 401) {
        return renew()
      }
      return await next()
    }
  },
})

const MyMiddlewareReadingFinalRequest: Middleware = () => ({
  async prepareRequest(next) {
    const request = await next()
    return request.enhance({}, { myFavoritePet: 'turtle' })
  },
  async response(next, _renew, finalRequest) {
    const context = finalRequest().context<{ myFavoritePet: string }>()

    if (context.myFavoritePet === 'turtle') {
      console.log("Really? That's my favorite pet too!")
    }

    return await next()
  },
})

const MyMiddlewareWithPrivateProperties: Middleware<{ foo: string }> = () => ({
  async prepareRequest(next, abort) {
    const request = await next()
    // OK:
    this.foo = 'bar'
    // Also OK:
    this['foo'] = 'baz'
    // @ts-expect-error Not OK, not declared as PrivateProps:
    this.bar = 'bar'
    // @ts-expect-error Also not OK:
    this['bar'] = 'baz'
    return request.header('x-special') ? request : abort(new Error('"x-special" must be set!'))
  },
  async response(next, renew) {
    try {
      return await next()
    } catch (response) {
      const { foo } = this

      if (foo === undefined) {
        return next()
      }

      console.log(foo)

      if (response instanceof Response && response.status() === 401) {
        return renew()
      }
      return await next()
    }
  },
})

const MyMiddlewareWithPrivateProperties2: Middleware = () => ({
  async prepareRequest(next, abort) {
    const request = await next()
    // @ts-expect-error Not OK, not declared as PrivateProps:
    this.foo = 'bar'
    // @ts-expect-error Also not OK:
    this['foo'] = 'baz'
    return request.header('x-special') ? request : abort(new Error('"x-special" must be set!'))
  },
  async response(next, renew) {
    try {
      return await next()
    } catch (response) {
      // @ts-expect-error Not OK, doesn't exist:
      const { foo } = this

      console.log(foo)

      if (response instanceof Response && response.status() === 401) {
        return renew()
      }
      return await next()
    }
  },
})

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  middleware: [
    MyMiddleware,
    MyMiddlewareWithOptions,
    MyMiddlewareWithSecondArgument,
    MyMiddlewareWithPrivateProperties,
    MyMiddlewareWithPrivateProperties2,
    MyMiddlewareReadingFinalRequest,
  ],
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

const renewFn: RenewFn = async () => responseFactory()

export const test = async () => {
  if (myMiddleware.response) {
    const originalResponse = responseFactory({ data: { a: 1 } })
    const originalData = originalResponse.data()
    const response = await myMiddleware.response(
      async () => originalResponse,
      renewFn,
      () => originalResponse.request()
    )
    const data = response.data()
    // Right now these are different types
    console.log({ originalData, data })
  }
}
