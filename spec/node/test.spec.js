import forge from 'src'
import { install, uninstall, mockClient, m } from 'src/test'

const github = forge({
  clientId: 'fictional',
  host: 'https://fictional.endpoint',
  resources: {
    Endpoint: {
      withParam: { path: '/param/:id' },
      withBody: { method: 'POST', path: '/body' },
      withNothingSpecial: { path: '/nothing' },
    },
  },
})

describe('#mockClient', () => {
  beforeEach(install)
  afterEach(uninstall)

  describe('allows for mocking responses', () => {
    test('as an object', async () => {
      mockClient(github)
        .resource('Endpoint')
        .method('withNothingSpecial')
        .response({ ping: 'pong' })
        .assertObject()

      const response = await github.Endpoint.withNothingSpecial()

      expect(response.data()).toEqual({ ping: 'pong' })
    })

    test('as a function of the request body', async () => {
      mockClient(github)
        .resource('Endpoint')
        .method('withBody')
        .with({
          body: m.anything(),
        })
        .response((request) => request.body())
        .assertObject()

      const response = await github.Endpoint.withBody({ body: { true: false } })

      expect(response.data()).toEqual({ true: false })
    })

    test('as a function of the request params', async () => {
      mockClient(github)
        .resource('Endpoint')
        .method('withParam')
        .with({
          id: m.anything(),
        })
        .response((request) => request.params())
        .assertObject()

      const response = await github.Endpoint.withParam({ id: 123 })

      expect(response.data()).toHaveProperty('id', 123)
    })
  })
})
