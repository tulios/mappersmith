var Mapper = require('./src/mapper.js');

module.exports = {
  Utils: require('./src/utils'),
  Request: require('./src/request'),
  VanillaRequest: require('./src/transport/vanilla-request'),
  JQueryRequest: require('./src/transport/jquery-request'),
  forge: function(manifest, transport) {
    return new Mapper(manifest, transport).build();
  }
}
