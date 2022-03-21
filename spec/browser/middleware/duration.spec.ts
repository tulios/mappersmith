import DurationMiddleware from '../../../src/middleware/duration'
import { requestFactory, responseFactory } from '../../../src/test'
import type { AbortFn, MiddlewareDescriptor, MiddlewareParams } from '../../../src/middleware'

const abort: AbortFn = () => ({})

describe('Middleware / DurationMiddleware', () => {
  let middleware: Partial<MiddlewareDescriptor>
  const params: MiddlewareParams = {
    clientId: 'testClient',
    context: {},
    resourceMethod: 'bar',
    resourceName: 'Foo',
  }

  beforeEach(() => {
    middleware = DurationMiddleware(params)
  })

  it('exposes name', () => {
    expect(DurationMiddleware.name).toEqual('DurationMiddleware')
  })

  it('adds started_at, ended_at and duration response headers', async () => {
    const request = requestFactory({ host: 'example.com', path: '/', method: 'get' })
    const finalRequest = await middleware.prepareRequest?.(() => Promise.resolve(request), abort)
    if (!finalRequest) {
      throw new Error('DurationMiddleware aborted unexpectedly')
    }

    const response = responseFactory({ request: finalRequest })

    const finalResponse = await middleware.response?.(
      () => Promise.resolve(response),
      () => Promise.resolve(response)
    )
    const startedAt = finalResponse?.header('x-started-at')
    const endedAt = finalResponse?.header('x-ended-at')

    expect(startedAt).toEqual(expect.any(Number))
    expect(endedAt).toEqual(expect.any(Number))
    expect(finalResponse?.header('x-duration')).toEqual((endedAt as number) - (startedAt as number))
  })

  it('returns the response data intact for empty string', async () => {
    const request = requestFactory({ host: 'example.com', path: '/', method: 'get' })
    const finalRequest = await middleware.prepareRequest?.(() => Promise.resolve(request), abort)
    if (!finalRequest) {
      throw new Error('DurationMiddleware aborted unexpectedly')
    }

    const response = responseFactory({ request: finalRequest, data: '' })

    const finalResponse = await middleware.response?.(
      () => Promise.resolve(response),
      () => Promise.resolve(response)
    )
    const data = finalResponse?.data()
    expect(data).toEqual('')
  })
})
