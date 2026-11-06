// eslint-disable-next-line @typescript-eslint/no-require-imports
const fauxJaxMethods: string[] = require('faux-jax-tulios/lib/XMLHttpRequest/methods')

global.__TEST_WEB__ = true

// faux-jax rejects any method outside its hardcoded allowlist, which predates QUERY
if (!fauxJaxMethods.includes('QUERY')) {
  fauxJaxMethods.push('QUERY')
}
