import 'babel-polyfill'
import integrationTestsForGateway from 'spec/integration/shared-examples'
import createManifest from 'spec/integration/manifest'
import apiResponses from 'spec/integration/responses'

import XHR from 'src/gateway/xhr'
import forge from 'src/index'

describe('integration', () => {
  describe('XHR', () => {
    integrationTestsForGateway(XHR, { host: '/proxy' }, (gateway, params) => {

      describe('file upload', () => {
        let Client

        beforeEach(() => {
          Client = forge(createManifest(params.host), gateway)
        })

        it('accepts FormData', (done) => {
          const mockFile = new Blob(['XHJcbiN0ZXN0IGZpbGU='], { type: 'text/plain' })
          mockFile.lastModifiedDate = ''
          mockFile.name = 'myfile'

          const expectedFileOutputOnTheServer = '[{"fieldname":"myfile","originalname":"blob","encoding":"7bit","mimetype":"text/plain","buffer":{"type":"Buffer","data":[88,72,74,99,98,105,78,48,90,88,78,48,73,71,90,112,98,71,85,61]},"size":20}]'

          const formData = new FormData()
          formData.append('myfile', mockFile)

          Client.Pictures.upload({ body: formData }).then((response) => {
            expect(response.headers()).toEqual(jasmine.objectContaining({
              'x-api-response': 'apiPicturesUpload',
              'x-api-files': expectedFileOutputOnTheServer
            }))
            expect(response.headers()['x-api-content-type']).toMatch(/^multipart\/form-data; boundary=/)
            expect(response.data()).toEqual(apiResponses.apiPicturesUpload)
            done()
          })
          .catch((response) => {
            done.fail(`test failed with promise error: ${errorMessage(response)}`)
          })
        })
      })

    })
  })
})
