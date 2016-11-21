export const defaultSuccessLogger = (message) => {
  const logger = console.info ? console.info : console.log
  logger(message)
}

export const defaultErrorLogger = (message) => {
  const logger = console.error ? console.error : console.log
  logger(message)
}

let isLoggerEnabled = console && console.log
let successLogger = defaultSuccessLogger
let errorLogger = defaultErrorLogger

export const setSuccessLogger = (logger) => successLogger = logger
export const setErrorLogger = (logger) => errorLogger = logger
export const setLoggerEnabled = (value) => isLoggerEnabled = value

const log = (request, response) => {
  if (isLoggerEnabled) {
    const httpCall = `${request.method().toUpperCase()} ${request.url()}`
    const direction = response ? '<-' : '->'
    const isError = response && !response.success()
    const errorLabel = isError ? '(ERROR) ' : ''
    const extra = response ? ` status=${response.status()} '${response.rawData()}'` : ''
    const logger = isError ? errorLogger : successLogger

    logger(`${direction} ${errorLabel}${httpCall}${extra}`)
  }

  return response ? response : request
}

const ConsoleLogMiddleware = () => ({
  request(request) {
    return log(request)
  },

  response(next) {
    return next()
      .then((response) => log(response.request(), response))
      .catch((response) => {
        log(response.request(), response)
        throw response
      })
  }
})

export default ConsoleLogMiddleware
