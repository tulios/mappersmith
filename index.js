var Mapper = require('./src/mapper.js');

module.exports = {
  Request: require('./src/request'),
  VanillaRequest: require('./src/transport/vanillaRequest'),
  JQueryRequest: require('./src/transport/jqueryRequest'),
  forge: function(manifest, transport) {
    return new Mapper(manifest, transport).build();
  }
}
