/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  install,
  m,
  mockRequest,
  requestFactory,
  responseFactory,
  uninstall,
} from '../../../../../src/test/index'
import forge from '../../../../../src/mappersmith'
import type {
  MiddlewareDescriptor,
  ResponseGetter,
  Headers,
  Request,
  Response,
} from '../../../../../src/index'
import { jest } from '@jest/globals'
import RetryMiddleware, {
  RetryMiddlewareOptions,
  calculateExponentialRetryTime,
} from '../../../../../src/middleware/retry/v2/index'
import { retryMiddlewareExamples } from '../shared-examples'

describe('RetryMiddleware', () => {
  const retries = 3
  const headerRetryCount = 'X-Mappersmith-Retry-Count'
  const headerRetryTime = 'X-Mappersmith-Retry-Time'
  const retryMiddleware = RetryMiddleware({
    retries,
    headerRetryCount,
    headerRetryTime,
  } satisfies Partial<RetryMiddlewareOptions>)

  const client = forge({
    host: 'http://example.com',
    clientId: 'clientId',
    resources: {
      resourceName: {
        get: {
          path: '/',
          method: 'get',
        },
        post: {
          path: '/',
          method: 'post',
        },
        delete: {
          path: '/',
          method: 'delete',
        },
        patch: {
          path: '/',
          method: 'patch',
        },
        put: {
          path: '/',
          method: 'put',
        },
      },
    },
    middleware: [retryMiddleware],
  })

  beforeAll(() => {
    install()
  })

  afterAll(() => {
    uninstall()
  })

  it('exposes name', () => {
    expect(RetryMiddleware({}).name).toEqual('RetryMiddleware')
  })

  const params = {
    clientId: 'testClient',
    context: {},
    resourceMethod: 'bar',
    resourceName: 'Foo',
  }

  retryMiddlewareExamples(retryMiddleware(params), retries, headerRetryCount, headerRetryTime)

  const newRequest = (method: string) =>
    requestFactory({ method, url: 'http://example.com', path: '/' })

  const newResponse = (
    request: Request,
    responseStatus: number = 200,
    responseData: string | undefined = '',
    responseHeaders: Headers | undefined = {},
    errors: Error[] = []
  ) => {
    if (!request) {
      throw new Error('Request is required')
    }

    return responseFactory({
      request,
      status: responseStatus,
      data: responseData,
      headers: responseHeaders,
      errors,
    })
  }

  beforeAll(() => {
    jest.useRealTimers()
  })

  describe('when the method is not retriable', () => {
    beforeEach(() => {
      ;['post', 'put', 'delete', 'patch'].forEach((method) => {
        mockRequest({
          url: 'http://example.com/',
          method,
          body: m.anything(),
          response: {
            status: 400,
            body: 'Network error',
          },
        })
      })
    })

    for (const methodName of ['post', 'put', 'delete', 'patch']) {
      it(`resolves the promise without retries for ${methodName.toUpperCase()}`, async () => {
        expect.assertions(2)

        return (client.resourceName as any)[methodName]().catch((response: Response) => {
          // Retry was never considered
          expect(response.header(headerRetryCount)).toEqual(undefined)
          expect(response.header(headerRetryTime)).toEqual(undefined)
        })
      })
    }
  })

  describe('when the method is retriable', () => {
    it('schedules a retry', async () => {
      expect.assertions(2)

      await client.resourceName.get().catch((response: Response) => {
        // Retrying scheduled
        expect(response.header(headerRetryCount)).toEqual(0)
        expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
      })
    })
  })

  describe('when the call succeeds within the configured number of retries', () => {
    it('resolves the promise adding the number of retries as a header', async () => {
      expect.assertions(2)
      const middleware = retryMiddleware({} as any) as unknown as MiddlewareDescriptor
      const request = newRequest('get')
      const response = newResponse(request, 500)
      let callsCount = 0

      const next: ResponseGetter = () => {
        const responseStatus = ++callsCount < 3 ? 500 : 200
        return responseStatus !== 200
          ? Promise.reject(response.enhance({ status: responseStatus }))
          : Promise.resolve(response.enhance({ status: responseStatus }))
      }

      return middleware
        .response(next, (): any => ({}), request)
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
        })
    })
  })

  describe('when the call fails after the configured number of retries', () => {
    it('rejects the promise adding the number of retries as a header', async () => {
      expect.assertions(2)
      const middleware = retryMiddleware({} as any) as unknown as MiddlewareDescriptor
      const request = newRequest('get')
      const response = newResponse(request, 500)

      const next: ResponseGetter = () => Promise.reject(response)

      return middleware
        .response(next, (): any => ({}), request)
        .catch((response: Response) => {
          expect(response.header(headerRetryCount)).toEqual(retries)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
        })
    })
  })

  describe('when the call fails and the retry validation fails', () => {
    it('rejects the promise with a retryCount header of zero', async () => {
      expect.assertions(1)
      const middleware = retryMiddleware({} as any) as unknown as MiddlewareDescriptor
      const request = newRequest('get')
      const response = newResponse(request, 401)

      const next: ResponseGetter = () => Promise.reject(response)

      return middleware
        .response(next, (): any => ({}), request)
        .catch((response: Response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
        })
    })
  })

  describe('when the call fails with a retriable network error', () => {
    it('retries up to the configured number of times for retriable network errors', async () => {
      expect.assertions(2)
      const middleware = retryMiddleware({} as any) as unknown as MiddlewareDescriptor
      const request = newRequest('get')
      const err = Object.assign(new Error('socket hangup'), {
        code: 'ECONNRESET',
      })
      const errorResponse = newResponse(request, 400, err.message, {}, [err])

      let callsCount = 0
      // Simulate ECONNRESET error for first two calls, then success
      const next: ResponseGetter = () => {
        if (++callsCount < 3) {
          return Promise.reject(errorResponse)
        }
        return Promise.resolve(newResponse(request, 200))
      }

      return middleware
        .response(next, (): any => ({}), request)
        .then((response: Response) => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.status()).toEqual(200)
        })
    })

    it('does not retry for non-retriable network errors', async () => {
      expect.assertions(2)
      const middleware = retryMiddleware({} as any) as unknown as MiddlewareDescriptor
      const request = newRequest('get')
      const err = Object.assign(new Error('fail'), {
        code: 'SOME_OTHER_ERROR',
      })
      const errorResponse = newResponse(request, 400, err.message, {}, [err])

      const next: ResponseGetter = () => Promise.reject(errorResponse)

      return middleware
        .response(next, (): any => ({}), request)
        .catch((response: Response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
          expect(response.status()).toEqual(400)
        })
    })
  })
})

