import fetch from 'node-fetch'
import { configs } from '@mappersmith/core/src/mappersmith'
global.__TEST_SERVICE_WORKER__ = true

// This is needed, or the service worker specs will use whatwg-fetch (browser polyfill) for some reason
configs.fetch = fetch
