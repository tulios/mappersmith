import FetchGateway from 'mappersmith/gateway/fetch'
import { configs } from 'mappersmith'

configs.gateway = FetchGateway

configs.gatewayConfigs.Fetch = {
  credentials: 'same-origin',
}