describe('calculateExponentialRetryTime', () => {
  it('increases the retry time using a randomization function that grows exponentially', () => {
    const retryConfigs = {
      factor: 0.5,
      multiplier: 2,
      maxRetryTimeInSecs: 0.25,
    }

    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.32)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.6)

    // 50 * 0.5 (factor) = 25
    // random(25, 75) -> [random[0.32] * (75 - 25) + 25] = 41
    // 41 * 2 (multiplier) = 82
    // min(82, 250 (max retry)) -> 82
    expect(calculateExponentialRetryTime(50, retryConfigs)).toEqual(82)

    // 82 * 0.5 (factor) = 41
    // random(41, 123) -> [random[0.25] * (123 - 41) + 41] = 61,5
    // 61,5 * 2 (multiplier) = 123
    // min(123, 250 (max retry)) -> 123
    expect(calculateExponentialRetryTime(82, retryConfigs)).toEqual(123)

    // 123 * 0.5 (factor) = 61,5
    // random(61,5, 184,5) -> [random[0.60] * (184,5 - 61,5) + 61,5] = 135,3
    // 135,3 * 2 (multiplier) = 270,6
    // min(270,6, 250 (max retry)) -> 250
    expect(calculateExponentialRetryTime(123, retryConfigs)).toEqual(250)
  })
})
