---
'mappersmith': minor
---

Bundle with ESM exports.

- The recommended way to use mappersmith in ESM projects is to do `import { forge } from 'mappersmith'` rather than the old `import forge from 'mappersmith'`. The reason is because test runners like jest and vitest might get confused when mixing named/default exports together with ESM, even though tsc and node has no problems with it.
- A similar recommendation change goes for importing middleware: do `import { EncodeJsonMiddleware } from 'mappersmith/middleware'` (note the `mappersmith/middleware` folder) rather than deep import `import EncodeJsonMiddleware from 'mappersmith/middleware/encode-json'`. We still support the old import, but it will be deprecated in the future.
- The same recommendation goes for importing gateway: do `import { FetchGateway } from 'mappersmith/gateway'` (note the `mappersmith/gateway` folder) rather than deep import `import FetchGateway from 'mappersmith/gateway/fetch'`. We still support the old import, but it will be deprecated in the future.
