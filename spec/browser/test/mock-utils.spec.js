import { isSuperset } from 'src/mocks/mock-utils'

describe('Test lib / mock utils', () => {
  describe('#isSuperset', () => {
    it('is true when the second parameter has all keys from the first', () => {
      const reference = {
        a: 1,
        b: 2
      }

      const entry = {
        ...reference,
        c: 3
      }

      expect(isSuperset(reference, entry)).toBe(true)
    })

    it('is false if the second parameter is missing any keys from the first', () => {
      const reference = {
        a: 1,
        b: 2
      }

      const entry = {
        a: 1,
        c: 3
      }

      expect(isSuperset(reference, entry)).toBe(false)
    })

    it('is false when keys are present, but values differ', () => {
      const reference = {
        a: 1,
        b: 2
      }

      const entry = {
        a: 1,
        b: 3
      }

      expect(isSuperset(reference, entry)).toBe(false)
    })

    it('ignores nullish keys in the reference', () => {
      const reference = {
        a: 1,
        b: undefined,
        c: null
      }

      const entry = {
        a: 1,
        c: 3
      }

      expect(isSuperset(reference, entry)).toBe(true)
    })

    it('is shallow', () => {
      const reference = {
        a: 1,
        b: {
          c: 'I am nested',
          d: 'me too'
        }
      }

      const entry = {
        a: 1,
        b: {
          c: 'I am nested'
        }
      }

      expect(isSuperset(reference, entry)).toBe(false)
    })
  })
})
