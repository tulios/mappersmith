const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const packageJson = require('./package.json')
const env = process.env.NODE_ENV || 'development'
const version = packageJson.version
const link = packageJson.homepage

let plugins = [new webpack.DefinePlugin({ VERSION: JSON.stringify(version) })]

const devTool = env === 'test' ? 'inline-source-map' : 'source-map'

if (env === 'production') {
  plugins = plugins.concat([
    new webpack.BannerPlugin({
      banner: `/*!\n * Mappersmith ${version}\n * ${link}\n */`,
      raw: true,
      entryOnly: true,
    }),
  ])
}

module.exports = {
  mode: env === 'production' ? 'production' : 'development',
  context: __dirname,
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.join(__dirname, '/node_modules'), __dirname],
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'mappersmith.js',
    sourceMapFilename: 'mappersmith.map',
    library: 'mappersmith',
    libraryTarget: 'umd',
  },
  target: 'web',
  node: {
    process: false,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          warnings: false,
        },
      }),
    ],
  },
  plugins: plugins,
  devtool: devTool,
  module: {
    rules: [
      {
        test: /\.[j|t]s$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
}
