export const INVALID_ADDRESS = 'http://mappersmith.test'

export function debugResponse(response) {
  const request = response.request()
  return `Status: ${response.status()}, Headers: ${JSON.stringify(request.headers())}, ${request.method().toUpperCase()} ${request.url()} => ${response.rawData()}`
}

export function errorMessage(response) {
  return response.rawData ? debugResponse(response) : response
}
