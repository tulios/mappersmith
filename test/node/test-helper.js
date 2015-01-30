var chai = require('chai');

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.sinon = require('sinon');
global.shared = require('shared-examples-for');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));
