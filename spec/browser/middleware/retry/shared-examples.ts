/* eslint-disable @typescript-eslint/no-explicit-any */

import Request from '../../../../src/request'
import Response from '../../../../src/response'
import MethodDescriptor from '../../../../src/method-descriptor'
import type { MiddlewareDescriptor } from '../../../../src/middleware'
import { beforeAll, describe, it, expect, jest } from '@jest/globals'
import type { RetryMiddlewareProps } from '../../../../src/middleware/retry/v2/index'

export function retryMiddlewareExamples(
  middleware: Partial<MiddlewareDescriptor & RetryMiddlewareProps>,
  _retries: number,
  headerRetryCount: string,
  headerRetryTime: string
) {
  const newRequest = (method: string) =>
    new Request(new MethodDescriptor({ host: 'example.com', path: '/', method }), {})

  const newResponse = (
    request: Request,
    responseStatus = 200,
    responseData = '',
    responseHeaders = {}
  ) => {
    return new Response(request, responseStatus, responseData, responseHeaders)
  }

  beforeAll(() => {
    jest.useRealTimers()
  })

  describe('when the call is not HTTP GET or HEAD', () => {
    for (const methodName of ['post', 'put', 'delete', 'patch']) {
      it(`resolves the promise without retries for ${methodName.toUpperCase()}`, (done) => {
        const request = newRequest(methodName)
        const nextReq = middleware.request?.(request) as Request | undefined
        if (!nextReq) {
          done(new Error('Request should not be undefined'))
          return
        }
        const response = newResponse(nextReq)

        middleware
          .response?.(
            () => Promise.resolve(response),
            (): any => ({}),
            request
          )
          .then((response: Response) => {
            // Retry was never considered
            expect(response.header(headerRetryCount)).toEqual(undefined)
            expect(response.header(headerRetryTime)).toEqual(undefined)
            done()
          })
          .catch(done)
      })
    }
  })

  describe('when the call succeeds', () => {
    it('resolves the promise without retries', (done) => {
      const request = newRequest('get')
      const nextReq = middleware.request?.(request) as Request | undefined
      if (!nextReq) {
        done(new Error('Request should not be undefined'))
        return
      }
      const response = newResponse(nextReq)

      middleware
        .response?.(
          () => Promise.resolve(response),
          (): any => ({}),
          request
        )
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
        .catch(done)
    })
  })

  describe('when the call succeeds within the configured number of retries', () => {
    it('resolves the promise adding the number of retries as a header', (done) => {
      const request = newRequest('get')
      const nextReq = middleware.request?.(request) as Request | undefined
      if (!nextReq) {
        done(new Error('Request should not be undefined'))
        return
      }
      const response = newResponse(nextReq, 500)
      let callsCount = 0

      const next = () => {
        if (++callsCount < 3) {
          return Promise.reject(response.enhance({ status: 500 }))
        }
        return Promise.resolve(response.enhance({ status: 200 }))
      }

      middleware
        .response?.(next, (): any => ({}), request)
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
        .catch(done)
    })
  })

  describe('when the call fails after the configured number of retries', () => {
    it('rejects the promise adding the number of retries as a header', (done) => {
      const request = newRequest('get')
      const nextReq = middleware.request?.(request) as Request | undefined
      if (!nextReq) {
        done(new Error('Request should not be undefined'))
        return
      }
      const response = newResponse(nextReq, 500)
      const next = () => Promise.reject(response)

      middleware
        .response?.(next, (): any => ({}), request)
        .then(() => done(new Error('This test should reject the promise')))
        .catch((response) => {
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
    })
  })

  describe('when the call fails and the retry validation fails', () => {
    it('rejects the promise with a retryCount header of zero', (done) => {
      const request = newRequest('get')
      const nextReq = middleware.request?.(request) as Request | undefined
      if (!nextReq) {
        done(new Error('Request should not be undefined'))
        return
      }
      const response = newResponse(nextReq, 401)
      const next = () => Promise.reject(response)

      middleware
        .response?.(next, (): any => ({}), request)
        .then(() => done(new Error('This test should reject the promise')))
        .catch((response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
          done()
        })
    })
  })
}
