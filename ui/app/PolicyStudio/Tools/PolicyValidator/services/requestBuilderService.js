policyStudio.factory('requestBuilderService', [ 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q',
function(networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {
    var PAGE_SIZE = configService.configObject.policyStudio['defaultPolicyModelListPageSize'];
    var evaluateRequest = function(requestPayload, callback) {
        networkService.post(configService.getUrl("requestbuilder.evaluateRequest"), requestPayload, function(data) {
            callback && callback(data);
        });
    }

    var getEvalLogsById = function(logId, callback) {
      if (logId > 0) {
        var url = configService.getUrl("requestbuilder.getEvalLogById");
        url += (configService.configObject.isOnline) ? '/' + logId : '';
        networkService.get(url, callback , {
          forceCallback: true
        });
      }
    }
    return {
        evaluateRequest: evaluateRequest,
        getEvalLogsById : getEvalLogsById
    }
}]);
