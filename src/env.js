module.exports = {
  USE_FIXTURES: false,
  USE_PROMISES: false,
  Fixture: null,
  Promise: typeof Promise === 'function' ? Promise : null
}
