---
'mappersmith': minor
---

# Add support for abort signals

The [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) interface represents a signal object that allows you to communicate with an asynchronous operation (such as a fetch request) and abort it if required via an AbortController object. All gateway APIs (Fetch, HTTP and XHR) support this interface via the `signal` parameter:

```javascript
const abortController = new AbortController()
// Start a long running task...
client.Bitcoin.mine({ signal: abortController.signal })
// This takes too long, abort!
abortController.abort()
```

# Minor type fixes

The return value of some functions on `Request` have been updated to highlight that they might return undefined:

- `Request#body()`
- `Request#auth()`
- `Request#timeout()`

The reasoning behind this change is that if you didn't pass them (and no middleware set them) they might simply be undefined. So the types were simply wrong before. If you experience a "breaking change" due to this change, then it means you have a potential bug that you didn't properly handle before.
