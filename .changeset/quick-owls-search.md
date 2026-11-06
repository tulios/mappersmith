---
'mappersmith': minor
---

Add support for the HTTP `QUERY` method in all gateways. The `Fetch` gateway now sends the method in uppercase, because `fetch` does not normalize the case of `PATCH` and `QUERY`.
