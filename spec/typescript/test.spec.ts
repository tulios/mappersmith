import forge from 'mappersmith'
import {mockClient} from 'mappersmith/test'

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
