policyStudio.factory('sysConfigService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', '$q', 'viewCacheService',
    function ($http, networkService, configService, loggerService, apiAssembleService, $q, viewCacheService) {

        var getSysConfigs = function (searchCriteria, startPos, callback) {
            loggerService.getLogger().log(searchCriteria);
            if (searchCriteria && searchCriteria) {
                var request = buildSearchCriteriaForAPI(searchCriteria, true);
                var cachedRequest = angular.copy(request);
                cachedRequest.name = searchCriteria.name;
                viewCacheService.cacheView("PS-SYSCONFIG-LIST", cachedRequest);
                request.criteria.pageNo = startPos / configService.configObject.policyStudio['defaultSysConfigPageSize'];
                request.criteria.pageSize = (searchCriteria.criteria && searchCriteria.criteria.pageSize && searchCriteria.criteria.pageSize > 0) ?
                    searchCriteria.criteria.pageSize :
                    configService.configObject.policyStudio['defaultSysConfigPageSize'];
                networkService.post(configService.getUrl("sysconfiglist.search"), request, function (data) {
                    callback(data);
                });
            }
        };
        var getSysConfigsByMainGroup = function (mainGroup, includeAdvanced, callback) {
            loggerService.getLogger().log('fetch system config for : ' + mainGroup);
            if (mainGroup) {
                networkService.get(configService.getUrl("sysconfig.get.byMainGroups") + '?mainGroup=' + mainGroup + '&includeAdvanced=' + includeAdvanced, function (data) {
                    // logGerservice.Getlogger().log(data);
                    callback && callback(data);
                });
            }
        }

        var buildSearchCriteriaForAPI = function (searchCriteria, includeOrder) {
            var fields = [];
            var request = {
                criteria: {
                    fields: fields
                }
            };
            if (angular.isArray(searchCriteria.group) && searchCriteria.group.length > 0) fields.push(apiAssembleService.createMultiStringField('mainGroup', searchCriteria.group.map(function (e) {
                return e.name
            })))

            if (searchCriteria.text) {
                var field = apiAssembleService.createSingleTextField(['mainGroup','configKey','subGroup','description'], searchCriteria.text);
                fields.push(field);
            }

            fields.push(apiAssembleService.createSingleStringField('advanced', searchCriteria.includeAdvanced));

            if (includeOrder && searchCriteria.sortBy) {
                var field = {
                    "field": searchCriteria.sortBy.name,
                    "order": searchCriteria.sortBy.order
                };
                request.criteria.sortFields = [field];
            }
            return request;
        }

        var retrieveSearchOption = function (callback) {
            var deferred = $q.defer();
            networkService.get(configService.getUrl("sysconfigsearch.fields"), function (data) {
                callback(data);
                deferred.resolve();
            });
            return deferred.promise;
        };

        var updateSysConfig = function (sysConfig, callback) {
            networkService.post(configService.getUrl("sysconfig.update"), sysConfig, function (data) {
                callback && callback(data);
            });
        };

        return {
            getSysConfigs: getSysConfigs,
            getSysConfigsByMainGroup: getSysConfigsByMainGroup,
            retrieveSearchOption: retrieveSearchOption,
            updateSysConfig: updateSysConfig
        }
    }]);