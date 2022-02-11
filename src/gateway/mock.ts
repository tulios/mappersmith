import { Gateway } from '../gateway'
// @ts-expect-error Ignore the fact this file is not typed:
import { lookupResponseAsync } from '../test'

export class Mock extends Gateway {
  get() {
    this.callMock()
  }

  head() {
    this.callMock()
  }

  post() {
    this.callMock()
  }

  put() {
    this.callMock()
  }

  patch() {
    this.callMock()
  }

  delete() {
    this.callMock()
  }

  callMock() {
    return (
      lookupResponseAsync(this.request)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((response: any) => this.dispatchResponse(response))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((e: any) => this.dispatchClientError(e.message, e))
    )
  }
}

export default Mock
