var lib, defaultGateway

try {
  // Try loading the compiled code.
  lib = require('./lib')
} catch (e) {
  // If the compiled code is not available, load from source.
  try {
    require('babel-register')({ only: /(mappersmith\/src)/ })
    lib = require('./src')
  } catch (e) {
    throw e
  }
}

if (typeof XMLHttpRequest !== 'undefined') {
  // For browsers use XHR adapter
  defaultGateway = require('./src/gateway/xhr').default
} else if (typeof process !== 'undefined') {
  // For node use HTTP adapter
  defaultGateway = require('./lib/gateway/http').default
}

lib.configs.gateway = defaultGateway
module.exports = lib
