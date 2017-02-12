if (typeof window !== 'undefined' && window !== null) {
  if (!window.performance) {
    window.performance = {}
  }
  performance.now = (() => {
    return performance.now       ||
           performance.mozNow    ||
           performance.msNow     ||
           performance.oNow      ||
           performance.webkitNow ||
           function() { return new Date().getTime() }
  })()
}

let _process, getNanoSeconds, loadTime;
try { _process = eval('process') } catch (e) {}

const hasProcessHrtime = () => {
  return (typeof _process !== 'undefined' && _process !== null) && _process.hrtime
}

if (hasProcessHrtime()) {
  getNanoSeconds = () => {
    const hr = _process.hrtime()
    return hr[0] * 1e9 + hr[1]
  }
  loadTime = getNanoSeconds()
}

const R20 = /%20/g

const validKeys = (entry) => Object
    .keys(entry)
    .filter((key) => entry[key] !== undefined && entry[key] !== null)

const buildRecursive = (key, value, suffix) => {
  suffix = suffix || '';
  const isArray = Array.isArray(value);
  const isObject = typeof value === 'object';

  if (!isArray && !isObject) {
    return `${encodeURIComponent(key + suffix)}=${encodeURIComponent(value)}`
  }

  if (isArray) {
    return value
      .map((v) => buildRecursive(key, v, suffix + '[]'))
      .join('&')
  }

  return validKeys(value)
    .map((k) => buildRecursive(key, value[k], suffix + '[' + k + ']'))
    .join('&')
}

export function toQueryString(entry) {
  if (!isPlainObject(entry)) {
    return entry
  }

  return validKeys(entry)
    .map((key) => buildRecursive(key, entry[key]))
    .join('&')
    .replace(R20, '+')
}

/**
 * Gives time in miliseconds, but with sub-milisecond precision for Browser
 * and Nodejs
 */
export function performanceNow() {
  if (hasProcessHrtime()) {
    return (getNanoSeconds() - loadTime) / 1e6;
  }

  return performance.now();
}

/**
 * borrowed from: {@link https://gist.github.com/monsur/706839}
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * {@link http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method}
 * This method parses that string into a user-friendly key/value pair object.
 */
export function parseResponseHeaders(headerStr) {
  const headers = {};
  if (!headerStr) {
    return headers
  }

  const headerPairs = headerStr.split('\u000d\u000a')
  for (let i = 0; i < headerPairs.length; i++) {
    const headerPair = headerPairs[i]
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    const index = headerPair.indexOf('\u003a\u0020')
    if (index > 0) {
      const key = headerPair.substring(0, index).toLowerCase()
      const val = headerPair.substring(index + 2).trim()
      headers[key] = val
    }
  }
  return headers
}

export function lowerCaseObjectKeys(obj) {
  return Object
    .keys(obj)
    .reduce((target, key) => {
      target[key.toLowerCase()] = obj[key]
      return target
    }, {})
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const assign = Object.assign || function(target) {
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i]
    for (let key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}

const toString = Object.prototype.toString
export function isPlainObject(value) {
  return toString.call(value) === '[object Object]' &&
    Object.getPrototypeOf(value) === Object.getPrototypeOf({})
}
