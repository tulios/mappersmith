import productionWebpackConfig from '../../../webpack.conf'
import { executablePath } from 'puppeteer'
import * as karma from 'karma'
import path from 'path'
import webpack from 'webpack'

const webpackConfig: webpack.Configuration = {
  ...productionWebpackConfig,
  output: {
    path: path.resolve(__dirname, '../../../tmp/'),
  },
}

const conf = (config: karma.Config) => {
  process.env['CHROME_BIN'] = executablePath()
  const configuration: karma.ConfigOptions = {
    browsers: process.platform === 'win32' ? ['EdgeHeadless'] : ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    frameworks: ['jasmine', 'webpack'],
    reporters: ['spec'],
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      '@chiragrupani/karma-chromium-edge-launcher',
      'karma-spec-reporter',
    ],

    singleRun: true,

    files: [{ pattern: '*.spec.js', watched: false }],

    preprocessors: {
      '*.spec.js': ['webpack', 'sourcemap'],
    },

    proxies: {
      '/proxy': 'http://localhost:9090',
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(configuration as any).webpack = webpackConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(configuration as any).webpackMiddleware = {
    stats: 'errors-only',
  }

  config.set(configuration)
}

export default conf
