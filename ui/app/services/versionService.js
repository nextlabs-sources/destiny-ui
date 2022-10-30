controlCenterConsoleApp.factory('versionService', ['$q', 'networkService', 'configService', function($q, networkService, configService) {
    var installModeValue = null;
    var getVersion = function(callback) {
        networkService.get(configService.getUrl("system.version"), callback);
    }
    var installMode = function(callback) {
        // return callback({data:'OPN'})
        if(installModeValue) callback(installModeValue);
        else networkService.get(configService.getUrl("system.installMode"), function(response) {
            installModeValue = response;
            callback(response);
        });
    }
    var importSamplePolicies = function() {
      var deferred = $q.defer();
        networkService.get(configService.getUrl("help.importSamplePolicies"), function(data) {
          deferred.resolve(data);
        }, {
            forceCallback: true
        });
      return deferred.promise;
    }
    return {
        getVersion: getVersion,
        installMode: installMode,
        importSamplePolicies: importSamplePolicies
    }
}]);