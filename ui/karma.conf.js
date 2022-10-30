// Karma configuration
// Generated on Thu Jan 14 2016 20:48:38 GMT+0800 (Malay Peninsula Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'config/config.js',
      'config/*.js',
      'lib/jquery/1.8.2/jquery.js',
      'lib/angular/1.4.7/angular.min.js',
      'lib/angular/1.4.7/angular-sanitize.min.js',
      'lib/angular/1.4.7/angular-animate.js',
      'lib/angular/1.4.7/angular-messages.min.js',
      'lib/angular-ui-router/0.2.15/angular-ui-router.min.js',
      'lib/angular-ui/bootstrap/ui-bootstrap-tpls-0.14.3.min.js',
      'lib/angular-ui-switch/angular-ui-switch.min.js',
      'lib/angular-translate/2.8.1/angular-translate.min.js',
      'lib/angular-translate/angular-translate-loader-static-files.min.js',
      'lib/angular-ui-uploader/dist/uploader.min.js',
      'testlib/angular-mocks/angular-mocks.js',
      'app/*.js',
      'app/PolicyStudio/*.js',
      // 'ui/app/PolicyStudio/Policy/*.js',
      // 'ui/app/PolicyStudio/Policy/services/*.js',
      // 'ui/app/PolicyStudio/Component/*.js',
      // 'ui/app/PolicyStudio/Component/services/*.js',
      'app/PolicyStudio/**/*.js',
      // 'test/spec_help.js',
      'test/**/*.js'
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},


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
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}