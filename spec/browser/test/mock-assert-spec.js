import forge from 'src/index'
import { getManifest } from 'spec/helper'

import {
  install as installMock,
  uninstall as uninstallMock,
  mockClient
} from 'src/test'

describe('Test lib / mock assert', () => {
  let client, mock

  beforeEach(() => {
    installMock()
    client = forge(getManifest())
    mock = mockClient(client)
      .resource('User')
      .method('all')
      .response({ ok1: true })
      .assertObject()
  })

  afterEach(() => {
    uninstallMock()
  })

  it('keeps track of the number of calls', (done) => {
    expect(mock.callsCount()).toEqual(0)
    client.User.all()
      .then(() => expect(mock.callsCount()).toEqual(1))
      .then(() => client.User.all())
      .then(() => expect(mock.callsCount()).toEqual(2))
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })

  it('returns the most recent call', (done) => {
    expect(mock.mostRecentCall()).toEqual(null)
    client.User.all({ headers: { call: 1 } })
      .then((response) => expect(mock.mostRecentCall().headers()).toEqual(response.request().headers()))
      .then(() => client.User.all({ headers: { call: 2 } }))
      .then((response) => expect(mock.mostRecentCall().headers()).toEqual(response.request().headers()))
      .then(() => done())
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
      })
  })
})
