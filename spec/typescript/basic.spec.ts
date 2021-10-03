import forge from 'mappersmith'

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  gatewayConfigs: {
    HTTP: {
      configure() {
        return {
          port: "1234"
        }
      }
    }
  },
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' }
    }
  }
})

github.Status.lastMessage({ randomParam: 10, another: { foo: "hi" } }).then((response) => {
  console.log(`status: ${response.data()}`)
})
