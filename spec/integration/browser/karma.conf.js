const webpackConfig = require('../../../webpack.conf.js')

module.exports = function (config) {
  process.env.CHROME_BIN = require('puppeteer').executablePath()

  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['jasmine'],
    reporters: ['spec'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      'karma-spec-reporter'
    ],

    singleRun: process.env.SINGLE_RUN || false,

    files: [
      {pattern: '*.spec.js', watched: false}
    ],

    preprocessors: {
      '*.spec.js': ['webpack', 'sourcemap']
    },

    proxies: {
      '/proxy': 'http://localhost:9090'
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  })
}
