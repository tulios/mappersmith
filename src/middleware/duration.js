/**
 * Adds started_at, ended_at and duration headers to the response
 */
const DurationMiddleware = () => ({
  request (request) {
    return request.enhance({
      headers: { 'X-Started-At': Date.now() }
    })
  },

  response (next) {
    const endedAt = Date.now()

    return next().then((response) => {
      return response.enhance({
        headers: {
          'X-Started-At': response.request().headers()['x-started-at'],
          'X-Ended-At': endedAt,
          'X-Duration': endedAt - response.request().headers()['x-started-at']
        }
      })
    })
  }
})

export default DurationMiddleware
