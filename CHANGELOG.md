# Changelog

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
