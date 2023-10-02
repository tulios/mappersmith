import fetch from 'node-fetch'
import { configs } from '../src/configs'
global.__TEST_SERVICE_WORKER__ = true

configs.fetch = fetch
