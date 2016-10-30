import { toQueryString } from 'src/utils'

describe('#toQueryString', () => {
    describe('for non-object', () => {
      it('returns the original entry', () => {
        expect(toQueryString(1)).toEqual(1)
        expect(toQueryString(1.1)).toEqual(1.1)
        expect(toQueryString('value')).toEqual('value')
      })
    })

    describe('for objects', () => {
      it('ignores undefined or null values', () => {
        expect(toQueryString({a: 1, b: undefined, c: null})).toEqual('a=1')
      })

      it('appends & for multiple values', () => {
        expect(toQueryString({a: 1, b: 'val', c: true})).toEqual('a=1&b=val&c=true')
      })

      it('encodes "%20" to "+"', () => {
        const params = {a: 'some big string'}
        expect(toQueryString(params)).toEqual('a=some+big+string')
      })

      describe('in blank', () => {
        it('returns an empty string', () => {
          expect(toQueryString({})).toEqual('')
        })
      })

      describe('with object values', () => {
        it('converts the keys to "key[another-key]" pattern', () => {
          const params = decodeURIComponent(toQueryString({a: {b: 1, c: 2}}))
          expect(params).toEqual('a[b]=1&a[c]=2')
        })

        it('works with nested objects', () => {
          const params = decodeURIComponent(toQueryString({a: {b: 1, c: {d: 2}}, e: 3}))
          expect(params).toEqual('a[b]=1&a[c][d]=2&e=3')
        })
      })

      describe('with array values', () => {
        it('converts the keys to "key[]" pattern', () => {
          const params = decodeURIComponent(toQueryString({a: [1, 2, 3]}))
          expect(params).toEqual('a[]=1&a[]=2&a[]=3')
        })

        it('works with nested arrays', () => {
          const params = decodeURIComponent(toQueryString({a: [1, [2, [3, 4]]]}))
          expect(params).toEqual('a[]=1&a[][]=2&a[][][]=3&a[][][]=4')
        })
      })
    })
  })
