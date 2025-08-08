---
'mappersmith': patch
---

Update the performRequest method in the Fetch gateway to normalize the HTTP method to uppercase to mitigate issue with PATCH calls and undici
