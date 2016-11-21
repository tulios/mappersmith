import MockRequest from './test/mock-request'
import MockResource from './test/mock-resource'
import MockGateway from './gateway/mock'
import { configs } from './index'

let store = []
let ids = 1
let originalGateway = null

export const mockClient = (client) => {
  const entry = new MockResource(ids++, client)
  store.push(entry)
  return entry
}

export const mockRequest = (props) => {
  const entry = new MockRequest(ids++, props)
  store.push(entry)
  return entry.assertObject()
}

export const install = () => {
  originalGateway = configs.gateway
  configs.gateway = MockGateway
}

export const uninstall = () => {
  if (originalGateway) {
    configs.gateway = originalGateway
    originalGateway = null
  }
}

export const clear = () => store = []

export const lookupResponse = (request) => {
  const mocks = store
    .map((mock) => mock.mockRequest ? mock.mockRequest : mock)

  const exactMatch = mocks
    .filter((mock) => mock.isExactMatch(request))
    .pop()

  if (exactMatch) {
    return exactMatch.call(request)
  }

  const partialMatch = mocks
    .filter((mock) => mock.isPartialMatch(request))
    .pop()

  if (partialMatch) {
    throw new Error(
      `[Mappersmith Test] No exact match found for "${request.method()} ${request.url()}", partial match with "${partialMatch.method} ${partialMatch.url}", check your mock definition`
    )
  }

  throw new Error(
    `[Mappersmith Test] No match found for "${request.method()} ${request.url()}", check your mock definition`
  )
}
