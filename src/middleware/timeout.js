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
const TimeoutMiddleware = (timeoutValue) => () => ({
  request (request) {
    const timeout = request.timeout()
    return !timeout // Keep the override
      ? request.enhance({ timeout: timeoutValue })
      : request
  }
})

export default TimeoutMiddleware
