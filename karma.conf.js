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
      'spec/helper.js',
      {pattern: 'spec/*-spec.js', watched: false},
      {pattern: 'spec/**/*-spec.js', watched: false}
    ],

    preprocessors: {
      'spec/helper.js': ['webpack', 'sourcemap'],
      'spec/*-spec.js': ['webpack', 'sourcemap'],
      'spec/**/*-spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
