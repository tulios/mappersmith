import { assign } from '../utils'

/**
 * Automatically configure your requests with basic auth
 *
 * Example:
 * In your manifest:
 * {
 *   middlewares: [ BasicAuthMiddleware({ username: 'bob', password: 'bob' }) ]
 * }
 *
 * Making the call:
 * client.User.all()
 * // => header: "Authorization: Basic Ym9iOmJvYg=="
 */
const BasicAuthMiddleware = (authConfig) => () => ({
  request (request) {
    const auth = request.auth()
    return !auth // Keep the override
      ? request.enhance({ auth: assign({}, authConfig) })
      : request
  }
})

export default BasicAuthMiddleware
