policyStudio.factory('propertyManagerService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q', function ($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {

  var PAGE_SIZE = configService.configObject.policyStudio['defaultUserListPageSize'];

  var getProperties = function (searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, true);
    var cachedRequest = angular.copy(request);
    cachedRequest.name = searchCriteria.name;
    viewCacheService.cacheView("PS-PROPERTY-LIST", cachedRequest);
    request.criteria.pageNo = startPos / PAGE_SIZE;
    request.criteria.pageSize = PAGE_SIZE;
    networkService.post(configService.getUrl("tools.property.search"), request, function (data) {
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
    if (angular.isArray(searchCriteria.entityTypes) && searchCriteria.entityTypes.length > 0) fields.push(apiAssembleService.createMultiStringField('type', searchCriteria.entityTypes.map(function(e) {
      return e.name
    })))

    if (angular.isArray(searchCriteria.dataTypes) && searchCriteria.dataTypes.length > 0) fields.push(apiAssembleService.createMultiStringField('status', searchCriteria.dataTypes.map(function(e) {
      return e.name
    })))

    if (searchCriteria.text) {
      var field = apiAssembleService.createSingleStringField('title', searchCriteria.text);
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

  var getAllProperties = function(callback) {
    networkService.get(configService.getUrl("tools.property.all"), function(data) {
      callback(data);
    });
  };

  var saveProperty = function (property, callback) {
    networkService.post(configService.getUrl("tools.property.save"), property, function (data) {
      callback(data);
    });
  };

  var updateProperty = function (property, callback) {
    networkService.post(configService.getUrl("tools.property.update"), property, function (data) {
      callback(data);
    });
  };

  var deleteProperty = function (property, callback) {
    networkService.del(configService.getUrl("tools.property.delete"), property, function (data) {
      callback & callback(data);
    }, {
      contentType: 'application/json'
    });
  };

  var bulkDeleteProperty = function (delPropertyList, callback) {
    networkService.post(configService.getUrl("tools.property.bulkDelete"), delPropertyList, function (data) {
      callback(data);
    });
  }

  var retrieveSearchOption = function (callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("tools.property.fields"), function (data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("tools.property.savedlist") + '?pageNo=0&pageSize=65535', callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("tools.property.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };

  var saveSearch = function(searchCriteria, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, {
      includeOrder: false
    });
    request.name = searchCriteria.name;
    request.desc = searchCriteria.description;
    request.type = "PROPERTY";
    loggerService.getLogger().log(request);
    networkService.post(configService.getUrl("tools.property.savesearch"), request, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  };

  return {
    getProperties: getProperties,
    getAllProperties: getAllProperties,
    saveProperty: saveProperty,
    updateProperty: updateProperty,
    deleteProperty: deleteProperty,
    bulkDeleteProperty: bulkDeleteProperty,
    retrieveSearchOption: retrieveSearchOption,
    saveSearch: saveSearch,
    getSavedSearch: getSavedSearch,
    delSavedSearch: delSavedSearch
  }
}]);