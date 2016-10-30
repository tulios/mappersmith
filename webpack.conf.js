const path = require('path')

module.exports = {
  context: __dirname,
  resolve: {
    root: [
      path.join(__dirname, '/node_modules'),
      __dirname,
    ]
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  devtool: 'inline-source-map'
}
