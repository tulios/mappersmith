---
id: Promises
title: Promises
sidebar_label: Promises
---

**Mappersmith** does not apply any polyfills, it depends on a native Promise implementation to be supported. If your environment doesn't support Promises, please apply the polyfill first. One option can be [then/promises](https://github.com/then/promise)

In some cases it is not possible to use/assign the global `Promise` constant, for those cases you can define the promise implementation used by Mappersmith.

For example, using the project [rsvp.js](https://github.com/tildeio/rsvp.js/) (a tiny implementation of Promises/A+):

```javascript
import RSVP from 'rsvp'
import { configs } from 'mappersmith'

configs.Promise = RSVP.Promise
```

All `Promise` references in Mappersmith use `configs.Promise`. The default value is the global Promise.
