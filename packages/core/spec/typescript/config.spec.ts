import { configs, setContext } from '../../src/mappersmith'
import { Middleware } from '../../src/middleware'

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

setContext({ some: 'data' })

configs.maxMiddlewareStackExecutionAllowed = 2
configs.middleware = [MyMiddleware]
configs.fetch = fetch
configs.gatewayConfigs.Mock = {}
configs.gatewayConfigs.Fetch = {
  credentials: 'same-origin',
}
configs.gatewayConfigs.HTTP = {
  configure() {
    return {
      port: '1234',
    }
  },
}
configs.gatewayConfigs.XHR = {
  withCredentials: true,
  configure(xhr) {
    xhr.ontimeout = () => console.error('timeout!')
  },
}
