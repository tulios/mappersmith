import {
  toQueryString,
  parseResponseHeaders,
  lowerCaseObjectKeys,
  performanceNow,
  isPlainObject
} from 'src/utils'

describe('utils', () => {
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

  describe('#parseResponseHeaders', () => {
    let responseHeaders;

    beforeEach(() => {
      responseHeaders = 'X-RateLimit-Remaining: 57\
  \r\nLast-Modified: Mon, 09 Nov 2015 19:06:15 GMT\
  \r\nETag: W/"679e71e24e6d901f5b36a55c5d80a32d"\
  \r\nContent-Type: application/json; charset=utf-8\
  \r\nCache-Control: public, max-age=60, s-maxage=60\
  \r\nX-RateLimit-Reset: 1447102379\
  \r\nX-RateLimit-Limit: 60\
  '
    })

    it('returns an object with all headers with lowercase keys', () => {
      const headers = parseResponseHeaders(responseHeaders)
      expect(headers).toEqual(jasmine.objectContaining({'x-ratelimit-remaining': '57'}))
      expect(headers).toEqual(jasmine.objectContaining({'last-modified': 'Mon, 09 Nov 2015 19:06:15 GMT'}))
      expect(headers).toEqual(jasmine.objectContaining({'etag': 'W/"679e71e24e6d901f5b36a55c5d80a32d"'}))
      expect(headers).toEqual(jasmine.objectContaining({'content-type': 'application/json; charset=utf-8'}))
      expect(headers).toEqual(jasmine.objectContaining({'cache-control': 'public, max-age=60, s-maxage=60'}))
      expect(headers).toEqual(jasmine.objectContaining({'x-ratelimit-reset': '1447102379'}))
      expect(headers).toEqual(jasmine.objectContaining({'x-ratelimit-limit': '60'}))
    })
  })

  describe('#lowerCaseObjectKeys', () => {
    it('returns a new object with all keys in lowercase', () => {
      const obj = { ABC: 1, DeF: 2, ghI: 3}
      expect(lowerCaseObjectKeys(obj)).toEqual({ abc: 1, def: 2, ghi: 3})
      expect(obj.ABC).toEqual(1)
    })
  })

  describe('#performanceNow', () => {
    it('returns the same value as "performance.now()"', () => {
      spyOn(performance, 'now').and.returnValue(999)
      expect(performanceNow()).toEqual(999)
    })
  })

  describe('#isPlainObject', () => {
    it('returns true for plain objects', () => {
      function Custom() {}
      expect(isPlainObject(new Custom())).toEqual(false)
      expect(isPlainObject({ plain: true })).toEqual(true)
    })
  })
})
