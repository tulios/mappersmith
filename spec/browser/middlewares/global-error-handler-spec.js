import GlobalErrorHandlerMiddleware, { setErrorHandler } from 'src/middlewares/global-error-handler'

describe('Middleware / GlobalErrorHandlerMiddleware', () => {
  let middleware

  beforeEach(() => {
    middleware = GlobalErrorHandlerMiddleware()
  })

  describe('when it succeeds', () => {
    it('allows the promise to proceed with the original response', (done) => {
      const originalResponse = { response: true }

      middleware
        .response(() => Promise.resolve(originalResponse))
        .then((response) => {
          expect(response).toEqual(response)
          done()
        })
    })
  })

  describe('when the error handler returns false', () => {
    it('allows the promise to follow the error flow ("catch")', (done) => {
      const originalResponse = { error: true }
      const errorHandler = jasmine.createSpy('errorHandler')
      setErrorHandler(errorHandler)

      middleware
        .response(() => Promise.reject(originalResponse))
        .then((response) => {
          done.fail(`Expected this promise to fail: ${response}`)
        })
        .catch((response) => {
          expect(errorHandler).toHaveBeenCalledWith(originalResponse)
          expect(response).toEqual(originalResponse)
          done()
        })
    })
  })

  describe('when the error handler returns true', () => {
    it('skips the promise error flow ("catch")', (done) => {
      const originalResponse = { error: true }
      const errorHandler = jasmine
        .createSpy('errorHandler')
        .and
        .callFake((response) => {
          expect(response).toEqual(originalResponse)
          done()
          return true
        })

      setErrorHandler(errorHandler)

      middleware
        .response(() => Promise.reject(originalResponse))
        .then((response) => {
          done.fail(`Expected this promise to fail: ${response}`)
        })
        .catch((response) => {
          done.fail(`Expected this to never be called: ${response}`)
        })
    })
  })
})
