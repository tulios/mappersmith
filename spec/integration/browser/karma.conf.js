const webpackConfig = require('../../../webpack.conf.js')

module.exports = function (config) {
  process.env.CHROME_BIN = require('puppeteer').executablePath()

  config.set({
    browsers: process.platform === 'win32' ? ['IE'] : ['ChromeHeadless'],
    frameworks: ['jasmine', 'karma-typescript'],
    reporters: ['spec', 'karma-typescript'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-typescript',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      'karma-ie-launcher',
      'karma-spec-reporter'
    ],

    singleRun: process.env.SINGLE_RUN || false,

    files: [
      { pattern: '../../../src/**/*.ts', watched: false },
      { pattern: '*.spec.js', watched: false }
    ],

    preprocessors: {
      '*.spec.js': ['webpack', 'sourcemap'],
      '../../../src/**/*.ts': ['karma-typescript']
    },

    proxies: {
      '/proxy': 'http://localhost:9090'
    },

    karmaTypescriptConfig: {
      bundlerOptions: {
        sourceMap: true
      },
      coverageOptions: {
        // Set this to false while debugging
        instrumentation: true
      },
      tsconfig: '../../../tsconfig.json',
      compilerOptions: {
        module: 'commonjs'
      }
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  })
}
