const webpackConfig = require('./webpack.conf.js')

module.exports = function(config) {
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
      'spec/browser/index.js',
      {pattern: 'spec/browser/*-spec.js', watched: false},
      {pattern: 'spec/browser/**/*-spec.js', watched: false}
    ],

    preprocessors: {
      'spec/browser/index.js': ['webpack', 'sourcemap'],
      'spec/browser/*-spec.js': ['webpack', 'sourcemap'],
      'spec/browser/**/*-spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  })
}
