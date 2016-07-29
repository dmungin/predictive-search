// Karma configuration
// Generated on Tue Mar 08 2016 14:10:30 GMT-0500 (Eastern Standard Time)
var path = require('path');
var webpackConfig = require('../../webpack-local.config');
webpackConfig.entry = {};
webpackConfig.devtool = undefined;
webpackConfig.output.sourceMapFilename = undefined;
webpackConfig.module.preLoaders = [{
  test: /\.js$/,
  exclude: [/node_modules/, /test/],
  loader: 'istanbul-instrumenter'
}];
//console.log('alias: ');
//console.log(webpackConfig.resolve.alias);
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'sinon'],
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'kjhtml'],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    browsers: [],
    singleRun: false,
    autoWatchBatchDelay: 300,
    // list of files / patterns to load in the browser
    files: [
      '../../dist/js/bundle.*.js',
      '../../node_modules/angular-mocks/angular-mocks.js',
        './unit/**/*.spec.js'
    ],
    // list of files to exclude
    exclude: [],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    /*preprocessors: {
      '../app/rm53.module.js': ['webpack']
    },
    webpack: webpackConfig,*/
    webpackMiddleware: {
      noInfo: true
    },
    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : './coverage/'
    },
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};