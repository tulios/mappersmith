const webpackConfig = require('./webpack.conf.js')

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS2'],
    frameworks: ['jasmine'],
    reporters: ['spec'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-phantomjs2-launcher',
      'karma-spec-reporter'
    ],

    singleRun: process.env.SINGLE_RUN || false,

    files: [
      {pattern: 'spec/*_spec.js', watched: false},
      {pattern: 'spec/**/*_spec.js', watched: false}
    ],

    preprocessors: {
      'spec/*_spec.js': ['webpack', 'sourcemap'],
      'spec/**/*_spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
