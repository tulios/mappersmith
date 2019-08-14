---
id: Middleware
title: Middleware
sidebar_label: Middleware
---

The behavior between your client and the API can be customized with middleware. A middleware is a function which returns an object with two methods: request and response.

### <a name="creating-middleware"></a> Creating middleware

The `prepareRequest` method receives a function which returns a `Promise` resolving the [Request](https://github.com/tulios/mappersmith/blob/master/src/request.js). This function must return a `Promise` resolving the request. The method `enhance` can be used to generate a new request based on the previous one.

The `response` method receives a function which returns a `Promise` resolving the [Response](https://github.com/tulios/mappersmith/blob/master/src/response.js). This function must return a `Promise` resolving the Response. The method `enhance` can be used to generate a new response based on the previous one.

```javascript
const MyMiddleware = () => ({
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

#### <a name="context"></a> Context

Sometimes you may need to set data to be available to all your client's middleware. In this
case you can use the `setContext` helper, like so:

```javascript
import { setContext } from 'mappersmith'

const MyMiddleware = ({ context }) => ({
  /* ... */
})

setContext({ some: 'data' })

client.User.all()
// context: { some: 'data' }
```

This is specially useful when using mappermith coupled with back-end services.
For instance you could define a globally available correlation id middleware
like this:

```javascript
import forge, { configs, setContext } from 'mappersmith'
import express from 'express'

const CorrelationIdMiddleware = ({ context }) => ({
  request(request) {
    return request.enhance({
      headers: {
        'correlation-id': context.correlationId
      }
    })
  }
})

configs.middleware = [CorrelationIdMiddleware]

const api = forge({ ... })

const app = express()
app.use((req, res, next) => {
  setContext({
    correlationId: req.headers['correlation-id']
  })
})

// Then, when calling `api.User.all()` in any handler it will include the
// `correlation-id` header automatically.
```

Note that setContext will merge the object provided with the current context
instead of replacing it.

#### <a name="creating-middleware-optional-arguments"></a> Optional arguments

It can, optionally, receive `resourceName`, `resourceMethod`, [#context](`context`) and `clientId`. Example:

```javascript
const MyMiddleware = ({ resourceName, resourceMethod, context, clientId }) => ({
  /* ... */
})

client.User.all()
// resourceName: 'User'
// resourceMethod: 'all'
// clientId: 'myClient'
// context: {}
```

##### <a name="creating-middleware-optional-arguments-abort"></a> Abort

The `prepareRequest` phase can optionally receive a function called "abort". This function can be used to abort the middleware execution early-on and throw a custom error to the user. Example:

```javascript
const MyMiddleware = () => {
  prepareRequest(next, abort) {
    return next().then(request =>
      request.header('x-special')
        ? response
        : abort(new Error('"x-special" must be set!'))
    )
  }
}
```

##### <a name="creating-middleware-optional-arguments-renew"></a> Renew

The `response` phase can optionally receive a function called "renew". This function can be used to rerun the middleware stack. This feature is useful in some scenarios, for example, automatically refreshing an expired access token. Example:

```javascript
const AccessTokenMiddleware = () => {
  // maybe this is stored elsewhere, here for simplicity
  let accessToken = null

  return () => ({
    request(request) {
      return Promise.resolve(accessToken)
        .then(token => token || fetchAccessToken())
        .then(token => {
          accessToken = token
          return request.enhance({
            headers: { Authorization: `Token ${token}` }
          })
        })
    },
    response(next, renew) {
      return next().catch(response => {
        if (response.status() === 401) {
          // token expired
          accessToken = null
          return renew()
        }

        return next()
      })
    }
  })
}
```

Then:

```javascript
const AccessToken = AccessTokenMiddleware()
const client = forge({
  // ...
  middleware: [AccessToken]
  // ...
})
```

"renew" can only be invoked sometimes before it's considered an infinite loop, make sure your middleware can distinguish an error from a "renew". By default, mappersmith will allow 2 calls to "renew". This can be configured with `configs.maxMiddlewareStackExecutionAllowed`. It's advised to keep this number low. Example:

```javascript
import { configs } from 'mappersmith'
configs.maxMiddlewareStackExecutionAllowed = 3
```

If an infinite loop is detected, mappersmith will throw an error.

### <a name="configuring-middleware"></a> Configuring middleware

Middleware scope can be Global, Client or on Resource level. The order will be applied in this order: Resource level applies first, then Client level, and finally Global level. The subsections below describes the differences and how to use them correctly.

#### <a name="resource-middleware"></a> Resource level middleware

Resource middleware are configured using the key `middleware` in the resource level of manifest, example:

```javascript
const client = forge({
  clientId: 'myClient',
  resources: {
    User: {
      all: {
        // only the `all` resource will include MyMiddleware:
        middleware: [MyMiddleware],
        path: '/users'
      }
    }
  }
})
```

#### <a name="client-middleware"></a> Client level middleware

Client middleware are configured using the key `middleware` in the root level of manifest, example:

```javascript
const client = forge({
  clientId: 'myClient',
  // all resources in this client will include MyMiddleware:
  middleware: [MyMiddleware],
  resources: {
    User: {
      all: { path: '/users' }
    }
  }
})
```

#### <a name="global-middleware"></a> Global middleware

Global middleware are configured on a config level, and all new clients will automatically
include the defined middleware, example:

```javascript
import forge, { configs } from 'mappersmith'

configs.middleware = [MyMiddleware]
// all clients defined from now on will include MyMiddleware
```

- Global middleware can be disabled for specific clients with the option `ignoreGlobalMiddleware`, e.g:

```javascript
forge({
  ignoreGlobalMiddleware: true
  // + the usual configurations
})
```

### <a name="built-in-middleware"></a> Built-in middleware

#### <a name="middleware-basic-auth"></a> BasicAuth

Automatically configure your requests with basic auth

```javascript
import BasicAuthMiddleware from 'mappersmith/middleware/basic-auth'
const BasicAuth = BasicAuthMiddleware({ username: 'bob', password: 'bob' })

const client = forge({
  middleware: [BasicAuth]
  /* ... */
})

client.User.all()
// => header: "Authorization: Basic Ym9iOmJvYg=="
```

\*\* The default auth can be overridden with the explicit use of the auth parameter, example:

```javascript
client.User.all({ auth: { username: 'bill', password: 'bill' } })
// auth will be { username: 'bill', password: 'bill' } instead of { username: 'bob', password: 'bob' }
```

#### <a name="middleware-csrf"></a> CSRF

Automatically configure your requests by adding a header with the value of a cookie - If it exists.
The name of the cookie (defaults to "csrfToken") and the header (defaults to "x-csrf-token") can be set as following;

```javascript
import CSRF from 'mappersmith/middleware/csrf'

const client = forge({
  middleware: [CSRF('csrfToken', 'x-csrf-token')]
  /* ... */
})

client.User.all()
```

#### <a name="middleware-duration"></a> Duration

Automatically adds `X-Started-At`, `X-Ended-At` and `X-Duration` headers to the response.

```javascript
import Duration from 'mappersmith/middleware/duration'

const client = forge({
  middleware: [Duration]
  /* ... */
})

client.User.all({ body: { name: 'bob' } })
// => headers: "X-Started-At=1492529128453;X-Ended-At=1492529128473;X-Duration=20"
```

#### <a name="middleware-encode-json"></a> EncodeJson

Automatically encode your objects into JSON

```javascript
import EncodeJson from 'mappersmith/middleware/encode-json'

const client = forge({
  middleware: [EncodeJson]
  /* ... */
})

client.User.all({ body: { name: 'bob' } })
// => body: {"name":"bob"}
// => header: "Content-Type=application/json;charset=utf-8"
```

#### <a name="middleware-global-error-handler"></a> GlobalErrorHandler

Provides a catch-all function for all requests. If the catch-all function returns `true` it prevents the original promise to continue.

```javascript
import GlobalErrorHandler, {
  setErrorHandler
} from 'mappersmith/middleware/global-error-handler'

setErrorHandler(response => {
  console.log('global error handler')
  return response.status() === 500
})

const client = forge({
  middleware: [GlobalErrorHandler]
  /* ... */
})

client.User.all().catch(response => console.error('my error'))

// If status != 500
// output:
//   -> global error handler
//   -> my error

// IF status == 500
// output:
//   -> global error handler
```

#### <a name="middleware-log"></a> Log

Log all requests and responses. Might be useful in development mode.

```javascript
import Log from 'mappersmith/middleware/log'

const client = forge({
  middleware: [Log]
  /* ... */
})
```

#### <a name="middleware-retry"></a> Retry

This middleware will automatically retry GET requests up to the configured amount of retries using a randomization function that grows exponentially. The retry count and the time used will be included as a header in the response. By default on requests with response statuses >= 500 will be retried.

##### v2

It's possible to configure the header names and parameters used in the calculation by providing a configuration object when creating the middleware.

If no configuration is passed when creating the middleware then the defaults will be used.

```javascript
import Retry from 'mappersmith/middleware/retry/v2'

const retryConfigs = {
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: response => response.responseStatus >= 500 // a function that returns true if the request should be retried
}

const client = forge({
  middleware: [Retry(retryConfigs)]
  /* ... */
})
```

##### v1 (deprecated)

The v1 retry middleware is now deprecated as it relies on global configuration which can cause issues if you need to have multiple different configurations.

```javascript
import Retry from 'mappersmith/middleware/retry'

const client = forge({
  middleware: [Retry]
  /* ... */
})
```

It's possible to configure the header names and parameters used in the calculation by calling the deprecated setRetryConfigs method.

```javascript
import { setRetryConfigs } from 'mappersmith/middleware/retry'

// Using the default values as an example
setRetryConfigs({
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: response => response.responseStatus >= 500 // a function that returns true if the request should be retried
})
```

#### <a name="middleware-timeout"></a> Timeout

Automatically configure your requests with a default timeout

```javascript
import TimeoutMiddleware from 'mappersmith/middleware/timeout'
const Timeout = TimeoutMiddleware(500)

const client = forge({
  middleware: [Timeout]
  /* ... */
})

client.User.all()
```

\*\* The default timeout can be overridden with the explicit use of the timeout parameter, example:

```javascript
client.User.all({ timeout: 100 })
// timeout will be 100 instead of 500
```

### <a name="middleware-legacy-notes"></a> Middleware legacy notes

This section is only relevant for mappersmith versions older than but not including `2.27.0`, when the method `prepareRequest` did not exist. This section describes how to create a middleware using older versions.

Since version `2.27.0` a new method was introduced: `prepareRequest`. This method aims to replace the `request` method in future versions of mappersmith, it has a similar signature as the `response` method and it is always async. All previous middleware are backward compatible, the default implementation of `prepareRequest` will call the `request` method if it exists.

The `request` method receives an instance of the [Request](https://github.com/tulios/mappersmith/blob/master/src/request.js) object and it must return a Request. The method `enhance` can be used to generate a new request based on the previous one.

Example:

```javascript
const MyMiddleware = () => ({
  request(request) {
    return request.enhance({
      headers: { 'x-special-request': '->' }
    })
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

The request phase can be asynchronous, just return a promise resolving a request. Example:

```javascript
const MyMiddleware = () => ({
  request(request) {
    return Promise.resolve(
      request.enhance({
        headers: { 'x-special-token': 'abc123' }
      })
    )
  }
})
```
