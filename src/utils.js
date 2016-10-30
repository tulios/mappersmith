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
  if (typeof entry !== 'object') {
    return entry
  }

  return validKeys(entry)
    .map((key) => buildRecursive(key, entry[key]))
    .join('&')
    .replace(R20, '+')
}
export function lowerCaseObjectKeys(obj) {
  return Object
    .keys(obj)
    .reduce((target, key) => {
      target[key.toLowerCase()] = obj[key]
      return target
    }, {})
}
