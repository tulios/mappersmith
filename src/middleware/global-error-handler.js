import { configs } from '../index'

let handler = null

export const setErrorHandler = (errorHandler) => {
  handler = errorHandler
}

/**
 * Provides a catch-all function for all requests. If the catch-all
 * function returns `true` it prevents the original promise to continue.
 */
const GlobalErrorHandlerMiddleware = () => ({
  response(next) {
    return new configs.Promise((resolve, reject) => {
      next()
        .then((response) => resolve(response))
        .catch((response) => {
          let proceed = true
          handler && (proceed = !(handler(response) === true))
          proceed && reject(response)
        })
    })
  },
})

export default GlobalErrorHandlerMiddleware
