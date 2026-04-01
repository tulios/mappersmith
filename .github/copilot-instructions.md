# Copilot Instructions for mappersmith

## Project Overview

Mappersmith is an isomorphic REST client library (Node.js + browser) that lets you declare API clients using a manifest-based configuration. It ships as dual ESM + CJS bundles.

## Build, Test & Lint Commands

```bash
# Build
yarn build            # Full build (clean → tsup → typings)
yarn build:clean      # Clean dist/ and rebuild

# Type checking
yarn test:types       # tsc --noEmit
yarn test:types:watch

# Unit tests (three environments)
yarn test:node        # Jest, Node environment
yarn test:browser     # Jest, jsdom environment
yarn test:service-worker  # Jest, service worker environment

# Run a single test file
yarn jest --config jestSetup/configs/config.node.json path/to/file.spec.ts
yarn jest --config jestSetup/configs/config.web.json path/to/file.web.spec.ts

# Run a single test case by name
yarn jest --config jestSetup/configs/config.node.json -t "test case name"

# Integration tests (requires server running on :9090)
yarn integration-server &
yarn test:node:integration
yarn test:browser:integration

# Lint & format
yarn lint             # ESLint on src/ and spec/
yarn prettier --check .
```

The full `yarn test` suite runs: type check → prettier → lint → all unit tests.

## Architecture

### Core Flow

```
forge(manifest) → ClientBuilder → Manifest → MethodDescriptor
                                              ↓
                              Middleware Stack (prepareRequest phase)
                                              ↓
                              Gateway (HTTP / XHR / Fetch / Mock)
                                              ↓
                              Middleware Stack (response phase, reverse order)
                                              ↓
                                       Promise<Response>
```

### Key Modules (`src/`)

| Module                 | Role                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `mappersmith.ts`       | Exports `forge()` and global `configs`                                                              |
| `client-builder.ts`    | Builds the client object, owns the middleware execution stack                                       |
| `manifest.ts`          | Validates and holds the full manifest (resources, middleware, gateway configs)                      |
| `method-descriptor.ts` | Describes a single HTTP method (path, params, headers, auth, etc.)                                  |
| `request.ts`           | Immutable Request; use `.enhance()` to produce modified copies                                      |
| `response.ts`          | Immutable Response; holds status, data, headers, errors                                             |
| `gateway/`             | Transport implementations: `HTTP` (Node), `XHR` (browser), `Fetch`, `Mock`                          |
| `middleware/`          | Built-in middleware: BasicAuth, CSRF, Duration, EncodeJson, GlobalErrorHandler, Log, Timeout, Retry |
| `test/`                | `requestFactory` / `responseFactory` helpers for unit tests                                         |
| `utils/`               | Query string building, deep clone, object helpers                                                   |

### Middleware System

A middleware is a **factory function** returning a `MiddlewareDescriptor`:

```typescript
// Pattern for all middleware
const MyMiddleware = (options: Options): Middleware =>
  function MyMiddleware({ clientId, context, resourceName, resourceMethod }) {
    return {
      prepareRequest(next, abort) {
        return next().then((request) => request.enhance({ headers: { 'X-Foo': 'bar' } }))
      },
      response(next, renew, request) {
        return next().then((response) => response)
      },
    }
  }
```

- `prepareRequest` runs **before** the gateway, in middleware-array order.
- `response` runs **after** the gateway, in **reverse** order.
- Call `renew()` inside `response` to restart the stack (e.g., token refresh). The max restarts is controlled by `configs.maxMiddlewareStackExecutionAllowed`.

Middleware can be applied at three levels:

```typescript
configs.middleware = [GlobalMiddleware()]          // global
forge({ middleware: [ClientMiddleware()], ... })   // per-client
resources: { User: { all: { middleware: [...] } } } // per-method
```

### Gateway Selection

Default gateway is `XHR` in browsers and `HTTP` in Node. Override globally or per-client:

```typescript
import { Fetch } from 'mappersmith/gateway'
configs.gateway = Fetch
```

## Key Conventions

### Code Style

- **No semicolons**, single quotes, 100-char line width (Prettier enforced).
- `strict: true` TypeScript — no unused locals/parameters (prefix with `_` to suppress).
- ESLint uses flat config (`eslint.config.mjs`); spec files have relaxed Jest-specific rules.

### File Organization

- Unit test specs live **colocated** with source: `client-builder.ts` ↔ `client-builder.spec.ts`.
- Browser-specific tests use the suffix `.web.spec.ts`.
- `spec/node/` mirrors the `src/` structure for Node-environment unit tests.
- `spec/integration/` contains Jasmine (Node) and Karma (browser) integration tests.

### Module Exports

- Each sub-path (`mappersmith/gateway`, `mappersmith/middleware/basic-auth`, etc.) has its own `package.json` export entry. When adding a new public module, update both `tsup.config.ts` entry points and `package.json` `exports`.
- The legacy `src/middlewares/` directory (note the **s**) contains deprecated re-exports for backwards compatibility — don't add new things there.

### Request / Response Immutability

Both `Request` and `Response` are immutable. Always use `.enhance({ ... })` to produce modified copies rather than mutating properties.

### Testing Utilities

Use `requestFactory` and `responseFactory` from `mappersmith/test` (or `src/test/`) to construct objects in unit tests instead of calling constructors directly:

```typescript
import { requestFactory, responseFactory } from 'mappersmith/test'
const req = requestFactory({ resourceName: 'User', resourceMethod: 'all', ... })
const res = responseFactory({ status: 200, data: '{"id":1}' })
```

### Dynamic Path Segments

Path segments use `{paramName}` syntax (e.g., `/users/{id}`). Parameters matching a segment name are consumed from the params object and not appended as query strings.

### `configs` Global Object

`configs` holds gateway, middleware stack, Promise implementation, and other defaults. Tests that modify `configs` must restore originals in `afterEach`/`afterAll`.
