---
id: Manifest
title: Manifest
sidebar_label: Manifest
---

To create a client for your API you will need to provide a simple manifest. If your API reside in the same domain as your app you can skip the `host` configuration. Each resource has a name and a list of methods with its definitions, like:

```javascript
import forge from 'mappersmith'

const github = forge({
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {
    Status: {
      current: { path: '/api/status.json' },
      messages: { path: '/api/messages.json' },
      lastMessage: { path: '/api/last-message.json' }
    }
  }
})

github.Status.lastMessage().then(response => {
  console.log(`status: ${response.data()}`)
})
```
