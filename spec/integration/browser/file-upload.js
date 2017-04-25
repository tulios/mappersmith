import { errorMessage } from 'spec/integration/support'
import apiResponses from 'spec/integration/support/responses'

const fileUploadSpec = (Client) => {
  it('accepts FormData', (done) => {
    const mockFile = new Blob(['XHJcbiN0ZXN0IGZpbGU='], { type: 'text/plain' }) // eslint-disable-line no-undef
    mockFile.lastModifiedDate = ''
    mockFile.name = 'myfile'

    const expectedFileOutputOnTheServer = '[{"fieldname":"myfile","originalname":"blob","encoding":"7bit","mimetype":"text/plain","buffer":{"type":"Buffer","data":[88,72,74,99,98,105,78,48,90,88,78,48,73,71,90,112,98,71,85,61]},"size":20}]'

    const formData = new FormData() // eslint-disable-line no-undef
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
}

export default fileUploadSpec
