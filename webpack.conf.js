const path = require('path')
const webpack = require('webpack')
const env = process.env.NODE_ENV || 'development'
let plugins = []

const devTool = (env === 'test')
  ? 'inline-source-map'
  : 'source-map'

if (env === 'production') {
  plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  ]
}

module.exports = {
  context: __dirname,
  resolve: {
    root: [
      path.join(__dirname, '/node_modules'),
      __dirname,
    ]
  },
  entry: 'index.js',
  output: {
    path: 'dist/',
    filename: 'mappersmith.js',
    sourceMapFilename: 'mappersmith.map',
    library: 'mappersmith',
    libraryTarget: 'umd'
  },
  target: 'web',
  node: {
    process: false
  },
  plugins: plugins,
  devtool: devTool,
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}
