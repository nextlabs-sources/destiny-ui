policyStudio.factory('logConfigService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', '$q', 'viewCacheService',
    function ($http, networkService, configService, loggerService, apiAssembleService, $q, viewCacheService) {

        var getLogConfigs = function (searchCriteria, startPos, callback) {
            loggerService.getLogger().log(searchCriteria);
            if (searchCriteria && searchCriteria) {
                var request = buildSearchCriteriaForAPI(searchCriteria);
                var cachedRequest = angular.copy(request);
                cachedRequest.name = searchCriteria.name;
                viewCacheService.cacheView("PS-LOGCONFIG-LIST", cachedRequest);
                request.criteria.pageNo = startPos / configService.configObject.policyStudio['defaultLogConfigPageSize'];
                request.criteria.pageSize = (searchCriteria.criteria && searchCriteria.criteria.pageSize && searchCriteria.criteria.pageSize > 0) ?
                    searchCriteria.criteria.pageSize :
                    configService.configObject.policyStudio['defaultLogConfigPageSize'];
                networkService.post(configService.getUrl("logconfig.search"), request, function (data) {
                    callback(data);
                });
            }
        };

        var buildSearchCriteriaForAPI = function (searchCriteria) {
            var fields = [];
            var request = {
                criteria: {
                    fields: fields
                }
            };
            if (angular.isArray(searchCriteria.level) && searchCriteria.level.length > 0) {
                fields.push(apiAssembleService.createMultiStringField('level', searchCriteria.level.map(function (e) {
                    return e.name
                })));
            }

            if (searchCriteria.text) {
                var field = apiAssembleService.createSingleTextField(['NAME'], searchCriteria.text);
                fields.push(field);
            }

            return request;
        }

        var updateLogConfig = function (logConfig, callback) {
            networkService.post(configService.getUrl("logconfig.update"), logConfig, function (data) {
                callback && callback(data);
            });
        };

        var getLogConfigsAsXml = function (callback) {
            networkService.get(configService.getUrl("logconfig.config"), function (data) {
                callback(data);
            });
        };

        var saveLoggersAxXml = function (logConfig, callback) {
            networkService.post(configService.getUrl("logconfig.save"), logConfig, function (data) {
                callback && callback(data);
            });
        };

        return {
            getLogConfigs: getLogConfigs,
            updateLogConfig: updateLogConfig,
            getLogConfigsAsXml: getLogConfigsAsXml,
            saveLoggersAxXml: saveLoggersAxXml
        }
    }]);