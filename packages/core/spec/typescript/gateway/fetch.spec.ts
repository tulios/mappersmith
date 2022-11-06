import { configs } from '../../../src/mappersmith'
import { Fetch } from '../../../src/gateway/fetch'

configs.gateway = Fetch

configs.gatewayConfigs.Fetch = {
  credentials: 'same-origin',
}
