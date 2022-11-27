/* eslint-disable @typescript-eslint/no-var-requires */
const lib = require('./mappersmith')
let _process, defaultGateway

// Prevents webpack to load the nodejs process polyfill
try {
  // eslint-disable-next-line no-eval
  _process = eval(
    'typeof __TEST_SERVICE_WORKER__ === "undefined" && typeof process === "object" ? process : undefined'
  )
} catch (e) {} // eslint-disable-line no-empty

if (typeof XMLHttpRequest !== 'undefined') {
  // For browsers use XHR adapter
  defaultGateway = require('./gateway/xhr').default
} else if (typeof _process !== 'undefined') {
  // For node use HTTP adapter
  defaultGateway = require('./gateway/http').default
} else if (typeof self !== 'undefined') {
  // For service workers use fetch adapter
  defaultGateway = require('./gateway/fetch').default
}

lib.configs.gateway = defaultGateway
module.exports = lib
