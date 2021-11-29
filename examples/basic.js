// 1) Import mappersmith
const forge = require('mappersmith').default
// import forge from 'mappersmith'

// 2) Forge your client with your API manifest
const github = forge({
  host: 'https://status.github.com',
  resources: {
    Status: {
      lastMessage: { path: '/api/last-message.json' },
    },
  },
})

// profit!
const response = await github.Status.lastMessage()

console.log(`status: ${response.data().body}`)
console.log(`loaded in ${response.timeElapsed}ms`)
