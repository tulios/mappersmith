import createManifest from 'spec/integration/support/manifest'
import apiResponses from 'spec/integration/support/responses'
import { errorMessage } from 'spec/integration/support'

import forge, { configs } from 'src/index'
import {
  setSuccessLogger,
  setErrorLogger,
  setLoggerEnabled,
  defaultSuccessLogger,
  defaultErrorLogger
} from 'src/middlewares/log'

import EncodeJsonMiddleware from 'src/middlewares/encode-json'
import RetryMiddleware, { setRetryConfigs } from 'src/middlewares/retry'

export default function IntegrationTestsForGateway (gateway, params, extraTests) {
  let successLogBuffer,
    errorLogBuffer,
    previousGateway,
    Client

  beforeEach(() => {
    successLogBuffer = []
    errorLogBuffer = []
    setLoggerEnabled(true)
    setSuccessLogger((message) => successLogBuffer.push(message))
    setErrorLogger((message) => errorLogBuffer.push(message))

    previousGateway = configs.gateway
    configs.gateway = gateway
    Client = forge(createManifest(params.host), gateway)
  })

  afterEach(() => {
    configs.gateway = previousGateway
    setSuccessLogger(defaultSuccessLogger)
    setErrorLogger(defaultErrorLogger)
  })

  extraTests && extraTests(gateway, params)

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
    const params = { category: 'sports', body: { payload: 'test', foo: 'bar' } }
    Client.Pictures.create(params).then((response) => {
      expect(response.status()).toEqual(200)
      expect(response.headers()).toEqual(jasmine.objectContaining({
        'x-api-response': 'apiPicturesCreate',
        'x-param-category': 'sports',
        'x-raw-body': 'payload=test&foo=bar'
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
          'x-raw-body': JSON.stringify({ name: 'test2' })
        }))
        expect(response.data()).toEqual(apiResponses.apiPicturesAdd)
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })
  })

  describe('with failures', () => {
    it('rejects the promise', (done) => {
      Client.Failure.get().then((response) => {
        done.fail(`Expected this request to fail: ${errorMessage(response)}`)
      })
      .catch((response) => {
        expect(response.status()).toEqual(500)
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-api-response': 'apiFailure' }))
        expect(response.data()).toEqual(apiResponses.apiFailure)
        done()
      })
    })
  })

  describe('with basic auth', () => {
    it('sends the authorization header with Basic base64', (done) => {
      Client.Secure.get({ auth: { username: 'bob', password: 'bob' } }).then((response) => {
        expect(response.status()).toEqual(200)
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-api-response': 'apiSecure' }))
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-header-authorization': 'Basic Ym9iOmJvYg==' }))
        expect(response.data()).toEqual(apiResponses.apiSecure)
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })
  })

  describe('with timeout', () => {
    it('rejects the promise', (done) => {
      Client.Timeout.get({ waitTime: 1000, timeout: 100, cache: Date.now() }).then((response) => {
        done.fail(`Expected this request to fail: ${errorMessage(response)}`)
      })
      .catch((response) => {
        expect(response.status()).toEqual(400)
        expect(response.data()).toEqual('Timeout (100ms)')
        done()
      })
    })
  })

  describe('encode json middleware', () => {
    it('encodes request body to json', (done) => {
      Client = forge(createManifest(params.host, [EncodeJsonMiddleware]), gateway)
      const requestParams = {
        category: 'sports',
        body: { name: 'test2' }
      }

      Client.Pictures.add(requestParams).then((response) => {
        expect(response.status()).toEqual(200)
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'x-api-response': 'apiPicturesAdd',
          'x-param-category': 'sports',
          'x-raw-body': JSON.stringify({ name: 'test2' })
        }))
        expect(response.data()).toEqual(apiResponses.apiPicturesAdd)
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })
  })

  describe('log middleware', () => {
    it('logs request and response', (done) => {
      Client.Book.all().then((response) => {
        expect(successLogBuffer.length).toEqual(2) // request and response
        expect(successLogBuffer).toEqual([
          `-> GET ${params.host}/api/books.json`,
          `<- GET ${params.host}/api/books.json status=200 '[{"id":1,"title":"Lorem ipsum dolor sit amet","description":"consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"},{"id":2,"title":"Ut enim ad minim veniam","description":"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"}]'`
        ])
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })

    describe('when the request fails', () => {
      it('logs request and response anyway', (done) => {
        Client.Failure.get().then((response) => {
          done.fail(`Expected this request to fail: ${errorMessage(response)}`)
        })
        .catch((response) => {
          expect(successLogBuffer.length).toEqual(1) // only request
          expect(errorLogBuffer.length).toEqual(1) // only response
          expect(successLogBuffer).toEqual([`-> GET ${params.host}/api/failure.json`])
          expect(errorLogBuffer).toEqual([
            `<- (ERROR) GET ${params.host}/api/failure.json status=500 '{"errorMessage":"something went bad"}'`
          ])
          done()
        })
      })
    })
  })

  describe('retry middleware', () => {
    beforeEach(() => {
      setRetryConfigs({ initialRetryTimeInSecs: 0.05, retries: 3 })
      Client = forge(createManifest(params.host, [RetryMiddleware]), gateway)
    })

    it('retries failed GET requests', (done) => {
      Client.Failure.onOdd({ cache: Date.now() }).then((response) => {
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'x-api-response': 'apiFailOnOdd',
          'x-mappersmith-retry-count': 1,
          'x-mappersmith-retry-time': jasmine.any(Number)
        }))
        done()
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
    })

    it('rejects the promise when the request fails more than max retries', (done) => {
      Client.Failure.get().then((response) => {
        done.fail(`Expected this request to fail: ${errorMessage(response)}`)
      })
      .catch((response) => {
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'x-api-response': 'apiFailure',
          'x-mappersmith-retry-count': 3,
          'x-mappersmith-retry-time': jasmine.any(Number)
        }))
        done()
      })
    })
  })
}
