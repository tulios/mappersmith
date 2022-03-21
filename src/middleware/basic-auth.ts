import { Auth } from 'types'
import { Middleware } from './index'
import { assign } from '../utils'

/**
 * Automatically configure your requests with basic auth
 *
 * Example:
 * In your manifest:
 * {
 *   middleware: [ BasicAuthMiddleware({ username: 'bob', password: 'bob' }) ]
 * }
 *
 * Making the call:
 * client.User.all()
 * // => header: "Authorization: Basic Ym9iOmJvYg=="
 */
export default (authConfig: Auth): Middleware =>
  function BasicAuthMiddleware() {
    return {
      async prepareRequest(next) {
        const request = await next()
        const auth = request.auth()
        return !auth // Keep the override
          ? request.enhance({ auth: assign({}, authConfig) })
          : request
      },
    }
  }
