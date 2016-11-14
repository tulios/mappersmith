import createManifest from 'spec/integration/manifest'
import apiResponses from 'spec/integration/responses'

import forge, { configs } from 'src/index'

function debugResponse(response) {
  const request = response.request()
  return `Headers: ${JSON.stringify(request.headers())}, ${request.method().toUpperCase()} ${request.url()} => ${response.data()}`
}

function errorMessage(response) {
  return response.data ? debugResponse(response) : response
}

export default function IntegrationTestsForGateway(gateway, params) {
  let previousGateway, Client

  beforeEach(() => {
    previousGateway = configs.gateway
    configs.gateway = gateway
    Client = forge(createManifest(params.host), gateway)
  })

  afterEach(() => {
    configs.gateway = previousGateway
  })

  it('GET /api/books.json', (done) => {
    Client.Book.all().then((response) => {
      expect(response.status()).toEqual(200)
      expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-api-response': 'apiBooks' }))
      expect(response.data()).toEqual(apiResponses.apiBooks)
      done()
    })
    .catch((response) => {
      done.fail(`test failed with promise error: ${errorMessage(response)}`)
    })
  })

  it('GET /api/books/{id}.json', (done) => {
    Client.Book.byId({ id: 1 }).then((response) => {
      expect(response.status()).toEqual(200)
      expect(response.headers()).toEqual(jasmine.objectContaining({
        'x-api-response': 'apiBooksById',
        'x-param-id': '1'
      }))
      expect(response.data()).toEqual(apiResponses.apiBooksById)
      done()
    })
    .catch((response) => {
      done.fail(`test failed with promise error: ${errorMessage(response)}`)
    })
  })

  it('GET /api/plain-text', (done) => {
    Client.PlainText.get().then((response) => {
      expect(response.status()).toEqual(200)
      expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-api-response': 'apiPlainText' }))
      expect(response.data()).toEqual(apiResponses.apiPlainText)
      done()
    })
    .catch((response) => {
      done.fail(`test failed with promise error: ${errorMessage(response)}`)
    })
  })

  it('POST /api/pictures/{category}', (done) => {
    const params = { category: 'sports', body: { payload: 'test' } }
    Client.Pictures.create(params).then((response) => {
      expect(response.status()).toEqual(200)
      expect(response.headers()).toEqual(jasmine.objectContaining({
        'x-api-response': 'apiPicturesCreate',
        'x-param-category': 'sports',
        'x-body': JSON.stringify({ payload: 'test' })
      }))
      expect(response.data()).toEqual(apiResponses.apiPicturesCreate)
      done()
    })
    .catch((response) => {
      done.fail(`test failed with promise error: ${errorMessage(response)}`)
    })
  })

  describe('with custom Content-Type', () => {
    it('PUT /api/pictures/{category}', (done) => {
      const params = {
        category: 'sports',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test2' })
      }

      Client.Pictures.add(params).then((response) => {
        expect(response.status()).toEqual(200)
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'x-api-response': 'apiPicturesAdd',
          'x-param-category': 'sports',
          'x-body': JSON.stringify({ name: 'test2' })
        }))
        expect(response.data()).toEqual(apiResponses.apiPicturesAdd)
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })
  })
}
