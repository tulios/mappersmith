/*!
 * Mappersmith __VERSION__, Fixture support
 * https://github.com/tulios/mappersmith
 */
var Mappersmith = require('mappersmith');
var Fixture = require('./src/fixture');

if (Mappersmith) {
  Mappersmith.Env.USE_FIXTURES = true;
  Mappersmith.Env.Fixture = Fixture;
}

module.exports = Fixture;
