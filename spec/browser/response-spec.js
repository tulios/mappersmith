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
    })

    describe('when a processor is configured', () => {
      it('returns the processed data', () => {
        methodDescriptor.processor = (response, data) => ({ data: data })
        responseData = JSON.stringify({ nice: 'json' })
        responseHeaders = { 'Content-Type': 'application/json;charset=utf-8' }
        expect(createResponse().data()).toEqual({ data: { nice: 'json' } })
      })
    })
  })
})
