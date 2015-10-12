module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha', 'chai', 'sinon', 'sinon-chai'],

    plugins: [
      'karma-browserify',
      'karma-firefox-launcher',
      'karma-phantomjs2-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-sinon',
      'karma-sinon-chai'
    ],

    // list of files / patterns to load in the browser
    files: [
      'index.js',
      'test/*.js'
    ],

    browserify: {
      debug: true,
      transform: ['rewireify', 'aliasify']
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'index.js': ['browserify'],
      'test/*.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [process.env.BROWSER || 'PhantomJS2'], //'Firefox', 'Chrome'],
    browserNoActivityTimeout: 30000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: process.env.SINGLE_RUN || false
  });
}
