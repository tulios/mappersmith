---
id: Gateways
title: Gateways
sidebar_label: Gateways
---

Mappersmith has a pluggable transport layer and it includes by default three gateways: xhr, http and fetch. Mappersmith will pick the correct gateway based on the environment you are running (nodejs or the browser).

You can write your own gateway, take a look at [XHR](https://github.com/tulios/mappersmith/blob/master/src/gateway/xhr.js) for an example. To configure, import the `configs` object and assign the gateway option, like:

```javascript
import { configs } from 'mappersmith'
configs.gateway = MyGateway
```

It's possible to globally configure your gateway through the option `gatewayConfigs`.

### HTTP

When running with node.js you can configure the `configure` callback to further customize the `http/https` module, example:

```javascript
import fs from 'fs'
import https from 'https'
import { configs } from 'mappersmith'

const key = fs.readFileSync('/path/to/my-key.pem')
const cert = fs.readFileSync('/path/to/my-cert.pem')

configs.gatewayConfigs.HTTP = {
  configure() {
    return {
      agent: new https.Agent({ key, cert })
    }
  }
}
```

The new configurations will be merged. `configure` also receives the `requestParams` as the first argument. Take a look [here](https://github.com/tulios/mappersmith/blob/master/src/mappersmith.js) for more options.

The HTTP gatewayConfigs also provides several callback functions that will be called when various events are emitted on the `request`, `socket`, and `response` EventEmitters. These callbacks can be used as a hook into the event cycle to execute any custom code.
For example, you may want to time how long each stage of the request or response takes.
These callback functions will receive the `requestParams` as the first argument.

The following callbacks are supported:

- `onRequestWillStart` - This callback is not based on a event emitted by Node but is called just before the `request` method is called.
- `onRequestSocketAssigned` - Called when the 'socket' event is emitted on the `request`
- `onSocketLookup` - Called when the `lookup` event is emitted on the `socket`
- `onSocketConnect` - Called when the `connect` event is emitted on the `socket`
- `onSocketSecureConnect` - Called when the `secureConnect` event is emitted on the `socket`
- `onResponseReadable` - Called when the `readable` event is emitted on the `response`
- `onResponseEnd` - Called when the `end` event is emitted on the `response`

```javascript
let startTime

configs.gatewayConfigs.HTTP = {
  onRequestWillStart() {
    startTime = Date.now()
  }
  onResponseReadable() {
    console.log('Time to first byte', Date.now() - startTime)
  }
}
```

### XHR

When running in the browser you can configure `withCredentials` and `configure` to further customize the `XMLHttpRequest` object, example:

```javascript
import { configs } from 'mappersmith'
configs.gatewayConfigs.XHR = {
  withCredentials: true,
  configure(xhr) {
    xhr.ontimeout = () => console.error('timeout!')
  }
}
```

Take a look [here](https://github.com/tulios/mappersmith/blob/master/src/mappersmith.js) for more options.

### Fetch

**Mappersmith** does not apply any polyfills, it depends on a native `fetch` implementation to be supported. It is possible assign the fetch implementation used by Mappersmith:

```javascript
import { configs } from 'mappersmith'
configs.fetch = fetchFunction
```

Fetch is not used by default, you can configure it through `configs.gateway`.

```javascript
import FetchGateway from 'mappersmith/gateway/fetch'
import { configs } from 'mappersmith'

configs.gateway = FetchGateway

// Extra configurations, if needed
configs.gatewayConfigs.Fetch = {
  credentials: 'same-origin'
}
```

Take a look [here](https://github.com/tulios/mappersmith/blob/master/src/mappersmith.js) for more options.
