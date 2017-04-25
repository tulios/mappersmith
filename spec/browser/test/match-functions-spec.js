import forge from 'src/index'
import MockAssert from 'src/test/mock-assert'
import EncodeJsonMiddleware from 'src/middlewares/encode-json'
import { getManifest, headerMiddleware } from 'spec/helper'

import {
  install as installMock,
  uninstall as uninstallMock,
  m
} from 'src/test'

describe('Test lib / match functions', () => {
  describe('#stringMatching', () => {
    it('returns true when it matches', () => {
      const fn = m.stringMatching(/^valid$/)
      expect(fn('random string')).toEqual(false)
      expect(fn('valid')).toEqual(true)
    })

    it('throws an exception if the argument is not a regexp', () => {
      expect(() => m.stringMatching({}))
        .toThrowError('[Mappersmith Test] "stringMatching" received an invalid regexp ([object Object])')
    })
  })

  describe('#stringContaining', () => {
    it('returns true when it includes the substring', () => {
      const fn = m.stringContaining('valid')
      expect(fn('random string')).toEqual(false)
      expect(fn('somevalidstuff')).toEqual(true)
    })

    it('throws an exception if the argument is not a string', () => {
      expect(() => m.stringContaining({}))
        .toThrowError('[Mappersmith Test] "stringContaining" received an invalid string ([object Object])')
    })
  })

  describe('#anything', () => {
    it('always returns true', () => {
      expect(m.anything()()).toEqual(true)
    })
  })
})
