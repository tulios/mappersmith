// Using with node, for the browser use: require('mappersmith')
var Mappersmith = require("mappersmith/node")

// Enabling promises
Mappersmith.Env.USE_PROMISES = true

// My API manifest
var manifest = {
  host: 'https://status.github.com',
  resources: {
    Status: {
      lastMessage: '/api/last-message.json'
    }
  }
}

// Forging the client with the node js gateway, you have different options for the browser.
// The default gateway uses XMLHttpRequest
var github = Mappersmith.forge(manifest, Mappersmith.node.NodeVanillaGateway)

// Since we are using promises everything works as expected
var {data, stats} = await github.Status.lastMessage()

// profit!
console.log(`status: ${data.body}`)
console.log(`loaded in ${stats.timeElapsedHumanized}`)
