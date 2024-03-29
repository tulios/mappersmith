import webpack from 'webpack'
import path from 'path'
import packageJson from './package.json'

const env = process.env['NODE_ENV'] || 'development'
const version = packageJson.version
const link = packageJson.homepage

let plugins: webpack.WebpackPluginInstance[] = [
  new webpack.DefinePlugin({ VERSION: JSON.stringify(version) }),
]

const devTool = env === 'test' ? 'inline-source-map' : 'source-map'

if (env === 'production') {
  const bannerPlugin = new webpack.BannerPlugin({
    banner: `/*!\n * Mappersmith ${version}\n * ${link}\n */`,
    raw: true,
    entryOnly: true,
  })
  plugins = plugins.concat([bannerPlugin])
}

const config: webpack.Configuration = {
  mode: env === 'production' ? 'production' : 'development',
  context: __dirname,
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.join(__dirname, '/node_modules'), __dirname],
    fallback: {
      url: false,
      http: false,
      https: false,
    },
  },
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'mappersmith.js',
    sourceMapFilename: 'mappersmith.map',
    library: 'mappersmith',
    libraryTarget: 'umd',
  },
  target: 'web',
  // Tell Webpack not to provide a Node.js-like environment as we are compiling for the browser.
  node: false,
  plugins,
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

export default config
