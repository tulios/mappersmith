const log = (request, response) => {
  if (console && console.log) {
    const httpCall = `${request.method().toUpperCase()} ${request.url()}`
    const direction = response ? '<-' : '->'
    const extra = response ? ` status=${response.status()} '${response.rawData()}'` : ''
    const successLog = console.info ? 'info' : 'log'
    const errorLog = console.error ? 'error' : 'log'

    let logMethod = successLog

    if (response && !response.success()) {
      logMethod = errorLog
    }

    console[logMethod](`${direction} ${httpCall}${extra}`)
  }

  return response ? response : request
}

const ConsoleLogMiddleware = () => ({
  request(request) {
    return log(request)
  },

  response(promise) {
    return promise
      .then((response) => log(response.request(), response))
      .catch((response) => {
        log(response.request(), response)
        throw response
      })
  }
})

export default ConsoleLogMiddleware
