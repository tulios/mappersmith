module.exports = {
  "presets": ["@babel/preset-env"],
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
