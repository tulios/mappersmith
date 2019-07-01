import {
  performanceNow
} from 'src/utils'

describe('#performanceNow', () => {
  beforeEach(() => {
    jest.useRealTimers()
  })

  it('gives a positive time', () => {
    expect(performanceNow() > 0).toEqual(true)
  })

  it('two subsequent calls returns an increasing number', () => {
    // eslint-disable-next-line no-self-compare
    expect(performanceNow() < performanceNow()).toEqual(true)
  })

  it('has less than 10 microseconds overhead', () => {
    expect(Math.abs(performanceNow() - performanceNow()) < 0.010).toEqual(true)
  })

  it('shows that at least 990 ms has passed after a timeout of 1 second', (done) => {
    const a = performanceNow()
    setTimeout(() => {
      const diff = performanceNow() - a
      if (diff < 990) {
        return done.fail(`Diff (${diff}) lower than 990.`)
      }

      done()
    }, 1000)
  })

  it('shows that not more than 1020 ms has passed after a timeout of 1 second', (done) => {
    const a = performanceNow()
    setTimeout(() => {
      const diff = performanceNow() - a
      if (diff > 1020) {
        return done.fail(`Diff (${diff}) higher than 1020.`)
      }

      done()
    }, 1000)
  })
})
