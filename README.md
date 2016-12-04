[![npm version](https://badge.fury.io/js/mappersmith.svg)](http://badge.fury.io/js/mappersmith)
[![Build Status](https://travis-ci.org/tulios/mappersmith.svg?branch=master)](https://travis-ci.org/tulios/mappersmith)
# Mappersmith

__THIS README IS STILL INCOMPLETE__

__Mappersmith__ is a lightweight rest client for node.js and the browser. It creates a client for your API, gathering all configurations into a single place, freeing your code from HTTP configurations.

## Table of Contents

1. [Installation](#installation)
1. [Usage](#usage)
  1. [Commonjs](#commonjs)
  1. [Configuring my resources](#resource-configuration)
    1. [Parameters](#parameters)
    1. [Default parameters](#default-parameters)
    1. [Body](#body)
    1. [Headers](#headers)
    1. [Alternative host](#alternative-host)
  1. [Promises](#promises)
1. [Development](#development)

## <a name="installation"></a> Installation

#### NPM

```sh
npm install mappersmith --save
# yarn add mappersmith
```

#### Browser

Download the tag/latest version from the dist folder.

#### Build from the source

Install the dependencies

```sh
yarn
```

Build

```sh
npm run build
npm run release # for minified version
```

## <a name="usage"></a> Usage

To create a client for your API, you will need to provide a simple manifest. If your API reside in the same domain as your app you can skip the `host` configuration. Each resource has a name and a list of methods with its definitions, like:

```javascript
// 1) Import
import forge from 'mappersmith'

// 2) Forge your client with your API manifest
const github = forge({
  host: 'https://status.github.com',
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' },
    }
  }
})

// profit!
github.Status.lastMessage().then((response) => {
  console.log(`status: ${response.data().body}`)
})
```

## <a name="commonjs"></a> Commonjs

If you are using _commonjs_, your `require` should be like:

```javascript
const forge = require('mappersmith').default
```

## <a name="resource-configuration"></a> Configuring my resources

Each resource has a name and a list of methods with its definitions. A method definition can have host, path, method, headers, params, bodyAttr and headersAttr. Example:

```javascript
const client = forge({
  resources: {
    User: {
      all: { path: '/users' }

      // {id} is a dynamic segment and will be replaced by the parameter "id"
      // when called
      byId: { path: '/users/{id}' },

      // {group} is also a dynamic segment but it has default value "general"
      byGroup: { path: '/users/groups/{group}', params: { group: 'general' } },
    },
    Blog: {
      // The HTTP method can be configured through the `method` key, and a default
      // header "X-Special-Header" has been configured for this resource
      create: { method: 'post', path: '/blogs', headers: { 'X-Special-Header': 'value' } },

      // There is no restrictions for dynamic segments and HTTP methods
      addComment: { method: 'put', path: '/blogs/{id}/comment' }
    }
  }
})
```

### <a name="parameters"></a> Parameters

If your method doesn't require any parameter, you can just call it without them:

```javascript
client.User.all() // https://my.api.com/users
```

Every parameter that doesn't match a pattern `{parameter-name}` in path will be sent as part of the query string:

```javascript
client.User.all({ active: true }) // https://my.api.com/users?active=true
```

When a method requires a parameters and the method is called without it, __Mappersmith__ will raise an error:

```javascript
client.User.byId(/* missing id */)
// throw '[Mappersmith] required parameter missing (id), "/users/{id}" cannot be resolved'
```

### <a name="default-parameters"></a> Default Parameters

It is possible to configure default parameters for your resources, just use the key `params` in the definition. It will replace params in the URL or include query strings.

If we call `client.User.byGroup` without any params it will default `group` to "general"

```javascript
client.User.byGroup() // https://my.api.com/users/groups/general
```

And, of course, we can override the defaults:

```javascript
client.User.byGroup({ group: 'cool' }) // https://my.api.com/users/groups/cool
```

### <a name="body"></a> Body

To send values in the request body (usually for POST, PUT, or PATCH methods) you will use the special parameter `body`:

```javascript
client.Blog.create({
  body: {
    title: 'Title',
    tags: ['party', 'launch']
  }
})
```

By default, it will create a _urlencoded_ version of the object (`title=Title&tags[]=party&tags[]=launch`). If the body used is not an object it will use the original value. If `body` is not possible as a special parameter for your API you can configure it through the param `bodyAttr`:

```javascript
// ...
{
  create: { method: 'post', path: '/blogs', bodyAttr: 'payload' }
}
// ...

client.Blog.create({
  payload: {
    title: 'Title',
    tags: ['party', 'launch']
  }
})
```

__NOTE__: It's possible to post body as JSON, check the `EncodeJsonMiddleware` bellow for more information

### <a name="headers"></a> Headers

To define headers in the method call use the parameter `headers`:

```javascript
client.User.all({ headers: { Authorization: 'token 1d1435k'} })
```

If `headers` is not possible as a special parameter for your API you can configure it through the param `headersAttr`:

```javascript
// ...
{
  all: { path: '/users', headersAttr: 'h' }
}
// ...

client.User.all({ h: { Authorization: 'token 1d1435k'} })
```

### <a name="alternative-host"></a> Alternative host

There are some cases where a resource method resides in another host, in those cases you can use the `host` key to configure a new host:

```javascript
// ...
{
  all: { path: '/users', host: 'http://old-api.com' }
}
// ...

client.User.all() // http://old-api.com/users
```

## <a name="promises"></a> Promises

__Mappersmith__ does not apply any polyfills, it depends on a native Promise implementation to be supported. If your environment doesn't support Promises, please apply the polyfill first. One option can be [then/promises](https://github.com/then/promise)

In some cases is not possible to use/assign the global Promise constant, for those cases you can define the promise implementation used by Mappersmith.

For example, using the project rsvp.js (a tiny implementation of Promises/A+):

```javascript
import RSVP from 'rsvp'
import { configs } from 'mappersmith'

configs.Promise = RSVP.Promise
```

All Promise references in Mappersmith use `configs.Promise`. The default value is the global Promise.

## Compile and release

```sh
NODE_ENV=production npm run build
```

## Contributors

Check it out!

https://github.com/tulios/mappersmith/graphs/contributors

## License

See [LICENSE](https://github.com/tulios/mappersmith/blob/master/LICENSE) for more details.
