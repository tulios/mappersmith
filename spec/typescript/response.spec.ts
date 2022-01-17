import forge, { Response } from 'mappersmith'

type User = {
  name: string
  id: string
}
type GraphQLResponse<T> = Response<{
  // eslint-disable-next-line camelcase
  errors?: { message: string; error_type: string; description: string }[]
  data: T
}>
export interface TestResponseClient {
  User: {
    get: (params: { userId: string }) => Promise<Response<User>>
    list: () => Promise<Response<User[]>>
    update: (params: { query: string }) => Promise<GraphQLResponse<{ user: User }>>
  }
}

const testResponseClient: TestResponseClient = forge({
  clientId: 'testResponseClient',
  host: 'http://example.com',
  resources: {
    User: {
      get: { path: '/api/users/{userId}' },
      list: { path: '/api/users' },
      update: { method: 'post', path: '/graphql' },
    },
  },
})

testResponseClient.User.get({ userId: '10' }).then((response) => {
  const user = response.data()
  const status = response.status()
  console.log(`[${status}] user id: ${user.id} has name ${user.name}`)
})

const query = `
  query UpdateUserTest($userId: string!, $name: string) { 
    updateUser(userId: $userId, name: $name) { 
      user: {
        id
        name
      }
    }
  }
`

testResponseClient.User.update({ query }).then((rawResponse) => {
  const response = rawResponse.data()
  if (response.errors) {
    throw new Error(`Operation errors: ${response.errors}`)
  }
  const { user } = response.data
  console.log(`[${rawResponse.status()}] user id: ${user.id} updated name to ${user.name}`)
})
