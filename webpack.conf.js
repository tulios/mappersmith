const path = require('path')
const webpack = require('webpack')
const packageJson = require('./package.json')
const env = process.env.NODE_ENV || 'development'
const version = packageJson.version
const link = packageJson.homepage

let plugins = [
  new webpack.DefinePlugin({ VERSION: JSON.stringify(version) })
]

const devTool = (env === 'test')
  ? 'inline-source-map'
  : 'source-map'

if (env === 'production') {
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      sourceMap: true
    }),
    new webpack.BannerPlugin({
      banner: `/*!\n * Mappersmith ${version}\n * ${link}\n */`,
      raw: true,
      entryOnly: true
    })
  ])
}

module.exports = {
  context: __dirname,
  resolve: {
    modules: [
      path.join(__dirname, '/node_modules'),
      __dirname
    ]
  },
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/'),
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
