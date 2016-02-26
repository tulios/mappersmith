# Changelog

## 0.13.1

  - bugfix: wrong content-type on vanilla gateway, a semicolon was missing on `charset=UTF-8`

## 0.13.0

  - Included status code for success calls
  - `withCredentials` option for `VanillaGateway` and `JQueryGateway`
  - Method to configure a global success handler per client
  - bugfix: rules matcher now uses full URL instead of descriptor path

## 0.12.1

  - Optional callback parameter when passing options to gateway. Check the section "Specifics of each gateway" for more info

## 0.12.0

  - Included request and response headers into stats object
  - Included a way to assign headers directly from method calls

## 0.11.0

  - Method to configure a global error handler per client
  - Included status code in the error request object

## 0.10.0

  - Bult-in fixture support
  - Holding error stack for better debugging

## 0.9.0

  - Allows Promise implementation to be configured, defaults to global Promise
  - Headers option for all gateways

## 0.8.1

  - bugfix: support for https in `NodeVanillaGateway`

## 0.8.0

  - Support for Promises
  - bugfix: made headers from options higher priority than built-in headers
  - Fail callback now receives the requested resource (url, host, path and params). This change breaks the API for fail callback, the original error objects will be available from the second argument and beyond

## 0.7.0

  - Included host and path into stats object

## 0.6.0

  - Improved package size
  - Included url and params into stats object
  - Support for alternative hosts for each resource method
  - Ability to disable host resolution

## 0.5.0

  - Measure of the time elapsed between the request and the callback invocation
  - Stats object for success callbacks

## 0.4.1

  - bugfix: VanillaGateway doesn't parse JSON responses

## 0.4.0

  - Support for Node vanilla gateway

## 0.3.0

  - Ability to configure default parameters for resources

## 0.2.1

  - bugfix: fixed typo

## 0.2.0

  - Support for emulateHTTP
  - Support for global configurations and per url match configurations
  - Support for POST, PUT, PATCH and DELETE methods
  - Exposed body value to gateway
  - Option to change the bodyAttr name
  - Processor functions for resources
  - Exposed request params to the gateway to allow o POST, PUT, etc
  - Compact syntax (syntatic sugar for GET methods)

## 0.1.1

  - bugfix: fixed reference of Mapper and VanillaGateway in index.js

## 0.1.0

  - Basic structure with Jquery and Vanilla gateways
  - Support for GET method
