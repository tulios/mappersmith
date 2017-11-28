import forge, { configs } from 'src/mappersmith'
import { getManifest } from 'spec/helper'

describe('when global middleware is present', () => {
  it('adds it to each client manifest', () => {
    configs.middleware = ['global']

    const manifest = getManifest()
    const client1 = forge(Object.assign(manifest, { middleware: ['first'] }))
    const client2 = forge(Object.assign(manifest, { middleware: ['second'] }))

    expect(client1._manifest.middleware).toEqual(['first', 'global'])
    expect(client2._manifest.middleware).toEqual(['second', 'global'])
  })
})
