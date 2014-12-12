**Under heavy development, it is not yet ready for production**

# Mappersmith

It is a lightweight rest client mapper for javascript.

# Usage

```javascript
// Given a manifest
var manifest = {
  host: 'http://localhost:4000',
  resources: {
    Book: {
      'all':  {path: '/v1/books.json'},
      'byId': {path: '/v1/books/{id}.json'}
    },
    Photo: {
      'byCategory': {path: '/v1/photos/{category}/all.json'}
    }
  }
}

// You can generate a pseudo 'client' for it
var Client = new Mappersmith.forge(manifest)

// Mappersmith has a transport layer using vanilla javascript and jquery, to change it
// just pass the implementation as the second argument to the forge method

// Ex:
// var Client = new Mappersmith.forge(manifest, Mappersmith.JQueryRequest)

// and then call your api

// http://localhost:4000/v1/books/3.json
Client.Book.byId({id: 3})
Client.Book.byId({id: 3}, function(data) {})

// http://localhost:4000/v1/books/3.json?showMetadata=true
Client.Book.byId({id: 3, showMetadata: true}, function(data) {})

// http://localhost:4000/v1/books.json
Client.Book.all()

// http://localhost:4000/v1/books.json?category=test
Client.Book.all({category: 'test'})

// http://localhost:4000/v1/photos/animals/all.json
Client.Photo.byCategory({category: "animals"})

// <ContextName>.<Resource>.<method>(<params, optional>, <callback>)
```

# Build from the source

## Install the dependencies

```sh
npm install
```

## Build

```sh
npm run build
```
