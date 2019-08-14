---
id: Configuring_my_resources
title: Configuring my resources
sidebar_label: Configuring my resources
---

Each resource has a name and a list of methods with its definitions. A method definition can have host, path, method, headers, params, bodyAttr, headersAttr and authAttr. Example:

```javascript
const client = forge({
  resources: {
    User: {
      all: { path: '/users' },

      // {id} is a dynamic segment and will be replaced by the parameter "id"
      // when called
      byId: { path: '/users/{id}' },

      // {group} is also a dynamic segment but it has default value "general"
      byGroup: { path: '/users/groups/{group}', params: { group: 'general' } }
    },
    Blog: {
      // The HTTP method can be configured through the `method` key, and a default
      // header "X-Special-Header" has been configured for this resource
      create: {
        method: 'post',
        path: '/blogs',
        headers: { 'X-Special-Header': 'value' }
      },

      // There are no restrictions for dynamic segments and HTTP methods
      addComment: { method: 'put', path: '/blogs/{id}/comment' },

      // `queryParamAlias` will map parameter names to their alias when
      // constructing the query string
      bySubject: {
        path: '/blogs',
        queryParamAlias: { subjectId: 'subject_id' }
      }
    }
  }
})
```

### <a name="parameters"></a> Parameters

If your method doesn't require any parameter, you can just call it without them:

```javascript
client.User.all() // https://my.api.com/users
  .then(response => console.log(response.data()))
  .catch(response => console.error(response.data()))
```

Every parameter that doesn't match a pattern `{parameter-name}` in path will be sent as part of the query string:

```javascript
client.User.all({ active: true }) // https://my.api.com/users?active=true
```

When a method requires a parameters and the method is called without it, **Mappersmith** will raise an error:

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

### <a name="aliased-parameters"></a> Renaming query parameters

Sometimes the expected format of your query parameters doesn't match that of your codebase. For example, maybe you're using `camelCase` in your code but the API you are calling expects `snake_case`. In that case, set `queryParamAlias` in the definition to an object that describes a mapping between your input parameter and the desired output format.

This mapping will not be applied to params in the URL.

```javascript
client.Blog.all({ subjectId: 10 }) // https://my.api.com/blogs?subject_id=10
```

### <a name="body"></a> Body

To send values in the request body (usually for POST, PUT or PATCH methods) you will use the special parameter `body`:

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

**NOTE**: It's possible to post body as JSON, check the [EncodeJsonMiddleware](#encode-json-middleware) below for more information
**NOTE**: The `bodyAttr` param can be set at manifest level.

### <a name="headers"></a> Headers

To define headers in the method call use the parameter `headers`:

```javascript
client.User.all({ headers: { Authorization: 'token 1d1435k' } })
```

If `headers` is not possible as a special parameter for your API you can configure it through the param `headersAttr`:

```javascript
// ...
{
  all: { path: '/users', headersAttr: 'h' }
}
// ...

client.User.all({ h: { Authorization: 'token 1d1435k' } })
```

**NOTE**: The `headersAttr` param can be set at manifest level.

### <a name="basic-auth"></a> Basic auth

To define credentials for basic auth use the parameter `auth`:

```javascript
client.User.all({ auth: { username: 'bob', password: 'bob' } })
```

The available attributes are: `username` and `password`.
This will set an `Authorization` header. This can still be overridden by custom headers.

If `auth` is not possible as a special parameter for your API you can configure it through the param `authAttr`:

```javascript
// ...
{
  all: { path: '/users', authAttr: 'secret' }
}
// ...

client.User.all({ secret: { username: 'bob', password: 'bob' } })
```

**NOTE**: A default basic auth can be configured with the use of the [BasicAuthMiddleware](#middleware-basic-auth), check the middleware section below for more information.
**NOTE**: The `authAttr` param can be set at manifest level.

### <a name="timeout"></a> Timeout

To define the number of milliseconds before the request times out use the parameter `timeout`:

```javascript
client.User.all({ timeout: 1000 })
```

If `timeout` is not possible as a special parameter for your API you can configure it through the param `timeoutAttr`:

```javascript
// ...
{
  all: { path: '/users', timeoutAttr: 'maxWait' }
}
// ...

client.User.all({ maxWait: 500 })
```

**NOTE**: A default timeout can be configured with the use of the [TimeoutMiddleware](#timeout-middleware), check the middleware section below for more information.
**NOTE**: The `timeoutAttr` param can be set at manifest level.

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

### <a name="binary-data"></a> Binary data

If the data being fetched is in binary form, such as a PDF, you may add the `binary` key, and set it to true. The response data will then be a [Buffer](https://nodejs.org/api/buffer.html) in NodeJS, and a [Blob](https://developer.mozilla.org/sv-SE/docs/Web/API/Blob) in the browser.

```javascript

// ...
{
  report: { path: '/report.pdf', binary: true }
}
// ...

```
