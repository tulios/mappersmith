// Load compiled code
var lib = require('./lib')
var defaultGateway

if (typeof XMLHttpRequest !== 'undefined') {
  // For browsers use XHR adapter
  defaultGateway = require('./lib/gateway/xhr').default
} else if (typeof process !== 'undefined') {
  // For node use HTTP adapter
  defaultGateway = require('./lib/gateway/http').default
}

lib.configs.gateway = defaultGateway
module.exports = lib
