policyStudio.factory('enrolledDataViewerService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q', function ($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {

  var PAGE_SIZE = configService.configObject.policyStudio['defaultUserListPageSize'];

  var getElement = function (id, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("enrolledData.findById") + id, function (data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  }

  var getEnrolledData = function (searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, true);
    var cachedRequest = angular.copy(request);
    cachedRequest.name = searchCriteria.name;
    viewCacheService.cacheView("PS-ENROLLED-DATA-LIST", cachedRequest);
    request.criteria.pageNo = startPos / PAGE_SIZE;
    request.criteria.pageSize = PAGE_SIZE;
    networkService.post(configService.getUrl("enrolledData.search"), request, function (data) {
      callback(data);
    });
  };

  var buildSearchCriteriaForAPI = function (searchCriteria, includeOrder) {
    var fields = [];
    var request = {
      criteria: {
        fields: fields
      }
    };
    if (angular.isArray(searchCriteria.types) && searchCriteria.types.length > 0) {
      fields.push(apiAssembleService.createMultiStringField('type', searchCriteria.types.map(function (e) {
        return e.name
      })));
    }

    if (angular.isArray(searchCriteria.enrollments) && searchCriteria.enrollments.length > 0) {
      fields.push(apiAssembleService.createMultiStringField('enrollment', searchCriteria.enrollments.map(function (e) {
        return e.name
      })));
    }

    if (searchCriteria.text) {
      var field = apiAssembleService.createSingleStringField('title', searchCriteria.text);
      fields.push(field);
    }

    if (searchCriteria.group) {
      var field = apiAssembleService.createSingleStringField('group', searchCriteria.group);
      fields.push(field);
    }

    if (includeOrder && searchCriteria.sortBy) {
      var field = {
        "field": searchCriteria.sortBy.name,
        "order": searchCriteria.sortBy.order
      };
      request.criteria.sortFields = [field];
    }
    return request;
  };

  var retrieveSearchOption = function (callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("enrolledData.search.fields"), function (data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var getSavedSearch = function (callback) {
    networkService.get(configService.getUrl("enrolledData.search.savedlist") + '?pageNo=0&pageSize=65535', callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function (search, callback) {
    networkService.del(configService.getUrl("enrolledData.search.remove") + search.id, null, function (data) {
      callback(data);
    });
  };

  var saveSearch = function (searchCriteria, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, {
      includeOrder: false
    });
    request.name = searchCriteria.name;
    request.desc = searchCriteria.description;
    request.type = "ENROLLED_DATA";
    loggerService.getLogger().log(request);
    networkService.post(configService.getUrl("enrolledData.search.add"), request, function (data) {
      callback && callback(data);
    });
  };

  return {
    getElement: getElement,
    getEnrolledData: getEnrolledData,
    retrieveSearchOption: retrieveSearchOption,
    saveSearch: saveSearch,
    getSavedSearch: getSavedSearch,
    delSavedSearch: delSavedSearch
  }
}]);