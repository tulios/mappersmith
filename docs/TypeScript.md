---
id: TypeScript
title: TypeScript
sidebar_label: TypeScript
---

**Mappersmith** also supports TypeScript (>=3.5). In the following sections there are some common examples for using TypeScript with Mappersmith where it is not too obvious how typings are properly applied.

#### Create a middleware with TypeScript

To create a middleware using TypeScript you just have to add the `Middleware` interface to your middleware object:

```typescript
import { Middleware } from 'mappersmith'

const MyMiddleware: Middleware = () => ({
  prepareRequest(next) {
    return next().then(request =>
      request.enhance({
        headers: { 'x-special-request': '->' }
      })
    )
  },

  response(next) {
    return next().then(response =>
      response.enhance({
        headers: { 'x-special-response': '<-' }
      })
    )
  }
})
```

#### Use `mockClient` with TypeScript

To use the `mockClient` with proper types you need to pass a typeof your client as generic to the `mockClient` function:

```typescript
import forge from 'mappersmith'
import { mockClient } from 'mappersmith/test'

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' }
    }
  }
})

const mock = mockClient<typeof github>(github)
  .resource('Status')
  .method('current')
  .with({ id: 'abc' })
  .response({ allUsers: [] })
  .assertObject()

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())
```

#### Use `mockRequest` with Typescript

```typescript
const mock = mockRequest({
  method: 'get',
  url: 'https://status.github.com/api/status.json',
  response: {
    status: 503,
    body: { error: true }
  }
})

console.log(mock.mostRecentCall())
console.log(mock.callsCount())
console.log(mock.calls())
```
