policyStudio.factory('policyService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', '$filter', 'viewCacheService', '$q', '$uibModal', 'dialogService', function($http, networkService, configService, loggerService, apiAssembleService, $filter, viewCacheService, $q, $uibModal, dialogService) {
  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("policysearch.savedlist") + '?pageNo=0&pageSize=65535', callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("policysearch.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };
  var getPolicies = function(searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    if (searchCriteria && searchCriteria) {
      var request = buildSearchCriteriaForAPI(searchCriteria, true);
      var cachedRequest = angular.copy(request);
      cachedRequest.name = searchCriteria.name;
      viewCacheService.cacheView("PS-POLICY-LIST", cachedRequest);
   
      request.criteria.pageNo = startPos / configService.configObject.policyStudio['defaultPolicyListPageSize'];
      request.criteria.pageSize = (searchCriteria.criteria && searchCriteria.criteria.pageSize && searchCriteria.criteria.pageSize > 0) ?
        searchCriteria.criteria.pageSize :
        configService.configObject.policyStudio['defaultPolicyListPageSize'];
      networkService.post(configService.getUrl("policylist.searchpolicy"), request, function(data) {
        callback(data);
      });
    }
  };
  var getPolicyById = function(policyId, callback) {
    loggerService.getLogger().log('fetch policy for id: ' + policyId);
    if (policyId) {
      var url = configService.getUrl("policy.byId");
      url += (configService.configObject.isOnline) ? '/' + policyId : '';
      networkService.get(url, callback, {
        forceCallback: true
      });
    }
  }
  var getPoliciesById = function(idList, callback) {
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
    networkService.post(configService.getUrl("policylist.idlist"), request, function(data) {
      callback(data);
    });
  };
  var retrieveSearchOption = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("policysearch.fields"), function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };
  var retrieveAvailableTags = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("policysearch.tags") + '?pageNo=0&pageSize=65535', function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };
  var buildSearchCriteriaForAPI = function(searchCriteria, includeOrder) {
    var fields = [];
    var request = {
      criteria: {
        fields: fields
      }
    };
    if (angular.isArray(searchCriteria.effect) && searchCriteria.effect.length > 0) fields.push(apiAssembleService.createMultiStringExactMatchField('effectType', searchCriteria.effect.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.status) && searchCriteria.status.length > 0) fields.push(apiAssembleService.createMultiStringField('status', searchCriteria.status.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.workflowStatus) && searchCriteria.workflowStatus.length > 0) fields.push(apiAssembleService.createMultiStringField('activeWorkflowRequestLevelStatus', searchCriteria.workflowStatus.map(function(e) {
      return e.name
    })))
    if (angular.isArray(searchCriteria.tags) && searchCriteria.tags.length > 0) {
      if(searchCriteria.tags == $filter('translate')("policysearch.title.NoTags")){
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
      var field = apiAssembleService.createSingleStringExactMatchField('hasParent', searchCriteria.withSubpolicies);
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
    networkService.post(configService.getUrl("policysearch.savesearch"), request, function(data) {
      callback && callback(data);
    });
  };
  var savePolicy = function(policy, callback) {
    networkService.post(configService.getUrl("createpolicy.add"), policy, function(data) {
      callback && callback(data);
    });
  };
  var saveSubPolicy = function(policy, callback) {
    networkService.post(configService.getUrl("createpolicy.add.sub"), policy, function(data) {
      callback && callback(data);
    });
  };
  var modifyPolicy = function(policy, callback) {
    networkService.put(configService.getUrl("createpolicy.modify"), policy, function(data) {
      callback && callback(data);
    });
  };
  var addTag = function(label, callback) {
    var tag = {
      key: label,
      "label": label,
      "type": "POLICY_TAG",
      "status": "ACTIVE"
    };
    networkService.post(configService.getUrl("tag.save") + tag.type, tag, function(data) {
      callback && callback(data);
    });
  }
  var getTagById = function(id, callback) {
    networkService.get(configService.getUrl("tag.byId") + id, function(data) {
      callback && callback(data);
    });
  }
  var getDataTypes = function(callback) {
    networkService.get(configService.getUrl("datatype.getlist"), function(data) {
      callback && callback(data);
    });
  }
  var getDataTypeById = function(id, callback) {
    networkService.get(configService.getUrl("datatype.byId") + id, function(data) {
      callback && callback(data);
    });
  }
  var delPolicy = function(policy, callback) {
    networkService.del(configService.getUrl("policy.del") + policy.id, null, function(data) {
      callback && callback(data);
    });
  }
  var bulkDelPolicy = function(ids, callback) {
    networkService.del(configService.getUrl("policy.del.bulk"), ids, function(data) {
      callback && callback(data);
    }, {
      contentType: 'application/json'
    });
  }
  var clonePolicy = function(id, callback) {
    networkService.post(configService.getUrl("policy.clone"), id, function(data) {
      callback && callback(data);
    });
  }
  var migratePolicy = function(ids, callback) {
    networkService.post(configService.getUrl("environment.export"), ids, function (data) {
      callback && callback(data);
    });
  }
  var getPolicyHierarchy = function(id, callback) {
    networkService.get(configService.getUrl("policy.hierarchy") + id, function(data) {
      callback && callback(data);
    });
  }
  var getPolicyHistory = function(id, callback) {
    networkService.get(configService.getUrl("policy.history") + id, function(data) {
      callback && callback(data);
    });
  }
  var getPolicyRevision = function(revisionId, revisionNo, callback) {
    networkService.get(configService.getUrl("policy.revision") + revisionId + '/' + revisionNo, function(data) {
      loggerService.getLogger().log(data);
      callback && callback(data);
    });
  }
  var revertToRevision = function(revisionId, callback) {
    networkService.post(configService.getUrl("policy.revert"), revisionId, function(data) {
      callback && callback(data);
    });
  }
  var policyStatus = function(policy) {
    switch (policy.status) {
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
  var parseAuthorities = function(policy, permissions) {
    if(policy.authorities && angular.isArray(policy.authorities)) {
      var authoritiesParsed = {};
      angular.forEach(policy.authorities, function(auth) {
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
  var validateExpression = function(exp, callback) {
    networkService.post(configService.getUrl("policy.expression.validation"), exp, function(resp) {
      callback && callback(resp);
    })
  }

 var showDeploymentOutcomeNotification = function (response, push, backLink) {
    var failures = 0
    var type = "success"
    var message = $filter("translate")("policylist.deploy.notify", { length: response.data ? response.data.length : 1 })
    if (push) {
      message = $filter("translate")("policylist.deployWithPush.notify", { length: response.data ? response.data.length : 1 })
      if (response.data && response.data.length > 0 && response.data[0] && response.data[0].pushResults) {
        response.data[0].pushResults
          .filter(function (result) {
            return !result.success
          })
          .forEach(function (failedResult, index, results) {
            failures++
            if (index == 0) {
              message += "<br/>" + $filter("translate")("policylist.deploy.notify.pushFailures")
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
      backLink: backLink ? "PolicyStudio.Policies" : undefined,
      backLabel: backLink ? $filter("translate")("BACK TO POLICY LIST") : undefined,
      html: true,
      timeout: failures > 0 ? 10000 : 7000
    })
  }

  var deploy = function (ids, backLink, saved, workflowProperties, callback) {
    if(workflowProperties){
      if (workflowProperties.workflowstatus && workflowProperties.unapprovedPolicies.length) {
        ids = workflowProperties.approvedPolicies
      }
    }
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
          if(workflowProperties){
            $scope.unapprovedPolicies =  workflowProperties.unapprovedPolicies
            $scope.isWorkFlowActive = workflowProperties.workflowstatus
          }
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
            type: 'policy',
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
          var deploymentRequests = response.data.filter(function(dependency) {
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
          deployPolicy(deploymentRequests, function (response) {
            showDeploymentOutcomeNotification(response, push, backLink)
            callback && callback()
          })
        }, function () {
          callback && callback()
        })
    })
  }

  var findDependencies = function (ids, callback) {
    networkService.post(configService.getUrl("policy.findDependencies"), ids, function (resp) {
      callback && callback(resp)
    })
  }

  var deployPolicy = function(deploymentRequests, callback) {
    networkService.post(configService.getUrl("policy.deploy"), deploymentRequests, function(resp) {
      callback && callback(resp)
    })
  }
  var deactivatePolicy = function(ids, callback) {
    networkService.post(configService.getUrl("policy.undeploy"), ids, function(resp) {
      callback && callback(resp);
    })
  }
  var saveAndDeploy = function(policy, callback) {
    if (policy.id) {
      networkService.put(configService.getUrl("policy.modifyAndDeploy"), policy, function (resp) {
      callback && callback(resp)
      })
    } else {
      networkService.post(configService.getUrl("policy.addAndDeploy"), policy, function (resp) {
        callback && callback(resp)
      })
    }
  }
  var saveAndDeploySubPolicy = function(policy, callback) {
    if (policy.id) {
      networkService.put(configService.getUrl("policy.modifyAndDeploySubPolicy"), policy, function (resp) {
        callback && callback(resp)
      })
    } else {
      networkService.post(configService.getUrl("policy.addAndDeploySubPolicy"), policy, function (resp) {
      callback && callback(resp)
      })
    }
  }

  var validateAndDeploy = function(policyIdList, callback) {
    networkService.post(configService.getUrl("policy.validateAndDeploy"), policyIdList, function(resp) {
      callback && callback(resp);
    })
  }
  var importFromFile = function(mechanism, file, cleanup, callback) {
    var formData = new FormData();
    formData.append('importMechanism', mechanism);
    formData.append('policyFiles', file);
    formData.append('cleanup', cleanup);
    networkService.postWithFile(configService.getUrl("policylist.import"), formData, function(data) {
      callback && callback(data);
    });
  }
  var openExportFormatModal = function(plainTextEnabled, exportMode, callback){
    var exportModeSANDE = $filter('translate')("policylist.export.option.sande");
    if(exportMode === exportModeSANDE && plainTextEnabled) {
      $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/PolicyStudio/Policy/partials/export-modal.html',
        controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
          
          $scope.data = {
            plainTextNotAllowed : true,
            exportMode : $filter('translate')("policylist.export.option.sande")
          }
          $scope.ok = function () {
              $uibModalInstance.close($scope.data)
          }
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel')
          }
        }]
      }).result
        .then(function (data) {
          if(data.plainTextNotAllowed) {
            data.exportMode = $filter('translate')("policylist.export.option.sande");
          } else {
            data.exportMode = $filter('translate')("policylist.export.option.plain");
          }
          callback && callback(data.exportMode)
        }, function () {
          callback && callback('')
        })
    } else {
      callback && callback(exportMode)
    }
  }

  var getPoliciesExportingLink = function(exportMode, plainTextEnabled, exportEntities, callback) {
    openExportFormatModal(plainTextEnabled, exportMode, function (exportMode) {
      if(exportMode !== '') {
        networkService.post(configService.getUrl("policylist.export") + "?exportMode=" + exportMode, exportEntities, function(response) {
          callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data)
        });
      } 
    });
  }

  var getPoliciesExportingLinkForAll = function(exportMode, plainTextEnabled, callback) {
    openExportFormatModal(plainTextEnabled, exportMode, function (exportMode) {
      if(exportMode !== '') {
        networkService.get(configService.getUrl("policylist.export.all") + "?exportMode=" + exportMode, function(response) {
          callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data)
        });
      } 
    });
  }

  var getFileAsBlob = function (url, callback) {
    networkService.get(url, function (response) {
      callback && callback(response);
    }, { responseType: "blob" });
  };

  var getPoliciesExportingOptions = function(callback) {
    networkService.get(configService.getUrl("policylist.export.options"), function(response) {
      callback && callback(response);
    });
  }

  var getPoliciesPDFLink = function(exportEntities, callback) {
    networkService.post(configService.getUrl("policylist.generatePDF"), exportEntities, function(response) {
      callback && callback(response);
    });
  }

  var getPoliciesXACMLLink = function(exportEntities, callback) {
    networkService.post(configService.getUrl("policylist.generateXACML"), exportEntities, function(response) {
      callback && callback(response);
    });
  }

  var submitPolicy = function(id) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("createpolicyworkflow.submit") + id, null, function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  var approvePolicyWorkflow = function(id) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("createpolicyworkflow.approve") + id, null, function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  var returnPolicyWorkflow = function(id) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("createpolicyworkflow.return") + id, null, function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  var getPolicyWorkflowById = function(policyId, callback) {
    if (policyId) {
      networkService.get(configService.getUrl("policyworkflow.byId") + policyId, function(data) {
        callback && callback(data);
      });
    }
  }

  var bulkDeactivatePolicy = function(ids) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("policy.undeploy"), ids, function(resp) {
      deferred.resolve(resp);
    })
    return deferred.promise;
  }

  var addComment = function(comment) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("createpolicyworkflow.addComment"), comment, function(resp) {
      deferred.resolve(resp);
    })
    return deferred.promise;
  }

  var getComments = function(searchCriteria) {
    let deferred = $q.defer();
      networkService.post(configService.getUrl("createpolicyworkflow.searchComments"), searchCriteria, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
  };

  var getnotifications = function(searchCriteria) {
    let deferred = $q.defer();
      networkService.post(configService.getUrl("getPolicyWorkflow.notifications"), searchCriteria, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
  };

  var markNotificationAsRead = function(id) {
    let deferred = $q.defer();
    networkService.post(configService.getUrl("getPolicyWorkflow.notifications.markAsRead") + id, null, function(data) {
      deferred.resolve(data);
    });
      return deferred.promise;
  };

  return {
    getPolicies: getPolicies,
    getPolicyById: getPolicyById,
    getPoliciesById: getPoliciesById,
    retrieveSearchOption: retrieveSearchOption,
    retrieveAvailableTags: retrieveAvailableTags,
    addTag: addTag,
    getTagById: getTagById,
    getDataTypes: getDataTypes,
    getDataTypeById: getDataTypeById,
    getSavedSearch: getSavedSearch,
    delSavedSearch: delSavedSearch,
    saveSearch: saveSearch,
    savePolicy: savePolicy,
    saveSubPolicy: saveSubPolicy,
    modifyPolicy: modifyPolicy,
    delPolicy: delPolicy,
    bulkDelPolicy: bulkDelPolicy,
    clonePolicy: clonePolicy,
    migratePolicy: migratePolicy,
    getPolicyHierarchy: getPolicyHierarchy,
    getPolicyHistory: getPolicyHistory,
    getPolicyRevision: getPolicyRevision,
    revertToRevision: revertToRevision,
    policyStatus: policyStatus,
    validateExpression: validateExpression,
    deploy: deploy,
    deployPolicy: deployPolicy,
    deactivatePolicy: deactivatePolicy,
    saveAndDeploy: saveAndDeploy,
    saveAndDeploySubPolicy: saveAndDeploySubPolicy,
    validateAndDeploy: validateAndDeploy,
    importFromFile: importFromFile,
    getPoliciesExportingLink: getPoliciesExportingLink,
    getPoliciesExportingLinkForAll: getPoliciesExportingLinkForAll,
    getPoliciesExportingOptions : getPoliciesExportingOptions,
    getFileAsBlob: getFileAsBlob,
    getPoliciesPDFLink: getPoliciesPDFLink,
    getPoliciesXACMLLink: getPoliciesXACMLLink,
    parseAuthorities: parseAuthorities,
    submitPolicy: submitPolicy,
    approvePolicyWorkflow: approvePolicyWorkflow,
    returnPolicyWorkflow: returnPolicyWorkflow,
    getPolicyWorkflowById: getPolicyWorkflowById,
    bulkDeactivatePolicy: bulkDeactivatePolicy,
    addComment: addComment,
    getComments: getComments,
    getnotifications:getnotifications,
    markNotificationAsRead: markNotificationAsRead
  }
}]);
