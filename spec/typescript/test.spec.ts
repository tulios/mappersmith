import forge from 'mappersmith'
import { install, uninstall, clear, mockClient, mockRequest, m } from 'mappersmith/test'

install()
uninstall()
clear()

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' },
    },
  },
})

const mock = mockClient<typeof github>(github)
  .resource('Status')
  .method('current')
  .with({
    id: 'abc',
  })
  .response({ allUsers: [] })
  .assertObject()

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())

const mock2 = mockRequest({
  method: 'post',
  url: 'http://example.org/blogs',
  body: 'param1=A&param2=B', // request body
  response: {
    status: 503,
    body: { error: true },
    headers: { 'x-header': 'nope' }
  }
})

console.log(mock2.mostRecentCall())
console.log(mock2.callsCount())
console.log(mock2.calls())

mockRequest({
  method: 'post',
  url: (requestUrl, params) => `${requestUrl}+${JSON.stringify(params)}`,
  body: (requestBody) => `~${requestBody}~`
})

mockRequest({
  method: 'post',
  url: 'http://example.org/blogs',
  body: m.stringContaining('something')
})

m.stringMatching(/test/)
m.stringContaining('test')
m.uuid4()
m.anything()
