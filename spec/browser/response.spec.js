import Response from 'src/response'
import Request from 'src/request'
import MethodDescriptor from 'src/method-descriptor'

describe('Response', () => {
  let methodDescriptor,
    request,
    requestParams,
    responseStatus,
    responseData,
    responseHeaders

  const createResponse = (errors) => new Response(
    request,
    responseStatus,
    responseData,
    responseHeaders,
    errors
  )

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({})
    requestParams = {}
    request = new Request(methodDescriptor, requestParams)
    responseStatus = 200
    responseData = 'data'
    responseHeaders = {}
  })

  describe('.constructor', () => {
    beforeEach(() => {
      requestParams = { auth: { username: 'bob', password: 'bob' } }
      request = new Request(methodDescriptor, requestParams)
    })

    it('changing the auth params does not mutate the original request', () => {
      const newResponse = new Response(request, responseStatus, responseData, responseHeaders)
      expect(newResponse.originalRequest.requestParams.auth.password).toEqual('***')
      expect(request.requestParams.auth.password).toEqual('bob')
    })
  })

  describe('#request', () => {
    it('returns the original request', () => {
      expect(createResponse().request()).toEqual(request)
    })
  })

  describe('#status', () => {
    it('returns the response status', () => {
      expect(createResponse().status()).toEqual(responseStatus)
    })

    describe('when status is 1223 (IE behavior)', () => {
      it('returns 204', () => {
        responseStatus = 1223
        expect(createResponse().status()).toEqual(204)
      })
    })
  })

  describe('#success', () => {
    it('returns true when status is between 200...400', () => {
      responseStatus = 102
      expect(createResponse().success()).toEqual(false)
      responseStatus = 400
      expect(createResponse().success()).toEqual(false)

      responseStatus = 200
      expect(createResponse().success()).toEqual(true)
      responseStatus = 308
      expect(createResponse().success()).toEqual(true)
    })
  })

  describe('#headers', () => {
    it('returns response headers with names in lowercase', () => {
      responseHeaders = { 'X-SOMETHING': true, 'X-AnOtHeR': 'test' }
      expect(createResponse().headers()).toEqual({ 'x-something': true, 'x-another': 'test' })
    })
  })

  describe('#header', () => {
    it('returns the value of the given header name', () => {
      responseHeaders = { 'X-SOMETHING': true, 'X-AnOtHeR': 'test' }
      const response = createResponse()
      expect(response.header('x-something')).toEqual(true)
      expect(response.header('x-another')).toEqual('test')
    })
  })

  describe('#isContentTypeJSON', () => {
    it('returns true when content-type=application/json', () => {
      responseHeaders = { 'Content-Type': 'application/json;charset=utf-8' }
      expect(createResponse().isContentTypeJSON()).toEqual(true)

      responseHeaders = { 'Content-Type': 'text/plain' }
      expect(createResponse().isContentTypeJSON()).toEqual(false)

      responseHeaders = {}
      expect(createResponse().isContentTypeJSON()).toEqual(false)
    })
  })

  describe('#rawData', () => {
    it('returns raw responseData', () => {
      expect(createResponse().rawData()).toEqual(responseData)
    })
  })

  describe('#data', () => {
    it('returns the response data', () => {
      expect(createResponse().data()).toEqual(responseData)
    })

    describe('when responseData is JSON', () => {
      it.each([
        ['application/json;charset=utf-8'],
        ['application/ld+json;charset=utf-8'],
        ['application/problem+json;charset=utf-8'],
        ['application/vnd.spring-boot.actuator.v3+json;charset=utf-8']
      ])('returns the parsed object given content type %s', (contentType) => {
        responseData = JSON.stringify({ nice: 'json' })
        responseHeaders = { 'Content-Type': contentType }
        expect(createResponse().data()).toEqual({ nice: 'json' })
      })

      describe('when content type is not json', () => {
        it.each([
          ['application/pdf;charset=utf-8'],
          ['text/html;charset=utf-8'],
          ['application/vnd.openxmlformats-officedocument.stringwithjsoninit.presentation;charset=utf-8']
        ])('returns rawData given content type %s', (contentType) => {
          responseData = JSON.stringify({ nice: 'json' })
          responseHeaders = { 'Content-Type': contentType }
          expect(createResponse().data()).toEqual(responseData)
        })
      })

      describe('and the payload is a invalid JSON', () => {
        it('returns rawData', () => {
          responseData = 'invalid{json}'
          responseHeaders = { 'Content-Type': 'application/json;charset=utf-8' }
          expect(createResponse().data()).toEqual('invalid{json}')
        })
      })
    })

    describe('without responseData', () => {
      it('returns null', () => {
        responseData = undefined
        expect(createResponse().data()).toBeNull()
      })
    })
  })

  describe('#error', () => {
    it('returns null by default', () => {
      expect(createResponse().error()).toEqual(null)
    })

    it('returns the last error', () => {
      const lastError = new Error('third error')
      const response = createResponse([
        new Error('first error'),
        new Error('second error'),
        lastError
      ])

      expect(response.error()).toEqual(lastError)
    })

    describe('when the error is just a string', () => {
      it('returns an instance of error', () => {
        expect(createResponse(['string error']).error()).toEqual(new Error('string error'))
      })
    })
  })

  describe('#enhance', () => {
    it('creates a new response based on the current response replacing status', () => {
      const response = createResponse()
      const enhancedResponse = response.enhance({ status: 201 })
      expect(enhancedResponse).not.toEqual(response)
      expect(enhancedResponse.status()).toEqual(201)
    })

    it('creates a new response based on the current response replacing rawData', () => {
      const response = createResponse()
      const enhancedResponse = response.enhance({ rawData: 'payload' })
      expect(enhancedResponse).not.toEqual(response)
      expect(enhancedResponse.rawData()).toEqual('payload')
    })

    it('creates a new response based on the current response merging the headers', () => {
      responseHeaders = { 'x-old': 'no' }
      const response = createResponse()
      const enhancedResponse = response.enhance({ headers: { 'x-special': 'yes' } })
      expect(enhancedResponse).not.toEqual(response)
      expect(enhancedResponse.headers()).toEqual({ 'x-old': 'no', 'x-special': 'yes' })
    })

    it('creates a new response based on the current response adding new errors to the stack', () => {
      const originalError = new Error('original error')
      const newError = new Error('new error')
      const response = createResponse([originalError])
      const enhancedResponse = response.enhance({ error: newError })
      expect(enhancedResponse.error()).toEqual(newError)
      expect(enhancedResponse.errors).toEqual([originalError, newError])
    })

    it('creates a new response without adding undefined errors to the stack', () => {
      const originalError = new Error('original error')
      const response = createResponse([originalError])
      const enhancedResponse = response.enhance({})

      expect(enhancedResponse.error()).toEqual(originalError)
    })

    it('preserves timeElapsed', () => {
      const response = createResponse()
      response.timeElapsed = 123
      const enhancedResponse = response.enhance({})

      expect(enhancedResponse.timeElapsed).toEqual(123)
    })
  })
})
