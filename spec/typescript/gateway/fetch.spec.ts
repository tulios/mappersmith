import { configs, FetchGateway } from 'mappersmith'

configs.gateway = FetchGateway

configs.gatewayConfigs.Fetch = {
  credentials: 'same-origin',
}
