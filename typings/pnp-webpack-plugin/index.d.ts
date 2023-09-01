/* eslint-disable import/no-unused-modules */
declare module 'pnp-webpack-plugin' {
  import webpack from 'webpack'

  export default class PnpWebpackPlugin implements webpack.WebpackPluginInstance {
    static moduleLoader(module: NodeModule): any
    apply(): void
  }
}
