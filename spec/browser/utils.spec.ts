import MockDate from 'mockdate'

import { performanceNow } from '../../src/utils'

describe('utils', () => {
  describe('#performanceNow', () => {
    it('returns the same value as "new Date().getTime()"', () => {
      MockDate.set('2017-08-08T20:57:00Z')
      expect(performanceNow()).toEqual(Date.now())
    })
  })
})
