import { toSortedQueryString, isSubset, sortedUrl } from './mock-utils'

describe('toSortedQueryString', () => {
  const expectedResult =
    'key11=value11&key12=value12&key13=value13&' +
    'key21=value21&key22=value22&' +
    'key231=value231&key232=value232&key233=value233&' +
    'key31=value31&key32=value32&key33=value33'

  it('deeply flattens and sorts all entries', () => {
    const key1 = {
      key11: 'value11',
      key13: 'value13',
      key12: 'value12',
    }
    const key2 = {
      key22: 'value22',
      key21: 'value21',
      key23: {
        key233: 'value233',
        key232: 'value232',
        key231: 'value231',
      },
    }
    const key3 = {
      key33: 'value33',
      key31: 'value31',
      key32: 'value32',
    }
    expect(toSortedQueryString({ key3, key2, key1 })).toEqual(expectedResult)
    expect(toSortedQueryString({ key1, key3, key2 })).toEqual(expectedResult)
    expect(toSortedQueryString({ key2, key1, key3 })).toEqual(expectedResult)
  })

  it('returns the original entry if it is not an object', () => {
    expect(toSortedQueryString('a string')).toEqual('a string')
    expect(toSortedQueryString(123)).toEqual(123)
  })
})

describe('isSubset', () => {
  const A = { a: 1, b: 2 }

  it('is true when A⊆B', () => {
    expect(isSubset(A, { ...A, c: 3 })).toBeTruthy()
  })

  it('is true when A=A', () => {
    expect(isSubset(A, A)).toBeTruthy()
  })

  it('is true when key casing differ (case insensitive)', () => {
    expect(isSubset(A, { ...A, B: 2 })).toBeTruthy()
  })

  it('is false when values differ', () => {
    expect(isSubset(A, { ...A, b: 3 })).toBeFalsy()
  })

  it('is false when A⊇B', () => {
    expect(isSubset(A, { a: 1 })).toBeFalsy()
  })
})

describe('sortedUrl', () => {
  it('sorts the url params', () => {
    expect(sortedUrl('/example?b=2&a=1')).toEqual('/example?a=1&b=2')
  })
})
