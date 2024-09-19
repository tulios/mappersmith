import { lookupResponse, mockClient, clear, install, m } from './index'
import { MethodDescriptor } from '../method-descriptor'
import { Request } from '../request'
import randomJsonData from './data/random-json-data.json'
import { forge } from '../index'

const stripAnsi = (str) => {
  // Regular expression to match ANSI escape codes
  // This removes all the color codes and other special codes
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
  return str.replace(ansiRegex, '')
}

const LOG_TO_CONSOLE = false

const expectToThrowErrorMatchingSnapshotWithoutAnsi = (fn, logToConsole = LOG_TO_CONSOLE) => {
  try {
    fn()
    throw new Error('Expected function to throw an error, but it did not.')
  } catch (error) {
    if (logToConsole) console.log(error)
    const cleanedError = stripAnsi(error.message)
    expect(cleanedError).toMatchSnapshot()
  }
}

describe('mappersmith/test/lookupResponse', () => {
  beforeEach(() => {
    clear()
    // Set this to a fixed value so that the tables are always the same width
    process.stdout.columns = 100
    install({ enhancedDebugging: true })
  })

  it('should match when request is exact match', () => {
    const method = 'GET'
    const host = 'http://example.org'
    const path = '/path'
    const body = { id: 1 }
    const responseBody = { id: 'my-id' }
    const headers = { 'X-TEST': 'VALUE' }
    const query = { id: 1 }

    mockClient(forge({ host, resources: { users: { get: { path, method } } } }))
      .resource('users')
      .method('get')
      .with({ body, headers, query })
      .response(responseBody)
      .status(200)

    const request = new Request(new MethodDescriptor({ method, host, path }), {
      body,
      headers,
      query,
    })

    expect(() => lookupResponse(request)).not.toThrow()

    const response = lookupResponse(request)
    expect(response.responseData).toEqual(JSON.stringify(responseBody))
  })

  it('should output a clear message when there are no mocks installed', () => {
    const method = 'GET'
    const host = 'http://example.org'
    const path = '/path'
    const body = {
      parameter: 1,
      deep: {
        maybe_gql: 'query { user { id } }',
        variables: { id: 1 },
      },
    }
    const headers = { header1: 'value', header2: 'value2' }
    const query = { parameter: 1, parameter2: 2 }

    const request = new Request(new MethodDescriptor({ method, host, path }), {
      body,
      headers,
      query,
    })

    expectToThrowErrorMatchingSnapshotWithoutAnsi(() => lookupResponse(request))
  })

  it('should log all existing mocks when there is no match', () => {
    const body = {
      parameter: 1,
      deep: {
        maybe_gql: 'query { user { id } }',
        variables: { id: 1 },
      },
    }
    const headers = { header1: 'value', header2: 'value2' }
    const query = { parameter: 1, parameter2: 2 }

    mockClient(
      forge({
        host: 'http://example-1.org',
        resources: { users: { get: { path: '/no-path', method: 'POST' } } },
      })
    )
      .resource('users')
      .method('get')
      .with({ body, headers, query })

    const request = new Request(
      new MethodDescriptor({ host: 'http://example.org', method: 'GET', path: '/path' }),
      { body, headers, query }
    )

    expectToThrowErrorMatchingSnapshotWithoutAnsi(() => lookupResponse(request))
  })

  it('should log all existing mocks when there is a partial match', () => {
    mockClient(
      forge({
        host: 'http://example.org',
        resources: {
          users: { get: { path: '/path', method: 'GET' } },
        },
      })
    )
      .resource('users')
      .method('get')
      .with({ body: { id: 1 }, headers: { 'X-TEST': 'VALUE' } })

    const request = new Request(
      new MethodDescriptor({ host: 'http://example.org', method: 'GET', path: '/path' }),
      {
        body: { id: 2 },
        headers: { 'X-TEST': 'VALUE2' },
      }
    )

    expectToThrowErrorMatchingSnapshotWithoutAnsi(() => lookupResponse(request))
  })

  it('should correctly handle m.anything() displaying that it matches ANYTHING', () => {
    mockClient(
      forge({
        host: 'http://example.org',
        resources: {
          users: { get: { path: '/path', method: 'GET' } },
        },
      })
    )
      .resource('users')
      .method('get')
      .with({ body: m.anything(), headers: { 'X-TEST': 'VALUE-2' } })

    const request = new Request(
      new MethodDescriptor({ host: 'http://example.org', method: 'GET', path: '/path' }),
      {
        body: { id: 2 },
        headers: { 'X-TEST': 'VALUE2' },
      }
    )

    expectToThrowErrorMatchingSnapshotWithoutAnsi(() => lookupResponse(request))
  })

  it('should handle multiple mocks with large bodies and long URLs, including a partial match', () => {
    const client = forge({
      clientId: 'My Client',
      host: 'http://example.org',
      resources: {
        users: { get: { path: '/path', method: 'GET' } },
        posts: { post: { path: '/long/path/to/resource/with/many/segments', method: 'POST' } },
        comments: { put: { path: '/another/very/long/path/to/resource', method: 'PUT' } },
      },
    })

    mockClient(client)
      .resource('users')
      .method('get')
      .with({
        body: { id: 1 },
        headers: { 'X-TEST': 'VALUE' },
        query: { id: 1 },
      })
      .response({ id: 'user-id' })
      .status(200)

    mockClient(client)
      .resource('posts')
      .method('post')
      .with({
        body: { content: 'This is a very large body with lots of content...' },
        headers: { 'Content-Type': 'application/json' },
        query: { postId: 12345 },
      })
      .response({ id: 'post-id' })
      .status(201)

    // Partial match: same URL and method, but different body and headers
    mockClient(client)
      .named('My Named Mock')
      .resource('users')
      .method('get')
      .with({
        body: randomJsonData,
        headers: { 'X-TEST': 'DIFFERENT-VALUE' },
      })
      .response({ id: 'partial-match-id' })
      .status(200)

    mockClient(client)
      .resource('comments')
      .method('put')
      .with({
        body: { ...randomJsonData, _id: '66ec092d7189db5c15ea3f05' },
        headers: { 'Content-Type': 'application/json' },
        query: { commentId: 67890 },
      })
      .response({ id: 'comment-id' })
      .status(200)

    const request = new Request(
      new MethodDescriptor({ host: 'http://example.org', method: 'GET', path: '/path' }),
      {
        body: randomJsonData,
        headers: { 'X-TEST': 'DIFFERENT-VALUE' },
        query: { id: 2 },
      }
    )

    expectToThrowErrorMatchingSnapshotWithoutAnsi(() => lookupResponse(request), true)
  })
})
