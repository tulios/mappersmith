/**
 * Adds started_at, ended_at and duration headers to the response
 */
const DurationMiddleware = ({ mockRequest } = {}) => ({
  prepareRequest (next) {
    if (mockRequest) {
      return next()
    }

    return next().then(request => request.enhance({
      headers: { 'X-Started-At': Date.now() }
    }))
  },

  response (next) {
    return next().then((response) => {
      const endedAt = Date.now()
      const startedAt = response.request().headers()['x-started-at']

      return response.enhance({
        headers: {
          'X-Started-At': startedAt,
          'X-Ended-At': endedAt,
          'X-Duration': endedAt - startedAt
        }
      })
    })
  }
})

export default DurationMiddleware
