/**
 * Sets a request header with the value of a cookie from document.cookie, if it exists
 */
const CsrfMiddleware = (cookieName = 'csrfToken', headerName = 'x-csrf-token') => () => ({
  request (request) {
    if (typeof document === 'undefined') {
      return request
    }

    const getCookie = (cookieName) => {
      const cookieString = new RegExp(cookieName + '[^;]+').exec((document || {}).cookie || '')
      return cookieString ? decodeURIComponent(cookieString.toString().replace(/^[^=]+./, '')) : undefined
    }

    const csrf = getCookie(cookieName)

    return !csrf
      ? request
      : request.enhance({
        headers: { [headerName]: csrf }
      })
  }
})

export default CsrfMiddleware
