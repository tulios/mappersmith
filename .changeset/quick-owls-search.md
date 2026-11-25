---
'mappersmith': minor
---

Add support for the HTTP `QUERY` method in all gateways. The `RetryMiddleware` now retries `QUERY` requests by default, like `GET`, except requests with a stream body, and `emulateHTTP` now also sends `QUERY` requests as `POST` with the method override. The `Fetch` gateway now sends the method in uppercase, because `fetch` does not normalize the case of `PATCH` and `QUERY`.
