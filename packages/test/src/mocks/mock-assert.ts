import { Request } from '@mappersmith/core'

export class MockAssert {
  private _calls: Request[]
  constructor(calls: Request[]) {
    this._calls = calls
  }

  public calls = () => {
    return this._calls
  }

  public callsCount = () => {
    return this._calls.length
  }

  public mostRecentCall = () => {
    return this._calls[this._calls.length - 1] || null
  }
}

export default MockAssert
