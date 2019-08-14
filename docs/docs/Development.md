---
id: Development
title: Development
sidebar_label: Development
---

### Running unit tests:

```sh
yarn test:browser
yarn test:node
```

### Running integration tests:

```sh
yarn integration-server &
yarn test:browser:integration
yarn test:node:integration
```

### Running all tests

```sh
yarn test
```

## Compile and release

```sh
NODE_ENV=production yarn build
```
