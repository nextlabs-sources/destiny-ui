/*
	This is a shared service for app level logging
*/
controlCenterConsoleApp.factory('loggerService', ['configService', function(configService) {
  var _console = null;
  var getLogger = function() {
    if (!_console) {
      var _tempConsole = {
        log: function() {
          // window.loggerService.getLogger().log('do nothing');
        }
      }
      _console = (configService.configObject && (configService.configObject['logLevel'] <= 1)) ? window.console : _tempConsole;
    }
    // add check for log level
    // window.loggerService.getLogger().log(configService.configObject);
    return _console;
  }
  return {
    getLogger: getLogger
  }
}]);