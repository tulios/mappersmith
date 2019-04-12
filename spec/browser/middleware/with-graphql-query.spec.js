import forge, { configs } from 'src/index'
import WithGraphqlQuery from 'src/middlewares/with-graphql-query'
import MockGateway from 'src/gateway/mock'
import { mockRequest } from 'src/test'

describe('Middleware / WithGraphqlQuery', () => {
  const query = 'query MyQuery { someResource { totalCount }'
  const variables = { variables: { ids: [1, 5, 11] } }

  let client, originalConfig

  afterEach(() => {
    configs.gateway = originalConfig
  })

  beforeEach(() => {
    if (!originalConfig) {
      originalConfig = configs.gateway
    }

    configs.gateway = MockGateway
    const manifest = {
      host: 'http://batman',
      middleware: [WithGraphqlQuery(query)],
      resources: {
        Graphql: {
          getResources: {
            method: 'post',
            path: '/test'
          }
        }
      }
    }

    client = forge(manifest)
  })

  it('exposes name', () => {
    expect(WithGraphqlQuery.name).toEqual('WithGraphqlQuery')
  })

  it('creates a request body which is a merge of the graphql query and request body', async () => {
    mockRequest({
      method: 'post',
      url: 'http://batman/test',
      body: { ...variables, query },
      response: {
        body: { ok: true }
      }
    })

    await client.Graphql.getResources(variables)
  })
})
