export const CONTENT_TYPE_JSON = 'application/json;charset=utf-8'

/**
 * Automatically encode your objects into JSON
 *
 * Example:
 * client.User.all({ body: { name: 'bob' } })
 * // => body: {"name":"bob"}
 * // => header: "Content-Type=application/json;charset=utf-8"
 */
const EncodeJsonMiddleware = () => ({
  request (request) {
    try {
      if (request.body()) {
        return request.enhance({
          headers: { 'content-type': CONTENT_TYPE_JSON },
          body: JSON.stringify(request.body())
        })
      }
    } catch (e) {}
    return request
  }
})

export default EncodeJsonMiddleware
