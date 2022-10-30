delegationApp.factory('delegationUserService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q',
  function($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {
    var PAGE_SIZE = configService.configObject.policyStudio['defaultUserListPageSize'];
    var addUser = function(data, callback) {
      //delegation.user.add
      networkService.post(configService.getUrl('delegation.user.add'), data, callback)
    }
    var modifyUser = function(data, callback) {
      networkService.put(configService.getUrl('delegation.user.modify'), data, callback)
    }
    var findUserById = function(id, callback) {
      networkService.get(configService.getUrl("delegation.user.findbyid") + id, function(resp) {
        callback && callback(resp);
      })
    }
    var getUserList = function(searchCriteria, startPos, callback) {
      loggerService.getLogger().log(searchCriteria);
      if (searchCriteria && searchCriteria) {
        var request = buildSearchCriteriaForAPI(searchCriteria, true);
        // var cachedRequest = angular.copy(request);
        // cachedRequest.name = searchCriteria.name;
        // viewCacheService.cacheView("PS-DELEGATION-LIST", cachedRequest);
        // request.criteria.pageNo = startPos / PAGE_SIZE;
        // request.criteria.pageSize = PAGE_SIZE;
        // networkService.post(configService.getUrl("delegation.search"), request, function(data) {
        //   callback(data);
        // });


/*        var request = {
          "criteria": {
            "fields": [],
            "sortFields": [{
              "field": searchCriteria.sortBy.name,
              "order": searchCriteria.sortBy.order
            }],
            "pageNo": startPos / PAGE_SIZE,
            "pageSize": PAGE_SIZE
          }
        }*/

        request.criteria.pageNo = startPos / PAGE_SIZE;
        request.criteria.pageSize = PAGE_SIZE;
        
        networkService.post(configService.getUrl("delegation.user.list"), request, function(data) {
          callback(data);
        });
      }
    };
    var getGroupList = function(searchCriteria, startPos, callback) {
      loggerService.getLogger().log(searchCriteria);
      if (searchCriteria && searchCriteria) {
        var request = buildSearchCriteriaForAPI(searchCriteria, true);
        request.criteria.pageNo = startPos / PAGE_SIZE;
        request.criteria.pageSize = 100;

        networkService.post(configService.getUrl("delegation.user.group.list"), request, function(data) {
          callback(data);
        });
      }
    };
    var buildSearchCriteriaForAPI = function(searchCriteria, includeOrder){
      var fields = [];
      var request = {
        criteria: {
          fields: fields
        }
      };
      if (angular.isArray(searchCriteria.type) && searchCriteria.type.length > 0) fields.push(apiAssembleService.createMultiStringField('authHandlerId', searchCriteria.type.map(function(e) {
          return e.authHandlerId.toString();
        })))

      if (searchCriteria.text) {
        // var field = apiAssembleService.createSingleTextField(['name', 'desc'], searchCriteria.text);
        var field = apiAssembleService.createSingleStringField('displayName', searchCriteria.text);
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

    var removeUser = function(user, callback) {
      networkService.del(configService.getUrl("delegation.user.remove") + user.id, null, function(data) {
        // loggerService.getLogger().log(data);
        callback && callback(data);
      });
    }

    var removeGroup = function(group, callback) {
      networkService.del(configService.getUrl("delegation.user.group.remove") + group.id, null, function(data) {
        // loggerService.getLogger().log(data);
        callback && callback(data);
      });
    }

    var resetGAuthToken = function(user, callback) {
      networkService.del(configService.getUrl("delegation.user.reset.gauth.token") + user.username, null, function(data) {
        callback && callback(data);
      });
    }

    var bulkDelUser = function(ids, callback) {
      networkService.del(configService.getUrl("delegation.user.bulkDelete"), ids, function(data) {
        loggerService.getLogger().log(data);
        callback && callback(data);
      }, {
        contentType: 'application/json'
      });
    }

    var bulkDelGroup = function(ids, callback) {
      networkService.del(configService.getUrl("delegation.user.group.bulkDelete"), ids, function(data) {
        loggerService.getLogger().log(data);
        callback && callback(data);
      }, {
        contentType: 'application/json'
      });
    }

    var unlockUser = function(user, callback) {
      console.info("Unlocking user " + user.id);
      networkService.put(configService.getUrl("delegation.user.unlockUser"), user.id, function(resp) {
        callback && callback(resp);
      });
    }
    var getSearchOptions = function() {
      var deferred = $q.defer();
      networkService.get(configService.getUrl("delegation.user.searchOption"), function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var getUserTypeList = function() {
      var deferred = $q.defer();
      // networkService.get(configService.getUrl("delegation.user.typelist"), function(data) {
      //   deferred.resolve(data);
      // });
      var data = {
        data: [{
          name: "internal",
          label: "Internal"
        }, {
          name: "imported",
          label: "AD (Imported)"
        }/*, {
          name: "db",
          label: "Database"
        }*/]
      }
      deferred.resolve(data);
      return deferred.promise;
    }
    var getUserListToImport = function(option) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("loginconfig.listuser"), option, function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    };
    var getGroupListToImport = function(option) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("loginconfig.listgroup"), option, function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    };
    var importUser = function(users) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("delegation.user.importuser"), users, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var importGroup = function(groups) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("delegation.user.importgroup"), groups, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    return {
      addUser: addUser,
      modifyUser: modifyUser,
      findUserById: findUserById,
      getUserList: getUserList,
      getGroupList: getGroupList,
      removeUser: removeUser,
      removeGroup: removeGroup,
      bulkDelUser: bulkDelUser,
      bulkDelGroup: bulkDelGroup,
      unlockUser: unlockUser,
      getSearchOptions: getSearchOptions,
      getUserTypeList: getUserTypeList,
      getUserListToImport: getUserListToImport,
      getGroupListToImport: getGroupListToImport,
      importUser: importUser,
      importGroup: importGroup,
      resetGAuthToken :resetGAuthToken
    }
  }
]);