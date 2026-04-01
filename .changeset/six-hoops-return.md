---
'mappersmith': minor
---

## Rich mock error output

When a mock doesn't match an outgoing request during testing, mappersmith now prints a detailed debug table showing the outgoing request alongside all installed mocks ranked by how closely they matched — making it much easier to spot typos, wrong URLs, or mismatched bodies/headers.

Enable it via the global config (applies to all `install()` calls):

```js
import { configs } from 'mappersmith'

configs.test.richMockErrors = true
```

Or per `install()` call, which overrides the global config:

```js
import { install } from 'mappersmith/test'

beforeEach(() => install({ richMockErrors: true }))
```

### Optional peer dependencies

By default the output is plain text. For bordered tables and character-level diffs, install:

```sh
npm install --save-dev diff tty-table
```

| Package     | What it adds                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `diff`      | Character-level highlighting of what changed between the mock value and the actual request value                  |
| `tty-table` | Bordered, column-aligned tables with colour-coded borders (green = exact match, yellow = partial, red = no match) |

Both are entirely optional — mappersmith falls back to plain text when they are not installed.
