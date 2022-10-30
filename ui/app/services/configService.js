/*
	This is a shared service for app level config settings
*/
controlCenterConsoleApp.factory('configService', ['networkService', '$q', function(networkService, $q) {
  this.configObject = {};
  this.uiConfigs = [];
  var setConfig = function(obj) {
    this.configObject = obj;
    if(!obj.isOnline){
      networkService.onlyGet(true);
    }
  }
  var getUrl = function(key, app) {
    !app && (app = 'policyStudio');
    var urlConfig = this.configObject.isOnline ? this.configObject[app].url['online'] : this.configObject[app].url['offline'];
    return urlConfig.baseUrl + urlConfig.map[key];
  }
  var getUIConfigs = function () {
    var deferred = $q.defer();
    if (this.uiConfigs == null || this.uiConfigs.length == 0) {
      networkService.get(this.getUrl("sysconfig.getUIConfigs"), function (data) {
        deferred.resolve(data);
      }, {
        forceCallback: true
      });
    } else {
      deferred.resolve(this.uiConfigs);
    }
    return deferred.promise;
  };
  return {
    configObject: this.configObject,
    setConfig: setConfig,
    getUrl: getUrl,
    getUIConfigs : getUIConfigs
  }
}]);