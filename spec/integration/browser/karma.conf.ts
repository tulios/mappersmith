/* eslint-disable @typescript-eslint/no-var-requires */
import webpackConfig from '../../../webpack.conf'
import { executablePath } from 'puppeteer'
import * as karma from 'karma'

const conf = (config: karma.Config) => {
  process.env['CHROME_BIN'] = executablePath()
  const configuration: karma.ConfigOptions = {
    browsers: process.platform === 'win32' ? ['EdgeHeadless'] : ['ChromeHeadless'],
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

  ;(configuration as any).webpack = webpackConfig
  ;(configuration as any).webpackMiddleware = {
    stats: 'errors-only',
  }

  config.set(configuration)
}

export default conf
