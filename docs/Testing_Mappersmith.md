---
id: Testing_Mappersmith
title: Testing Mappersmith
sidebar_label: Testing Mappersmith
---

Mappersmith plays nice with all test frameworks, the generated client is a plain javascript object and all the methods can be mocked without any problem. However, this experience can be greatly improved with the test library.

The test library has 4 utilities: `install`, `uninstall`, `mockClient` and `mockRequest`

#### install and uninstall

They are used to setup the test library, **example using jasmine**:

```javascript
import { install, uninstall } from 'mappersmith/test'

describe('Feature', () => {
  beforeEach(() => install())
  afterEach(() => uninstall())
})
```

#### mockClient

`mockClient` offers a high level abstraction, it works directly on your client mocking the resources and their methods.

It accepts the methods:

- `resource(resourceName)`, ex: `resource('Users')`
- `method(resourceMethodName)`, ex: `method('byId')`
- `with(resourceMethodArguments)`, ex: `with({ id: 1 })`
- `status(statusNumber | statusHandler)`, ex: `status(204)` or `status((request, mock) => 200)`
- `response(responseData | responseHandler)`, ex: `response({ user: { id: 1 } })` or `response((request, mock) => ({ user: { id: request.body().id } }))`
- `assertObject()`
- `assertObjectAsync()`

Example using **jasmine**:

```javascript
import forge from 'mappersmith'
import { install, uninstall, mockClient } from 'mappersmith/test'

describe('Feature', () => {
  beforeEach(() => install())
  afterEach(() => uninstall())

  it('works', done => {
    const myManifest = {} // Let's assume I have my manifest here
    const client = forge(myManifest)

    mockClient(client)
      .resource('User')
      .method('all')
      .response({ allUsers: [{ id: 1 }] })

    // now if I call my resource method, it should return my mock response
    client.User.all()
      .then(response =>
        expect(response.data()).toEqual({ allUsers: [{ id: 1 }] })
      )
      .then(done)
  })
})
```

To mock a failure just use the correct HTTP status, example:

```javascript
// ...
mockClient(client)
  .resource('User')
  .method('byId')
  .with({ id: 'ABC' })
  .status(422)
  .response({ error: 'invalid ID' })
// ...
```

The method `with` accepts the body and headers attributes, example:

```javascript
// ...
mockClient(client).with({
  id: 'abc',
  headers: { 'x-special': 'value' },
  body: { payload: 1 }
})
// ...
```

It's possible to use a match function to assert params and body, example:

```javascript
import { m } from 'mappersmith/test'

mockClient(client).with({
  id: 'abc',
  name: m.stringContaining('john'),
  headers: { 'x-special': 'value' },
  body: m.stringMatching(/token=[^&]+&other=true$/)
})
```

The assert object can be used to retrieve the requests, example:

```javascript
const mock = mockClient(client)
  .resource('User')
  .method('all')
  .response({ allUsers: [{ id: 1 }] })
  .assertObject()

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())
```

If you have a middleware with an async request phase use `assertObjectAsync` to await for the middleware execution, example:

```javascript
const mock = await mockClient(client)
  .resource('User')
  .method('all')
  .response({ allUsers: [{ id: 1 }] })
  .assertObjectAsync()

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())
```

`response` and `status` can accept functions to generate response body or status. This can be useful when you want to return different responses for the same request being made several times.

```javascript
const generateResponse = () => {
  return (request, mock) => (mock.callsCount() === 0 ? {} : { user: { id: 1 } })
}

const mock = mockClient(client)
  .resource('User')
  .method('create')
  .response(generateResponse())
```

#### mockRequest

`mockRequest` offers a low level abstraction, very useful for automations.

It accepts the params: method, url, body and response

It returns an assert object

Example using **jasmine**:

```javascript
import forge from 'mappersmith'
import { install, uninstall, mockRequest } from 'mappersmith/test'

describe('Feature', () => {
  beforeEach(() => install())
  afterEach(() => uninstall())

  it('works', done => {
    mockRequest({
      method: 'get',
      url: 'https://my.api.com/users?someParam=true',
      response: {
        body: { allUsers: [{ id: 1 }] }
      }
    })

    const myManifest = {} // Let's assume I have my manifest here
    const client = forge(myManifest)

    client.User.all()
      .then(response =>
        expect(response.data()).toEqual({ allUsers: [{ id: 1 }] })
      )
      .then(done)
  })
})
```

A more complete example:

```javascript
// ...
mockRequest({
  method: 'post',
  url: 'http://example.org/blogs',
  body: 'param1=A&param2=B', // request body
  response: {
    status: 503,
    body: { error: true },
    headers: { 'x-header': 'nope' }
  }
})
// ...
```

It's possible to use a match function to assert the body and the URL, example:

```javascript
import { m } from 'mappersmith/test'

mockRequest({
  method: 'post',
  url: m.stringMatching(/example\.org/),
  body: m.anything(),
  response: {
    body: { allUsers: [{ id: 1 }] }
  }
})
```

Using the assert object:

```javascript
const mock = mockRequest({
  method: 'get',
  url: 'https://my.api.com/users?someParam=true',
  response: {
    body: { allUsers: [{ id: 1 }] }
  }
})

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())
```

#### Match functions

`mockClient` and `mockRequest` accept match functions, the available built-in match functions are:

```javascript
import { m } from 'mappersmith/test'

m.stringMatching(/something/) // accepts a regexp
m.stringContaining('some-string') // accepts a string
m.anything()
m.uuid4()
```

A match function is a function which returns a boolean, example:

```javascript
mockClient(client).with({
  id: 'abc',
  headers: { 'x-special': 'value' },
  body: body => body === 'something'
})
```

**Note**:
`mockClient` only accepts match functions for **body** and **params**
`mockRequest` only accepts match functions for **body** and **url**
