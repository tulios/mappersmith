/**
 * Migrate stuff from helper.js into this file
 */
import { Middleware } from '../src/middleware'
import { GatewayConfiguration } from '../src/gateway/types'

const resources = {
  User: {
    all: { path: '/users' },
    byId: { path: '/users/{id}' },
  },
  Blog: {
    post: { method: 'post', path: '/blogs' },
    addComment: { method: 'put', path: '/blogs/{id}/comment' },
  },
}

export const getManifest = (
  middleware: Middleware[] = [],
  gatewayConfigs?: Partial<GatewayConfiguration>,
  clientId?: string
) => ({
  clientId,
  host: 'http://example.org',
  gatewayConfigs,
  gateway: 'configs',
  middleware,
  resources,
})

export const getManifestWithResourceConf = (
  middleware = [],
  gatewayConfigs = undefined,
  clientId = undefined
) => ({
  clientId,
  host: 'http://example.org',
  bodyAttr: 'customAttr',
  gatewayConfigs,
  middleware,
  resources: {
    User: {
      all: { path: '/users' },
      byId: { path: '/users/{id}' },
    },
    Blog: {
      post: { method: 'post', path: '/blogs' },
      addComment: { method: 'put', path: '/blogs/{id}/comment' },
    },
  },
})
