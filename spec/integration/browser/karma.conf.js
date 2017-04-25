const webpackConfig = require('../../../webpack.conf.js')

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    reporters: ['spec'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-phantomjs-launcher',
      'karma-spec-reporter'
    ],

    singleRun: process.env.SINGLE_RUN || false,

    files: [
      {pattern: '*-spec.js', watched: false}
    ],

    preprocessors: {
      '*-spec.js': ['webpack', 'sourcemap']
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
