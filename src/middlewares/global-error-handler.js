import { configs } from '../index'

let handler = null

export const setErrorHandler = (errorHandler) => handler = errorHandler

const GlobalErrorHandler = () => ({
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
  }
})

export default GlobalErrorHandler
