import { m } from 'src/test'

describe('Test lib / match functions', () => {
  describe('#stringMatching', () => {
    it('returns true when it matches', () => {
      const fn = m.stringMatching(/^valid$/)
      expect(fn('random string')).toEqual(false)
      expect(fn('valid')).toEqual(true)
    })

    it('throws an exception if the argument is not a regexp', () => {
      expect(() => m.stringMatching({})).toThrowError(
        '[Mappersmith Test] "stringMatching" received an invalid regexp ([object Object])'
      )
    })
  })

  describe('#stringContaining', () => {
    it('returns true when it includes the substring', () => {
      const fn = m.stringContaining('valid')
      expect(fn('random string')).toEqual(false)
      expect(fn('somevalidstuff')).toEqual(true)
    })

    it('throws an exception if the argument is not a string', () => {
      expect(() => m.stringContaining({})).toThrowError(
        '[Mappersmith Test] "stringContaining" received an invalid string ([object Object])'
      )
    })
  })

  describe('#uuid4', () => {
    it('returns true when it is a valid uuid4', () => {
      expect(m.uuid4()('invalid uuid4')).toEqual(false)
      expect(m.uuid4()('00000000-1111-4222-8333-444444444444')).toEqual(true)
    })
  })

  describe('#anything', () => {
    it('always returns true', () => {
      expect(m.anything()()).toEqual(true)
    })
  })
})
