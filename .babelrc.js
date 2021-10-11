module.exports = {
  "presets": ["@babel/preset-env", "@babel/preset-typescript"],
  "plugins": ["@babel/plugin-proposal-class-properties","@babel/proposal-object-rest-spread",
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
