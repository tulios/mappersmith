/* eslint-disable import/no-unused-modules */
declare module 'uglifyjs-webpack-plugin' {
  import webpack from 'webpack'

  export default class UglifyJsPlugin implements webpack.WebpackPluginInstance {
    constructor(options: any)
    apply(): void
  }
}
