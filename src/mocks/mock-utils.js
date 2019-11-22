import { isPlainObject, validKeys, buildRecursive } from '../utils'

export function toSortedQueryString (entry) {
  if (!isPlainObject(entry)) {
    return entry
  }

  return validKeys(entry)
    .sort()
    .map((key) => buildRecursive(key, entry[key]))
    .join('&')
    .replace(/%20/g, '+')
}

function filterObject (callback, entry) {
  return Object.entries(entry)
    .filter(([key]) => callback(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export function isSuperset (reference, entry) {
  const filteredEntry = filterObject(key => validKeys(entry).includes(key), entry)

  return toSortedQueryString(reference) === toSortedQueryString(filteredEntry)
}

/**
 * Sort the query params on a URL based on the 'key=value' string value.
 * E.g. /example?b=2&a=1 will become /example?a=1&b=2
 *
 * @param {String} url - a URL that should be sorted (with or without query params)
 */
export function sortedUrl (url) {
  const urlParts = url.split('?')
  if (urlParts.length > 1) {
    const query = urlParts[1]
    const sortedQuery = query.split('&').sort().join('&')
    return `${urlParts[0]}?${sortedQuery}`
  } else {
    return urlParts[0]
  }
}
