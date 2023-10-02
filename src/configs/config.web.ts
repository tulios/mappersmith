export const FetchConfig = {
  /**
   * Indicates whether the user agent should send cookies from the other domain in the case of cross-origin
   * requests. This is similar to XHR’s withCredentials flag, but with three available values (instead of two):
   *
   * "omit": Never send cookies.
   * "same-origin": Only send cookies if the URL is on the same origin as the calling script.
   * "include": Always send cookies, even for cross-origin calls.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
   *
   * @default "omit"
   */
  credentials: 'omit',
}

export const fetchFn = typeof fetch === 'function' ? fetch : null
