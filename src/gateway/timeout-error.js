export default class TimeoutError extends Error {
  static isTimeoutError (e) {
    return e && e.name === 'TimeoutError'
  }

  constructor (message) {
    super()
    this.message = message
    this.name = 'TimeoutError'
  }
}
