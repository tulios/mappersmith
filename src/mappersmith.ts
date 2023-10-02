import { ClientBuilder, Client } from './client-builder'
import { assign } from './utils/index'
import { configs } from './configs/index'
import type { ManifestOptions, ResourceTypeConstraint } from './manifest'
import type { Context } from './middleware/index'

/**
 * Can be used to test for `instanceof Response`
 */
export { Response } from './response'

export { version } from './version'

/**
 * @deprecated Shouldn't be used, not safe for concurrent use.
 * @param {Object} context
 */
export const setContext = (context: Context) => {
  console.warn(
    'The use of setContext is deprecated - you need to find another way to pass data between your middlewares.'
  )
  configs.context = assign(configs.context, context)
}

export default function forge<Resources extends ResourceTypeConstraint>(
  manifest: ManifestOptions<Resources>
): Client<Resources> {
  const GatewayClassFactory = () => configs.gateway
  return new ClientBuilder(manifest, GatewayClassFactory, configs).build()
}

export { forge }
