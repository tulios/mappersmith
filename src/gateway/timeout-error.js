export const isTimeoutError = (e) => {
  return e && e.name === 'TimeoutError'
}

export const createTimeoutError = (message) => {
  const error = new Error(message)
  error.name = 'TimeoutError'
  return error
}
