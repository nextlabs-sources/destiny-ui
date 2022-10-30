delegationApp.factory('delegationService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q', function($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {
  var PAGE_SIZE = configService.configObject.policyStudio['defaultDelegationListPageSize'];
  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("delegationsearch.savedlist") + '?pageNo=0&pageSize=65535', callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("delegationsearch.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };
  var getDelegations = function(searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    if (searchCriteria && searchCriteria) {
      var request = buildSearchCriteriaForAPI(searchCriteria, true);
      var cachedRequest = angular.copy(request);
      cachedRequest.name = searchCriteria.name;
      viewCacheService.cacheView("PS-DELEGATION-LIST", cachedRequest);
      // if (searchCriteria.sortBy)
      //   request.criteria.sortFields = [{
      //     field: searchCriteria.sortBy.name,
      //     order: 'DESC'
      //   }]
      request.criteria.pageNo = startPos / PAGE_SIZE;
      request.criteria.pageSize = PAGE_SIZE;
      networkService.post(configService.getUrl("delegation.search"), request, function(data) {
        callback(data);
      });
    }
  };
  var getDelegationById = function(delegationId, callback) {
    networkService.get(configService.getUrl("delegation.byId") + delegationId, callback, {
      forceCallback: true
    });
  }
  var retrieveSearchOption = function(callback) {
    // loggerService.getLogger().log(configService.configObject.baseUrl)
    networkService.get(configService.getUrl("delegationsearch.fields"), function(data) {
      callback(data);
    });
  };
  var retrieveAvailableTags = function(callback) {
    networkService.get(configService.getUrl("delegationsearch.tags") + '?pageNo=0&pageSize=65535', function(data) {
      callback(data);
    });
  };
  var buildSearchCriteriaForAPI = function(searchCriteria, includeOrder) {
    var fields = [];
    var request = {
      criteria: {
        fields: fields
      }
    };
    if (angular.isArray(searchCriteria.effect) && searchCriteria.effect.length > 0) {
      fields.push(apiAssembleService.createMultiStringExactMatchField('effectType', searchCriteria.effect.map(function (e) {
        return e.name
      })))
    }
      // if (angular.isArray(searchCriteria.tags) && searchCriteria.tags.length > 0) fields.push(apiAssembleService.createMultiNestedStringField('tags', 'tags.label', searchCriteria.tags.map(function(e) {
      //   return e.label
      // })))
      // if (searchCriteria.modifiedDate && searchCriteria.modifiedDate.name) {
      //   if (searchCriteria.modifiedDate.name != 'CUSTOM') {
      //     try {
      //       var fromAndTo = apiAssembleService.getFromAndToDate(searchCriteria.modifiedDate.name)
      //       var field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', fromAndTo[0], fromAndTo[1], searchCriteria.modifiedDate.name);
      //       fields.push(field);
      //     } catch (TypeError) {
      //       loggerService.getLogger().log(searchCriteria.modifiedDate.name + ' is not defined');
      //     }
      //   }
      //   if (searchCriteria.modifiedDate.name == 'CUSTOM' && searchCriteria.modifiedFrom && searchCriteria.modifiedTo) {
      //     var nextDay = angular.copy(searchCriteria.modifiedTo);
      //     nextDay.setDate(nextDay.getDate() + 1);
      //     var field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', searchCriteria.modifiedFrom, nextDay, searchCriteria.modifiedDate.name);
      //     fields.push(field);
      //   }
      // }
    if (searchCriteria.text) {
      var field = apiAssembleService.createSingleTextField(['name', 'desc'], searchCriteria.text);
      fields.push(field);
    }
    if (includeOrder && searchCriteria.sortBy) {
      var order = "DESC";
      if (searchCriteria.sortBy.name == 'name') order = "ASC";
      var field = {
        "field": searchCriteria.sortBy.name,
        "order": order
      };
      request.criteria.sortFields = [field];
    }
    return request;
  }
  var saveSearch = function(searchCriteria, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, false);
    request.name = searchCriteria.name;
    request.desc = searchCriteria.description;
    loggerService.getLogger().log(request);
    networkService.post(configService.getUrl("delegationsearch.savesearch"), request, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  };
  var adddElegation = function(delegation, callback) {
    networkService.post(configService.getUrl("delegation.add"), delegation, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  };
  var modifyDelegation = function(delegation, callback) {
    networkService.put(configService.getUrl("delegation.modify"), delegation, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  };
  var addTag = function(label,type,callback) {
    var tag = {
      key: label,
      "label": label,
      "type": type,
      "status": "ACTIVE"
    };
    networkService.post(configService.getUrl("tag.save") + tag.type, tag, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getTagById = function(id, callback) {
    networkService.get(configService.getUrl("tag.byId") + id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDataTypes = function(callback) {
    networkService.get(configService.getUrl("datatype.getlist"), function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDataTypeById = function(id, callback) {
    networkService.get(configService.getUrl("datatype.byId") + id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var delDelegation = function(delegation, callback) {
    networkService.del(configService.getUrl("delegation.remove") + delegation.id, null, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var bulkDelDelegation = function(ids, callback) {
    networkService.del(configService.getUrl("delegation.bulkDelete"), ids, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    }, {
      contentType: 'application/json'
    });
  }
  var cloneDelegation = function(id, callback) {
    networkService.get(configService.getUrl("delegation.clone") + id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDelegationHierarchy = function(id, callback) {
    networkService.get(configService.getUrl("delegation.hierarchy") + id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDelegationHistory = function(id, callback) {
    networkService.get(configService.getUrl("delegation.history") + id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDelegationRevision = function(revisionId, revisionNo, callback) {
    networkService.get(configService.getUrl("delegation.revision") + revisionId + '/' + revisionNo, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var revertToRevision = function(delegationId, revisionId, callback) {
    networkService.get(configService.getUrl("delegation.revert") + delegationId + '/' + revisionId, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var delegationStatus = function(delegation) {
    switch (delegation.status) {
      case 'SUBMITTED':
      case 'DEPLOYED':
      case 'APPROVED':
        return {
          deployed: true,
          active: true
        };
      case 'DE_ACTIVATED':
        return {
          deployed: true,
          active: false
        };
      default:
        return {
          deployed: false,
          active: false
        };
    }
  }
  var validateExpression = function(exp, callback) {
    networkService.post(configService.getUrl("delegation.expression.validation"), exp, function(resp) {
      callback && callback(resp);
    })
  }
  var deployDelegation = function(ids, callback) {
    networkService.post(configService.getUrl("delegation.deploy"), ids, function(resp) {
      callback && callback(resp);
    })
  }
  var deactivateDelegation = function(ids, callback) {
    networkService.post(configService.getUrl("delegation.undeploy"), ids, function(resp) {
      callback && callback(resp);
    })
  }
  var saveAndDeploy = function(delegation, callback) {
    networkService.post(configService.getUrl("delegation.saveAndDeploy"), delegation, function(resp) {
      callback && callback(resp);
    })
  }
  var validateDelegation = function(delegationId, callback) {
    networkService.get(configService.getUrl("delegation.validate") + delegationId, function(resp) {
      callback && callback(resp);
    })
  }
  var validateAndDeploy = function(delegationIdList, callback) {
    networkService.post(configService.getUrl("delegation.validateAndDeploy"), delegationIdList, function(resp) {
      callback && callback(resp);
    })
  }
  var importFromFile = function(file, callback) {
    networkService.postWithFile(configService.getUrl("delegationlist.import"), {
      file: file
    }, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDelegationsExportingLink = function(ids, callback) {
    networkService.post(configService.getUrl("delegationlist.export"), ids, function(response) {
      callback(configService.configObject['delegationStudio'].url['online'].rootContext + 'exports/Policy/' + response.data)
        // callback('exports/' + response.data);
    }, {
      forceCallback: true
    });
  }
  var getDelegationSubject = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("delegation.subject.detail"), function(response) {
      callback(response);
      deferred.resolve();
    });
    return deferred.promise;
  }
  var listAllDelegationResources = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("delegation.listall.resource") + '?pageNo=0&pageSize=65535', function(response) {
      callback(response);
      deferred.resolve();
    });
    return deferred.promise;
  }
  var listAllDelegationActions = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("delegation.listall.action") + '?pageNo=0&pageSize=65535', function(response) {
      callback(response);
      deferred.resolve();
    });
    return deferred.promise;
  }
  var getDelegationModel = function(modelId,callback){
    var deferred = $q.defer();
    loggerService.getLogger().log('fetch resource by id: ' + modelId);
    if (modelId) {
      var url = configService.getUrl("resourceType.listnames") + 'ANY?id=' + modelId + '&pageNo=0&pageSize=65535';
      networkService.get(url, function(data) {
        data.data = data.data && data.data.length > 0 ? data.data[0] : null;
        if (callback) callback(data);
        deferred.resolve();
      });
    }
    return deferred.promise;
 
  }
  var importFromFile = function(file, callback) {
    networkService.postWithFile(configService.getUrl("delegation.import"), {
      file: file
    }, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getDAExportingLink = function(ids, callback) {
    networkService.post(configService.getUrl("delegation.export"), ids, function(response) {
      callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data)
      // callback('exports/' + response.data);
    }, {forceCallback:true});
  }
  var getDAExportingLinkForAll = function(callback) {
    networkService.get(configService.getUrl("delegation.export.all"), function(response) {
      callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data)
      // callback('exports/' + response.data);
    }, {forceCallback:true});
  }

  var getAllFoldersByType = function(type, callback) {
    networkService.get(configService.getUrl("folders") + '/all/' + type, function(data) {
      callback(data);
    });
  }

  return {
    getDelegations: getDelegations,
    getDelegationById: getDelegationById,
    retrieveSearchOption: retrieveSearchOption,
    retrieveAvailableTags: retrieveAvailableTags,
    addTag: addTag,
    getTagById: getTagById,
    getDataTypes: getDataTypes,
    getDataTypeById: getDataTypeById,
    getSavedSearch: getSavedSearch,
    delSavedSearch: delSavedSearch,
    saveSearch: saveSearch,
    adddElegation: adddElegation,
    modifyDelegation: modifyDelegation,
    delDelegation: delDelegation,
    bulkDelDelegation: bulkDelDelegation,
    cloneDelegation: cloneDelegation,
    getDelegationHierarchy: getDelegationHierarchy,
    getDelegationHistory: getDelegationHistory,
    getDelegationRevision: getDelegationRevision,
    revertToRevision: revertToRevision,
    delegationStatus: delegationStatus,
    validateExpression: validateExpression,
    deployDelegation: deployDelegation,
    deactivateDelegation: deactivateDelegation,
    saveAndDeploy: saveAndDeploy,
    validateDelegation: validateDelegation,
    validateAndDeploy: validateAndDeploy,
    importFromFile: importFromFile,
    getDelegationsExportingLink: getDelegationsExportingLink,
    getDelegationSubject: getDelegationSubject,
    listAllDelegationResources: listAllDelegationResources,
    listAllDelegationActions: listAllDelegationActions,
    getDelegationModel:getDelegationModel,
    importFromFile: importFromFile,
    getDAExportingLink: getDAExportingLink,
    getDAExportingLinkForAll: getDAExportingLinkForAll,
    getAllFoldersByType: getAllFoldersByType
  }
}]);