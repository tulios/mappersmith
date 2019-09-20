---
id: Response_object
title: Response object
sidebar_label: Response object
---

Mappersmith will provide an instance of its own `Response` object to the promises. This object has the methods:

- `request()` - Returns the original [Request](https://github.com/tulios/mappersmith/blob/master/src/request.js)
- `status()` - Returns the status number
- `success()` - Returns true for status greater than 200 and lower than 400
- `headers()` - Returns an object with all headers, keys in lower case
- `header(name)` - Returns the value of the header
- `data()` - Returns the response data, if `Content-Type` is `application/json` it parses the response and returns an object
- `error()` - Returns the last error instance that caused the request to fail or `null`
