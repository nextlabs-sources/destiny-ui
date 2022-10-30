policyStudio.factory('componentService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', '$filter', 'viewCacheService', '$q', '$uibModal', 'dialogService', function($http, networkService, configService, loggerService, apiAssembleService, $filter, viewCacheService, $q, $uibModal, dialogService) {
  var PAGE_SIZE = configService.configObject.policyStudio['defaultComponentListPageSize'];
  var getComponents = function(searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    if (searchCriteria && searchCriteria) {
      var request = buildSearchCriteriaForAPI(searchCriteria, true);
      var cachedRequest = angular.copy(request);
      cachedRequest.name = searchCriteria.name;
      viewCacheService.cacheView("PS-COMPONENT-LIST" + searchCriteria.group, cachedRequest);
      request.criteria.pageNo = startPos / PAGE_SIZE;
      request.criteria.pageSize = PAGE_SIZE;
      networkService.post(configService.getUrl("componentlist.searchcomponent"), request, function(data) {
        callback(data);
      });
    }
  };
  var getComponentById = function(componentId, callback) {
    loggerService.getLogger().log('fetch compoent by id: ' + componentId);
    if (componentId) {
      var url = configService.getUrl("component.byId");
      url += (configService.configObject.isOnline) ? componentId : '';
      networkService.get(url, function(data) {
        if (callback) callback(data);
      });
    }
  };
  var retrieveSearchOption = function(callback) {
    var deferred = $q.defer();
    // loggerService.getLogger().log(configService.configObject.baseUrl)
    networkService.get(configService.getUrl("componentsearch.fields"), function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };
  var retrieveAvailableTags = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("componentsearch.tags") + '?pageNo=0&pageSize=65536', function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var findMembers = function (types, searchString, callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("component.members"),
      function (data) {
        callback(data);
        deferred.resolve(data);
      },
      null,
      {
        searchString: searchString,
        type: types
      });
    return deferred.promise;
  };

  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("componentsearch.savedlist"), callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("componentsearch.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };
  var getComponentsById = function(idList, callback) {
    var request = {
      "criteria": {
        "fields": [apiAssembleService.createMultiStringField('id', idList)],
        "sortFields": [{
          "field": "name",
          "order": "ASC"
        }],
        "pageNo": 0,
        "pageSize": 65535
      }
    };
    networkService.post(configService.getUrl("componentlist.idlist"), request, function(data) {
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
    if (angular.isArray(searchCriteria.status) && searchCriteria.status.length > 0) fields.push(apiAssembleService.createMultiStringField('status', searchCriteria.status.map(function(e) {
      return e.name
    })))
    if (searchCriteria.group) {
      var group = apiAssembleService.getGroupForComponent(searchCriteria.group);
      if (group) fields.push(apiAssembleService.createSingleStringExactMatchField('group', group));
    }
    if (searchCriteria.subGroup && searchCriteria.subGroup.length > 0) {
      fields.push(apiAssembleService.createMultiStringField('modelType', searchCriteria.subGroup.map(function(e) {
        return e.name
      })))
    }
    if (angular.isArray(searchCriteria.tags) && searchCriteria.tags.length > 0) {
      if(searchCriteria.tags == $filter('translate')("componentsearch.title.NoTags")){
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
    if (angular.isDefined(searchCriteria.withSubcomponents) && !searchCriteria.withSubcomponents) {
      var field = apiAssembleService.createSingleStringExactMatchField('hasIncludedIn', searchCriteria.withSubcomponents);
      fields.push(field);
    }
    if (angular.isDefined(searchCriteria.onlyEmptyComponents) && searchCriteria.onlyEmptyComponents) {
      var field = apiAssembleService.createSingleStringExactMatchField('empty', searchCriteria.onlyEmptyComponents);
      fields.push(field);
    }
    if (angular.isDefined(searchCriteria.folderId)) {
      fields.push(apiAssembleService.createSingleStringExactMatchField('folderId', searchCriteria.folderId));
    }
    if (includeOrder && searchCriteria.sortBy) {
      var field = {
        "field": searchCriteria.sortBy.name,
        "order": searchCriteria.sortBy.order
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
    networkService.post(configService.getUrl("componentsearch.savesearch"), request, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  };
  var addTag = function(label, callback) {
    var tag = {
      key: label,
      "label": label,
      "type": "COMPONENT_TAG",
      "status": "ACTIVE"
    };
    networkService.post(configService.getUrl("tag.save") + tag.type, tag, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getTagById = function(id, callback) {
    networkService.get(configService.getUrl("tag.byId") + id, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var saveComponent = function(data, callback) {
    networkService.post(configService.getUrl("component.create"), data, function(result) {
      // loggerService.getLogger().log(result);
      callback && callback(result);
    });
  }
  var saveSubComponent = function(data, callback) {
    networkService.post(configService.getUrl("component.create.sub"), data, function(result) {
      // loggerService.getLogger().log(result);
      callback && callback(result);
    });
  }
  var modifyComponent = function(data, callback) {
    networkService.put(configService.getUrl("component.modify"), data, function(result) {
      // loggerService.getLogger().log(result);
      callback && callback(result);
    });
  }
  var delComponent = function(component, callback) {
    networkService.del(configService.getUrl("component.del") + component.id, null, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var bulkDelComponent = function(ids, callback) {
    networkService.del(configService.getUrl("component.del.bulk"), ids, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    }, {
      contentType: 'application/json'
    });
  }
  var cloneComponent = function(id, callback) {
    networkService.post(configService.getUrl("component.clone"), id, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getComponentHierarchy = function(id, callback) {
    networkService.get(configService.getUrl("component.hierarchy") + id, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }

  var getComponentLiteList = function (componentCategory, resourceType, callback) {
    var deferred = $q.defer();
    var url = configService.getUrl("componentlist.listall.component") + componentCategory;
    if (resourceType) url += '/' + encodeURIComponent(resourceType);
    url += '?pageNo=0&pageSize=65535';
    networkService.get(url, function (data) {
      callback && callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var getComponentHistory = function(id, callback) {
    networkService.get(configService.getUrl("component.history") + id, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var getComponentRevision = function(revisionId, revisionNo, callback) {
    networkService.get(configService.getUrl("component.revision") + revisionId + '/' + revisionNo, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var revertToRevision = function(revisionId, callback) {
    networkService.post(configService.getUrl("component.revert"), revisionId, function(data) {
      // loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }

  var showDeploymentOutcomeNotification = function (response, push, componentType, backLink) {
    var failures = 0
    var type = "success"
    var message = $filter("translate")("componentlist.deploy.notify", { length: response.data ? response.data.length : 1 })
    if (push) {
      message = $filter("translate")("componentlist.deployWithPush.notify", { length: response.data ? response.data.length : 1 })
      if (response.data && response.data.length > 0 && response.data[0] && response.data[0].pushResults) {
        response.data[0].pushResults
          .filter(function (result) {
            return !result.success
          })
          .forEach(function (failedResult, index, results) {
            failures++
            if (index == 0) {
              message += "<br/>" + $filter("translate")("componentlist.deploy.notify.pushFailures")
              message += "<ul>"
            }
            message += "<li>" + failedResult.dpsUrl + "</li>"
            if (index == results.length - 1) {
              message += "</ul>"
            }
          })
        if (failures > 0) {
          type = failures == response.data[0].pushResults.length ? "error" : "warning"
        }
      }
    }
    dialogService.notifyWithoutBlocking({
      type: type,
      msg: message,
      backLink: backLink ? "PolicyStudio.Components({type:'" + componentType + "'})" : undefined,
      backLabel: backLink ? $filter("translate")('BACK TO COMPONENT LIST') : undefined,
      html: true,
      timeout: failures > 0 ? 10000 : 7000
    })
  }

  var deploy = function (ids, backLink, componentType, saved, callback) {
    findDependencies(ids, function (response) {
      var dependencies = {
        policies: [],
        components: [],
        requiredComponents: [],
        optionalComponents: [],
        requiredPolicies: [],
        optionalPolicies: []
      }
      if (response.data) {
        response.data.forEach(function (dependency) {
          dependency.selected = true
          if (dependency.provided) {
            if (dependency.type == 'POLICY') {
              dependencies.policies.push(dependency)
            } else if (dependency.type == 'COMPONENT') {
              dependencies.components.push(dependency)
            }
          } else {
            if (dependency.type == 'COMPONENT') {
              dependency.optional ? dependencies.optionalComponents.push(dependency) : dependencies.requiredComponents.push(dependency)
            } else if (dependency.type == 'POLICY') {
              dependency.optional ? dependencies.optionalPolicies.push(dependency) : dependencies.requiredPolicies.push(dependency)
            }
          }
        })
      }
      $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/PolicyStudio/Policy/partials/deployment-confirmation.html',
        controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
          var deploymentTime = new Date()
          deploymentTime.setHours(0, 0, 0, 0)
          var deploymentDate = new Date()
          deploymentDate.setDate(deploymentDate.getDate() + 1)
          $scope.ok = function () {
            if ($scope.data.deploymentImmediate || $scope.deploymentTimeForm.$valid) {
              $uibModalInstance.close($scope.data)
            }
          }
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
          }
          $scope.data = {
            count: ids.length,
            type: 'component',
            saved: saved,
            dependencies: dependencies,
            deploymentImmediate: true,
            deploymentDate: deploymentDate,
            deploymentTime: deploymentTime,
            options: {
              minDate: new Date()
            }
          }
        }]
      }).result
        .then(function (data) {
          if (!data.deploymentImmediate) {
            data.deploymentTime.setFullYear(data.deploymentDate.getFullYear())
            data.deploymentTime.setMonth(data.deploymentDate.getMonth())
            data.deploymentTime.setDate(data.deploymentDate.getDate())
            data.deploymentTime.setSeconds(0)
            data.deploymentTime.setMilliseconds(0)
          }
          var deploymentRequests = response.data.filter(function (dependency) {
            return dependency.selected
          }).map(function (dependency) {
            return {
              id: dependency.id,
              type: dependency.type,
              push: data.deploymentImmediate,
              deploymentTime: data.deploymentImmediate ? -1 : data.deploymentTime.getTime()
            }
          })
          var push = deploymentRequests.reduce(function (push, deploymentRequest) {
            return push || deploymentRequest.push
          }, false)
          deployComponent(deploymentRequests, function (response) {
            showDeploymentOutcomeNotification(response, push, componentType, backLink)
            callback && callback()
          })
        }, function () {
          callback && callback()
        })
    })
  }

  var findDependencies = function (ids, callback) {
    networkService.post(configService.getUrl("component.findDependencies"), ids, function (resp) {
      callback && callback(resp)
    })
  }

  var deployComponent = function (deploymentRequests, callback) {
    networkService.post(configService.getUrl("component.deploy"), deploymentRequests, function (resp) {
      callback && callback(resp)
    })
  }

  var deactivateComponent = function(ids, callback) {
    networkService.post(configService.getUrl("component.undeploy"), ids, function(resp) {
      callback && callback(resp);
    })
  }
  var saveAndDeploy = function(component, callback) {
    if (component.id) {
      networkService.put(configService.getUrl("component.modifyAndDeploy"), component, function (resp) {
      callback && callback(resp)
      })
    } else {
      networkService.post(configService.getUrl("component.addAndDeploy"), component, function (resp) {
        callback && callback(resp)
      })
    }
  }
  var validateAndDeploy = function(componentIdList, callback) {
    networkService.post(configService.getUrl("component.validateAndDeploy"), componentIdList, function(resp) {
      callback && callback(resp);
    })
  }
  var parseAuthorities = function(component, permissions) {
    if(component.authorities && angular.isArray(component.authorities)) {
      var authoritiesParsed = {};
      angular.forEach(component.authorities, function(auth) {
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

  var getGroupMembers = function(group, callback) {
    loggerService.getLogger().log('fetch members of the group: ' + group.name);
    console.log(group);
    if (group) {
      var url = configService.getUrl("component.members.preview");
      networkService.post(url,group, function(data) {
        if (callback) callback(data);
      });
    }
  };

  var filterMembers = function(group, callback) {
    loggerService.getLogger().log('fetch members that match: ' + group.seachText);
    console.log(group);
    if (group) {
      var url = configService.getUrl("component.members.preview.filter");
      networkService.post(url,group, function(data) {
        if (callback) callback(data);
      });
    }
  };

  var getComponentPreview = function(component, callback) {
    loggerService.getLogger().log('fetch preview of component: ' + component.name);
    if (component) {
      var url = configService.getUrl("component.preview");
      networkService.post(url,component, function(data) {
        if (callback) callback(data);
      });
    }
  };

  return {
    getComponents: getComponents,
    getComponentLiteList: getComponentLiteList,
    getComponentById: getComponentById,
    retrieveSearchOption: retrieveSearchOption,
    retrieveAvailableTags: retrieveAvailableTags,
    addTag: addTag,
    getTagById: getTagById,
    delComponent: delComponent,
    bulkDelComponent: bulkDelComponent,
    cloneComponent: cloneComponent,
    getSavedSearch: getSavedSearch,
    delSavedSearch: delSavedSearch,
    getComponentsById: getComponentsById,
    saveSearch: saveSearch,
    saveComponent: saveComponent,
    saveSubComponent: saveSubComponent,
    modifyComponent: modifyComponent,
    findMembers: findMembers,
    getComponentHierarchy: getComponentHierarchy,
    getComponentHistory: getComponentHistory,
    getComponentRevision: getComponentRevision,
    revertToRevision: revertToRevision,
    deploy: deploy,
    deactivateComponent: deactivateComponent,
    saveAndDeploy: saveAndDeploy,
    validateAndDeploy: validateAndDeploy,
    parseAuthorities: parseAuthorities,
    getGroupMembers : getGroupMembers,
    filterMembers : filterMembers,
    getComponentPreview : getComponentPreview
  }
}]);