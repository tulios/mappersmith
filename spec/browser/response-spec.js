import Response from 'src/response'
import Request from 'src/request'
import MethodDescriptor from 'src/method-descriptor'

describe('Response', () => {
  let methodDescriptor,
      request,
      requestParams,
      response,
      responseStatus,
      responseData,
      responseHeaders

  const createResponse = () => new Response(
    request,
    responseStatus,
    responseData,
    responseHeaders
  )

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({})
    requestParams = {}
    request = new Request(methodDescriptor, requestParams)
    responseStatus = 200
    responseData = 'data'
    responseHeaders = {}
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
      it('returns the parsed object', () => {
        responseData = JSON.stringify({ nice: 'json' })
        responseHeaders = { 'Content-Type': 'application/json;charset=utf-8' }
        expect(createResponse().data()).toEqual({ nice: 'json' })
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
  })
})
