import { isSubset } from '../../../../test/src/index'

describe('Test lib / mock utils', () => {
  describe('#isSubset', () => {
    it('is true when the B has all keys from A (and the same values)', () => {
      const A = {
        a: 1,
        b: 2,
      }

      const B = {
        ...A,
        c: 3,
      }

      expect(isSubset(A, B)).toBe(true)
    })

    it('is false if B is missing any keys from A', () => {
      const A = {
        a: 1,
        b: 2,
      }

      const B = {
        a: 1,
        c: 3,
      }

      expect(isSubset(A, B)).toBe(false)
    })

    it('is false when the B has all keys from A (but not the same values)', () => {
      const A = {
        a: 1,
        b: 2,
      }

      const B = {
        ...A,
        b: 3,
      }

      expect(isSubset(A, B)).toBe(false)
    })

    it('ignores nullish keys in the reference', () => {
      const A = {
        a: 1,
        b: undefined,
        c: null,
      }

      const B = {
        a: 1,
        c: 3,
      }

      expect(isSubset(A, B)).toBe(true)
    })

    it('is shallow', () => {
      const A = {
        a: 1,
        b: {
          c: 'I am nested',
        },
      }

      const B = {
        a: 1,
        b: {
          c: 'I am nested',
          d: 'me too',
        },
      }

      expect(isSubset(A, B)).toBe(false)
    })
  })
})
