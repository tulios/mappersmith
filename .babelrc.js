module.exports = {
  "presets": ["es2015"],
  "plugins": [
    ["minify-replace", {
      "replacements": [{
        "identifierName": "VERSION",
        "replacement": {
          "type": "stringLiteral",
          "value": require('./package.json').version
        }
      }]
    }]
  ]
}
