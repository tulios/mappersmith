# Mappersmith

**Mappersmith** is a lightweight, dependency-free, rest client mapper for javascript. It helps you map your API to use at the client, giving you all the flexibility you want to customize requests or write your own gateways.

## Install

#### NPM

```sh
npm install mappersmith
```

#### Browser

Download the tag/latest version from the build folder.

#### Build from the source

Install the dependencies

```sh
npm install
```

Build

```sh
npm run build
```

## Usage

To create a client for your API, you will need to provide a simple manifest, which must have `host` and `resources` keys. Each resource has a name and a list of methods with its definitions, like:

```javascript
var manifest = {
  host: 'http://my.api.com',
  resources: {
    Book: {
      all:  {path: '/v1/books.json'},
      byId: {path: '/v1/books/{id}.json'}
    },
    Photo: {
      byCategory: {path: '/v1/photos/{category}/all.json'}
    }
  }
}
```

You can specify an HTTP method for every API call, but if you don't, `GET` will be used. For instance, let's say you can save a photo:

```javascript
...
Photo: {
  save: {method: 'POST', path: '/v1/photos/{category}/save'}
}
...
```

With the manifest in your hands, you are able to forge your client:

```javascript
var Client = new Mappersmith.forge(manifest)
```

And then, use it as defined:

```javascript
// without callbacks
Client.Book.byId({id: 3})

// with all callbacks
Client.Book.byId({id: 3}, function(data) {
  // success callback
}).fail(function() {
  // fail callback
}).complete(function() {
  // complete callback, it will always be called
})
```

#### Parameters

If your method doesn't require any parameter, you can just call it without them:

```javascript
Client.Book.all() // http://my.api.com/v1/books.json
```

Every parameter that doesn't match a pattern (`{parameter-name}`) in `path` will be sent as part of the query string:

```javascript
Client.Book.all({language: 'en'}) // http://my.api.com/v1/books.json?language=en
```

#### Message Body

To send values in the request body (usually for POST or PUT methods) you will use the special parameter `body`:

```javascript
Client.Photo.save({category: 'family', body: {year: 2015, tags: ['party', 'family']}})
```

It will create a urlencoded version of the object (`year=2015&tags[]=party&tags[]=family`). If the `body` used
is not an object it will use the original value. If `body` is not possible as a special parameter
for your API you can configure it with another value, just pass the new name as the third argument
of method forge:

```javascript
var Client = new Mappersmith.forge(manifest, Mappersmith.VanillaGateway, 'data')
...
Client.Photo.save({category: 'family', data: {year: 2015, tags: ['party', 'family']}})
```

#### Processors

You can specify functions to process returned data before they are passed to success callback:

```javascript
...
Book: {
  all:  {
    path: '/v1/books.json',
    processor: function(data) {
      return data.result;
    }
  }
}
...
```

#### Compact Syntax
If you find tiring having to map your API methods with hashes, you can use our incredible compact syntax:

```javascript
...
Book: {
  all: 'get:/v1/books.json',  // The same as {method: 'GET', path: '/v1/books.json'}
  byId: '/v1/books/{id}.json' // The default is GET, as always
},
Photo: {
  // The same as {method: 'POST', path: '/v1/photos/{category}/save.json'}
  save: 'post:/v1/photos/{category}/save'
}
...
```

**A downside is that you can't use processor functions with compact syntax.**

## Gateways

**Mappersmith** allows you to customize the transport layer. You can use the default `Mappersmith.VanillaGateway`, the included `Mappersmith.JQueryGateway` or write your own version.

#### How to write one?

```javascript
var MyGateway = Mappersmith.createGateway({
  get: function() {
    // you will have:
    // - this.url
    // - this.params
    // - this.body
    // - this.opts
  },

  post: function() {
  }

  // and other HTTP methods
})
```

#### How to change the default?

Just provide an object created with `Mappersmith.createGateway` as the second argument of the method `forge`:

```javascript
var Client = new Mappersmith.forge(manifest, Mappersmith.JQueryGateway)
```

#### Specifics of each gateway

You can pass options for the gateway implementation that you are using. For example, if we are using the `Mappersmith.JQueryGateway` and want one of our methods to use `jsonp`, we can call it like:

```javascript
Client.Book.byId({id: 2}, function(data) {}, {jsonp: true})
```

The third argument is passed to the gateway as `this.opts` and, of course, the accepted options vary by each implementation. The default gateway, `Mappersmith.VanillaGateway`, accepts a `configure` callback:

```javascript
Client.Book.byId({id: 2}, function(data) {}, {
  configure: function(request) {
    // do whatever you want
  }
})
```

#### Global configurations and URL matching

Imagine that you are using `Mappersmith.JQueryGateway` and all of your methods must be called with `jsonp` or use a special header, it will be incredibly boring add those configurations every time. Global configurations allow you to configure gateway options and a processor that will be used for every method. Keep in mind that the processor configured in the resource will be prioritized instead to global, for example:

```javascript
var manifest = {
  host: 'http://my.api.com',
  rules: [
    { // This is our global configuration
      values: {
        gateway: {jsonp: true},
        processor: function(data) { return data.result }
      }
    }
  ],
  resources: {
    Book: {
      all:  {path: '/v1/books.json'},
      byId: {path: '/v1/books/{id}.json'}
    },
    Photo: {
      byCategory: {path: '/v1/photos/{category}/all.json'}
    }
  }
}
```

It is possible to add some configurations based on matches in the URLs, let's include a header for every book URL:

```javascript
...
rules: [
  { // This is our global configuration
    values: {
      gateway: {jsonp: true},
      processor: function(data) { return data.result }
    }
  },
  { // This will only be applied when the URL matches the regexp
    match: /\/v1\/books/,
    values: {headers: {'X-MY-HEADER': 'value'}}
  }
]
...
```

Just keep in mind that the configurations and processors will be prioritized by their order, and the global configurations does not have a `match` key.

## Gateway Implementations

The gateways listed here are available through the `Mappersmith` namespace.

### VanillaGateway

The default gateway - it uses plain `XMLHttpRequest`. Accepts a `configure` callback that allows you to change the request object before it is used.

#### Available methods:

- :ok: GET
- :ok: POST
- :ok: PUT
- :ok: DELETE
- :ok: PATCH

#### Available options:

- emulateHTTP: sends request as POST with `_method` in the body and `X-HTTP-Method-Override` header, both with requested method as value. (default `false`)


### JQueryGateway

It uses `$.ajax` and accepts an object that will be merged with `defaults`. It doesn't include **jquery**, so you will need to include that in your page.

#### Available methods:

- :ok: GET
- :ok: POST
- :ok: PUT
- :ok: DELETE
- :ok: PATCH

#### Available options:

- emulateHTTP: sends request as POST with `_method` in the body and `X-HTTP-Method-Override` header, both with request method as value. (default `false`)


## Tests

1. Build the source (`npm run build-test`)
2. Open test.html

## Compile and release

* Compile: `npm run build`
* Release (minified version): `npm run release`

## Licence

See [LICENCE](https://github.com/tulios/mappersmith/blob/master/LICENSE) for more details.
