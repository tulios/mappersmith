import forge from 'src/index'
import MockAssert from 'src/mocks/mock-assert'
import { getManifest } from 'spec/helper'

import {
  install as installMock,
  uninstall as uninstallMock,
  mockRequest,
  mockClient,
  m
} from 'src/test'

describe('Test lib / mock request', () => {
  let client

  beforeEach(() => {
    installMock()
    client = forge(getManifest())
  })

  afterEach(() => {
    uninstallMock()
  })

  it('returns a MockAssert object', () => {
    const mock = mockRequest({
      method: 'get',
      url: 'http://example.org/users?sort=desc',
      response: {
        body: { ok3: true }
      }
    })

    expect(mock instanceof MockAssert).toEqual(true)
  })

  it('defaults status 200 and automatically includes "application/json" for object responses', (done) => {
    mockRequest({
      method: 'get',
      url: 'http://example.org/users?sort=desc',
      response: {
        body: { ok3: true }
      }
    })

    client.User.all({ sort: 'desc' })
      .then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual({ ok3: true })
        expect(response.headers()).toEqual(jasmine.objectContaining({
          'content-type': 'application/json'
        }))
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts custom status, headers, and params', (done) => {
    mockRequest({
      url: 'http://example.org/users/16',
      response: {
        status: 201,
        headers: { 'x-test-response': 'mock' },
        body: { ok4: true }
      }
    })

    client.User.byId({ id: 16 })
      .then((response) => {
        expect(response.status()).toEqual(201)
        expect(response.headers()).toEqual(jasmine.objectContaining({ 'x-test-response': 'mock' }))
        expect(response.data()).toEqual({ ok4: true })
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('triggers the catch block on http errors', (done) => {
    mockRequest({
      method: 'get',
      url: 'http://example.org/users/15',
      response: {
        status: 503,
        body: { error: true }
      }
    })

    client.User.byId({ id: 15 })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        expect(response.status()).toEqual(503)
        expect(response.data()).toEqual({ error: true })
        done()
      })
  })

  it('works with different http methods', (done) => {
    mockRequest({
      method: 'post',
      url: 'http://example.org/blogs',
      body: 'param1=A&param2=B',
      response: {
        body: { created: true }
      }
    })

    client.Blog
      .post({ body: { param1: 'A', param2: 'B' } })
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual({ created: true })
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('works with text responses', (done) => {
    mockRequest({
      method: 'post',
      url: 'http://example.org/blogs',
      response: {
        body: 'just text!'
      }
    })

    client.Blog.post()
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts a matcher function as a body', (done) => {
    mockRequest({
      method: 'post',
      url: 'http://example.org/blogs',
      body: (body) => body === 'ok',
      response: {
        body: 'just text!'
      }
    })

    client.Blog.post({ body: 'ok' })
      .then((response) => {
        expect(response.request().method()).toEqual('post')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.Blog.post({ body: 'false' })
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
      })
      .catch((response) => {
        done()
      })
  })

  it('matches the body params independent of order', (done) => {
    mockRequest({
      method: 'post',
      url: 'http://example.org/blogs',
      body: { param1: 'value1', param2: 'value2' },
      response: {
        body: 'just text!'
      }
    })

    client.Blog.post({ body: { param1: 'value1', param2: 'value2' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })

    client.Blog.post({ body: { param2: 'value2', param1: 'value1' } })
      .then((response) => {
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('accepts a matcher function as an url', (done) => {
    mockRequest({
      method: 'get',
      url: m.stringMatching(/abc123def/),
      response: {
        body: 'just text!'
      }
    })

    client.User.byId({ id: 'abc123def' })
      .then((response) => {
        expect(response.request().method()).toEqual('get')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('just text!')
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('allows for response to be a function of request body', async () => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .with({
        body: m.anything()
      })
      .response((request) => request.body())
      .assertObject()

    const response = await client.Blog.post({ body: { true: false } })

    expect(response.data()).toEqual({ true: false })
  })

  it('allows for response to be a function of request params', async () => {
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({
        id: m.anything()
      })
      .response((request) => request.params())
      .assertObject()

    const response = await client.User.byId({ id: 123 })

    expect(response.data()).toHaveProperty('id', 123)
  })

  it('allows for the status code to be a function of request body', async () => {
    mockClient(client)
      .resource('Blog')
      .method('post')
      .with({
        body: m.anything()
      })
      .status((request) => request.body().created ? 201 : 200)
      .assertObject()

    const response = await client.Blog.post({ body: { created: true } })

    expect(response.status()).toEqual(201)
  })

  it('allows for status code to be a function of request params', async () => {
    mockClient(client)
      .resource('User')
      .method('byId')
      .with({
        id: m.anything()
      })
      .status((request) => request.params().id === 123 ? 200 : 404)
      .assertObject()

    const response = await client.User.byId({ id: 123 })

    expect(response.status()).toEqual(200)
  })
})
