module.exports = {
  USE_PROMISES: false,
  Promise: typeof Promise === 'function' ? Promise : null
}
