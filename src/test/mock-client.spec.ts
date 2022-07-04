import forge from '../index'
import { mockClient, install, uninstall, m } from './index'

const createApi = (headers = {}) =>
  forge({
    ignoreGlobalMiddleware: true,
    allowResourceHostOverride: true,
    gatewayConfigs: {
      enableHTTP408OnTimeouts: true,
    },
    middleware: [],
    host: 'localhost',
    resources: {
      User: {
        all: { path: '/users', headers },
      },
    },
  })

describe('mockClient', () => {
  beforeEach(install)
  afterEach(uninstall)

  it('should be able to use function in .with on headers to mock request with 2 different instances', async () => {
    const api = createApi()
    const user = { firstName: 'foo', lastName: 'bar' }
    mockClient(createApi({ 'random-header': 'value' }))
      .resource('User')
      .method('all')
      .with({ body: m.anything(), headers: m.anything() })
      .response([user])
      .assertObject()

    const data = await api.User.all({ headers: { 'X-Special-Header': 'value' } })
    const users = data.data<Array<typeof user>>()

    expect(users[0]).toEqual(user)
  })

  it('works if using same headers', async () => {
    const api = createApi()
    const user = { firstName: 'foo', lastName: 'bar' }
    const headers = { 'random-header': 'value' }
    mockClient(createApi(headers))
      .resource('User')
      .method('all')
      .with({ body: m.anything(), headers: m.anything() })
      .response([user])
      .assertObject()

    const data = await api.User.all({ headers })
    const users = data.data<Array<typeof user>>()

    expect(users[0]).toEqual(user)
  })

  it('works if using same instance in mockClient', async () => {
    const api = createApi()
    const user = { firstName: 'foo', lastName: 'bar' }
    const headers = { 'random-header': 'value' }
    mockClient(api)
      .resource('User')
      .method('all')
      .with({ body: m.anything(), headers: m.anything() })
      .response([user])
      .assertObject()

    const data = await api.User.all({ headers })
    const users = data.data<Array<typeof user>>()

    expect(users[0]).toEqual(user)
  })
})
