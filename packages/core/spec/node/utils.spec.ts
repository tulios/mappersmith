import { performanceNow } from '../../src/utils'

describe('#performanceNow', () => {
  beforeEach(() => {
    jest.useRealTimers()
  })

  it('gives a positive time', () => {
    expect(performanceNow() > 0).toEqual(true)
  })

  it('two subsequent calls returns an increasing number', () => {
    const t1 = performanceNow()
    const t2 = performanceNow()
    expect(t1 < t2).toEqual(true)
  })

  // flaky on ci
  it.skip('has less than 10 microseconds overhead', () => {
    expect(Math.abs(performanceNow() - performanceNow()) < 0.01).toEqual(true)
  })

  // flaky on ci
  it.skip('shows that at least 990 ms has passed after a timeout of 1 second', () => {
    const a = performanceNow()
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const diff = performanceNow() - a
        if (diff < 990) {
          return reject(new Error(`Diff (${diff}) lower than 990.`))
        }
        resolve()
      }, 1000)
    })
  })

  // flaky on ci
  it.skip('shows that not more than 1020 ms has passed after a timeout of 1 second', () => {
    const a = performanceNow()
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const diff = performanceNow() - a
        if (diff > 1020) {
          return reject(new Error(`Diff (${diff}) higher than 1020.`))
        }
        resolve()
      }, 1000)
    })
  })
})
