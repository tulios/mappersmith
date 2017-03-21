import 'babel-polyfill'
import 'whatwg-fetch'

import integrationTestsForGateway from 'spec/integration/shared-examples'
import createManifest from 'spec/integration/support/manifest'

import XHR from 'src/gateway/xhr'
import Fetch from 'src/gateway/fetch'
import forge, { configs } from 'src/index'

configs.fetch = window.fetch

import fileUploadSpec from './file-upload'

describe('integration', () => {
  describe('Fetch', () => {
    integrationTestsForGateway(Fetch, { host: '/proxy' }, (gateway, params) => {
      describe('file upload', () => {
        fileUploadSpec(forge(createManifest(params.host), gateway))
      })
    })
  })

  describe('XHR', () => {
    integrationTestsForGateway(XHR, { host: '/proxy' }, (gateway, params) => {
      describe('file upload', () => {
        fileUploadSpec(forge(createManifest(params.host), gateway))
      })
    })
  })
})
