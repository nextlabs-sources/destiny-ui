policyStudio.factory('resourceService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', '$filter', 'viewCacheService', '$q', function($http, networkService, configService, loggerService, apiAssembleService, $filter, viewCacheService, $q) {
  var PAGE_SIZE = configService.configObject.policyStudio['defaultPolicyModelListPageSize'];
  var getResourceById = function(resourceId, callback) {
    var deferred = $q.defer();
    loggerService.getLogger().log('fetch resource by id: ' + resourceId);
    if (resourceId) {
      var url = configService.getUrl("resource.byId");
      url += (configService.configObject.isOnline) ? resourceId : '';
      networkService.get(url, function(data) {
        if (callback) callback(data);
        deferred.resolve();
      });
    }
    return deferred.promise;
  };
  var getResources = function(searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    if (searchCriteria && searchCriteria) {
      var request = buildSearchCriteriaForAPI(searchCriteria, {
        includeOrder: true,
        includeAllTypesIfEmpty: true
      });
      var cachedRequest = buildSearchCriteriaForAPI(searchCriteria, {
        includeOrder: true,
        includeAllTypesIfEmpty: false
      });
      cachedRequest.name = searchCriteria.name;
      viewCacheService.cacheView("PS-POLICY-MODEL-LIST", cachedRequest);
      request.criteria.pageNo = startPos / PAGE_SIZE;
      request.criteria.pageSize = PAGE_SIZE;
      networkService.post(configService.getUrl("resourcelist.searchresource"), request, function(data) {
        callback(data);
      });
    }
  };
  var retrieveSearchOption = function(callback) {
    var deferred = $q.defer();
    // loggerService.getLogger().log(configService.configObject.baseUrl)
    networkService.get(configService.getUrl("resourcesearch.fields"), function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };
  var retrieveAvailableTags = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("resourcesearch.tags") + '?pageNo=0&pageSize=65536', function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };
  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("resourcesearch.savedlist"), callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("resourcesearch.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };
  var buildSearchCriteriaForAPI = function(searchCriteria, option) {
    var fields = [];
    var request = {
      criteria: {
        fields: fields
      }
    };
    if (angular.isArray(searchCriteria.types) && searchCriteria.types.length > 0) fields.push(apiAssembleService.createMultiStringExactMatchField('type', searchCriteria.types.map(function(e) {
      return e.name
    })))
    else if (option.includeAllTypesIfEmpty && searchCriteria.searchOptions && searchCriteria.searchOptions.typeOptions && searchCriteria.searchOptions.typeOptions.length) fields.push(apiAssembleService.createMultiStringField('type', searchCriteria.searchOptions.typeOptions.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.effect) && searchCriteria.effect.length > 0) fields.push(apiAssembleService.createMultiStringField('effectType', searchCriteria.effect.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.status) && searchCriteria.status.length > 0) fields.push(apiAssembleService.createMultiStringField('status', searchCriteria.status.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.tags) && searchCriteria.tags.length > 0) {
      if(searchCriteria.tags == $filter('translate')("resourcesearch.title.NoTags")){
        searchCriteria.tags = [];
      }
      fields.push(apiAssembleService.createMultiNestedStringField('tags', 'tags.key', searchCriteria.tags.map(function(e) {
        return e.key
      })))
    }
    if (searchCriteria.modifiedDate && searchCriteria.modifiedDate.name) {
      if (searchCriteria.modifiedDate.name != 'CUSTOM') {
        try {
          var fromAndTo = apiAssembleService.getFromAndToDate(searchCriteria.modifiedDate.name)
          var field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', fromAndTo[0], fromAndTo[1], searchCriteria.modifiedDate.name);
          fields.push(field);
        } catch (TypeError) {
          loggerService.getLogger().log(searchCriteria.modifiedDate.name + ' is not defined');
        }
      }
      if (searchCriteria.modifiedDate.name == 'CUSTOM' && searchCriteria.modifiedFrom && searchCriteria.modifiedTo) {
        var nextDay = angular.copy(searchCriteria.modifiedTo);
        nextDay.setDate(nextDay.getDate() + 1);
        var field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', searchCriteria.modifiedFrom, nextDay, searchCriteria.modifiedDate.name);
        fields.push(field);
      }
    }
    if (searchCriteria.text) {
      var field = apiAssembleService.createSingleTextField(['name', 'description'], searchCriteria.text);
      fields.push(field);
    }
    if (angular.isDefined(searchCriteria.withSubpolicies) && !searchCriteria.withSubpolicies) {
      var field = apiAssembleService.createSingleStringField('hasParent', searchCriteria.withSubpolicies);
      fields.push(field);
    }
    if (option.includeOrder && searchCriteria.sortBy) {
      var field = {
        "field": searchCriteria.sortBy.name,
        "order": searchCriteria.sortBy.order
      };
       // add hardcoded search option for resourcetype
       var sortByResType = {
        "field": "type",
        "order": "DESC"
      };
      request.criteria.sortFields = [sortByResType,field];
      
    }
    return request;
  }
  var saveResourceType = function(resourceType, callback) {
    networkService.post(configService.getUrl("createresource.saveResourceType"), resourceType, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var modifyResourceType = function(resourceType, callback) {
    networkService.put(configService.getUrl("createresource.modifyResourceType"), resourceType, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var saveSearch = function(searchCriteria, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, {
      includeOrder: false
    });
    request.name = searchCriteria.name;
    request.desc = searchCriteria.description;
    request.type = "POLICY_MODEL_RESOURCE";
    loggerService.getLogger().log(request);
    networkService.post(configService.getUrl("resourcesearch.savesearch"), request, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  };
  var addTag = function(label, callback) {
    var tag = {
      key: label,
      "label": label,
      "type": "POLICY_MODEL_TAG",
      "status": "ACTIVE"
    };
    networkService.post(configService.getUrl("tag.save") + tag.type, tag, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getTagById = function(id, callback) {
    networkService.get(configService.getUrl("tag.byId") + id, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getDataTypes = function(callback) {
    networkService.get(configService.getUrl("datatype.getlist"), function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getDataTypeById = function(id, callback) {
    networkService.get(configService.getUrl("datatype.byId") + id, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getDataTypesList = function(callback) {
    networkService.get(configService.getUrl("datatype.list"), function(data) {
      callback && callback(data);
    });
  }
  var delResourceType = function(resourceType, callback) {
    networkService.del(configService.getUrl("resource.del") + resourceType.id, null, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var bulkDelResourceType = function(ids, callback) {
    networkService.del(configService.getUrl("resource.del.bulk"), ids, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    }, {
      contentType: 'application/json'
    });
  }
  var cloneResourceType = function(id, callback) {
    networkService.post(configService.getUrl("resource.clone"), id, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getResourceLiteList = function (type, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("resourceType.listnames") + type + '?pageNo=0&pageSize=65535', function (data) {
      callback && callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var getResourceLite = function (id, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("resourceType.listnames") + 'ANY?id=' + id + '&pageNo=0&pageSize=65535', function (data) {
      data.data = data.data && data.data.length > 0 ? data.data[0] : null;
      callback && callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var getResourceDetailListByType = function(type, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("resourceType.listDetails") + type + '?pageNo=0&pageSize=65535', function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  }
  var importFromFile = function(file, callback) {
    networkService.postWithFile(configService.getUrl("resourcelist.import"), {
      file: file
    }, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  }
  var getEnrollmentSubjectAttributes = function(type, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("enrollmentSubjectAttributes") + type, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  }
  var parseAuthorities = function(resource, permissions) {
    if(resource.authorities && angular.isArray(resource.authorities)) {
      var authoritiesParsed = {};
      angular.forEach(resource.authorities, function(auth) {
        var authorityName = auth.authority;
        if(permissions[authorityName]) {
          authoritiesParsed[auth.authority] = permissions[authorityName].rowLevel.result;
        } else {
          authoritiesParsed[auth.authority] = true;
        }
      })
      return authoritiesParsed;
    }
  }
  return {
    getResourceById: getResourceById,
    getResources: getResources,
    retrieveSearchOption: retrieveSearchOption,
    retrieveAvailableTags: retrieveAvailableTags,
    addTag: addTag,
    getTagById: getTagById,
    getDataTypes: getDataTypes,
    getDataTypeById: getDataTypeById,
    getDataTypesList: getDataTypesList,
    getSavedSearch: getSavedSearch,
    saveSearch: saveSearch,
    delResourceType: delResourceType,
    bulkDelResourceType: bulkDelResourceType,
    cloneResourceType: cloneResourceType,
    delSavedSearch: delSavedSearch,
    saveResourceType: saveResourceType,
    modifyResourceType: modifyResourceType,
    getResourceLiteList: getResourceLiteList,
    getResourceLite: getResourceLite,
    getResourceDetailListByType: getResourceDetailListByType,
    importFromFile: importFromFile,
    getEnrollmentSubjectAttributes: getEnrollmentSubjectAttributes,
    parseAuthorities: parseAuthorities
  }
}]);