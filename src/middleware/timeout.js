/**
 * Automatically configure your requests with a default timeout
 *
 * Example:
 * In your manifest:
 * {
 *   middleware: [ TimeoutMiddleware(500) ]
 * }
 *
 * You can still override the default value:
 * client.User.all({ timeout: 100 })
 */
export default timeoutValue =>
  function TimeoutMiddleware () {
    return {
      prepareRequest (next) {
        return next().then(request => {
          const timeout = request.timeout()
          return !timeout // Keep the override
            ? request.enhance({ timeout: timeoutValue })
            : request
        })
      }
    }
  }
