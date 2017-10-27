/**
 * Sets a request header with the value of a cookie from document.cookie, if it exists
 */
const CsrfMiddleware = (cookieName = 'csrfToken', headerName = 'x-csrf-token') => () => ({
  request (request) {
    if (typeof document === 'undefined') {
      return request
    }

    const re = new RegExp(cookieName + '=')
    const csrf = ((document.cookie || ''
      .split(';')
      .map(c => c.trim())
      .filter(c => re.test(c))[0] || ''
    ) || '').split('=')[1]

    return !csrf
      ? request
      : request.enhance({
        headers: { [headerName]: csrf }
      })
  }
})

export default CsrfMiddleware
