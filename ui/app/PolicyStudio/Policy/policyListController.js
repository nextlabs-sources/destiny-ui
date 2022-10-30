policyStudio.controller('PolicyListController', ['$scope', '$http', '$state', 'policyService', 'folderService', 'loggerService', '$window', '$stateParams',
  '$uibModal', 'autoCloseOptionService', 'dialogService', '$filter', 'viewCacheService', 'userService', 'configService', '$q', '$timeout', 'environmentService',
  function (
    $scope,
    $http, $state, policyService, folderService,
    loggerService, $window, $stateParams, $uibModal, autoCloseOptionService, dialogService, $filter, viewCacheService, userService, configService, $q, $timeout, environmentService) {
    $scope.instantSearch = configService.configObject.instantSearch;
    $scope.$parent.$parent.isCreatePage = false;
    $scope.folders = {
      tree: folderService.getPolicyFoldersTree(),
      list: folderService.getPolicyFoldersList(),
      open: folderService.isPolicyFoldersOpen(),
      selectedFolder: folderService.getSelectedPolicyFolder()
    }

    var cachedCriteria = viewCacheService.getCachedView("PS-POLICY-LIST");

    $scope.policyTotal = 0;

    var logger = loggerService.getLogger();

    $state.current.pageTitle = $filter('translate')("policylist.title.PolicyManagement");
    userService.getPermissions('POLICY', function(permissions) {
      $scope.permissions = permissions;
    });
    userService.getPermissions('REMOTE_ENVIRONMENT', function(permissions) {
      $scope.environmentPermissions = permissions;
    });
    userService.getPermissions('POLICY_FOLDER', function(permissions) {
      for(let attrName in permissions) {
        $scope.permissions[attrName] = permissions[attrName];
      }
    });
    userService.goBackIfAccessDeniedToApp('PolicyStudio.Policies');

    $scope.selectFolder = function (selectedFolder) {
      $scope.folders.selectedFolder = selectedFolder;
      folderService.setSelectedPolicyFolder($scope.folders.selectedFolder);
      $scope.refreshPolicyList();
    };

    $scope.refreshFolders = function () {
      if ($scope.permissions.VIEW_POLICY_FOLDER.rowLevel.result) {
        folderService.refreshFolders('policy', function () {
          $scope.folders.tree = folderService.getPolicyFoldersTree();
          $scope.folders.list = folderService.getPolicyFoldersList();
          $scope.folders.selectedFolder = folderService.getSelectedPolicyFolder();
          folderService.setPolicyFoldersOpen($scope.folders.open);
          if ($scope.folders.open) {
            if ($scope.folderStates) {
              angular.forEach($scope.folders.list, function(folder){
                angular.forEach($scope.folderStates, function(state){
                  if (folder.id === state.id) {
                    folder.collapsed = state.state
                  }
                });
              });
            } 
            if(!$scope.folderStates){
              angular.forEach($scope.folders.list, function(folder){
                if (folder.id !== -1){
                  folder.collapsed = true
                }
              });
            }
            $scope.openFolder($scope.folders.selectedFolder);
          }
          angular.forEach($scope.folders.list, function (folder) {
            for (i = 0; i < folder.authorities.length; i++) {
              if (!$scope.permissions[folder.authorities[i].authority].rowLevel.result) {
                delete folder.authorities[i];
              }
            }
            folder.authoritiesParsed = folderService.parseAuthorities(folder, $scope.permissions);
          });
        });
      }
    }
    
      //return 'data-ng-disabled = "true" ui-sref-if="true" ui-sref-val="PolicyStudio.createPolicy"'
    var searchReq = {};

    $scope.refreshPolicyList = function() {
        $scope.policyList = [];
        $scope.policyTotal = 0;
        $scope.checkStatus.allPolicyChecked = false;
        $scope.checkStatus.hasPolicyChecked = false;
        $scope.checkStatus.hasFolderChecked = false;
        // Set custom date range
        if($scope.searchCriteria.modifiedDate.name == 'CUSTOM'
          && $scope.tempCustomDate.modifiedFrom
          && $scope.tempCustomDate.modifiedTo) {
          $scope.searchCriteria.modifiedFrom = $scope.tempCustomDate.modifiedFrom;
          $scope.searchCriteria.modifiedTo = $scope.tempCustomDate.modifiedTo;
        }
        searchReq = angular.copy($scope.searchCriteria)
        folderService.setPolicyFoldersOpen($scope.folders.open);
        if($scope.folders.open) {
          searchReq.folderId = $scope.folders.selectedFolder ? $scope.folders.selectedFolder.id : -1;
        } else {
          delete searchReq.folderId;
        }
        if ($scope.permissions.VIEW_POLICY.rowLevel.result) {
          policyService.getPolicies(searchReq, 0, function (policyList) {
            $scope.policyList = policyList.data;
            $scope.policyTotal = policyList.totalNoOfRecords;
            angular.forEach($scope.policyList, function (policy) {
              for (i = 0; i < policy.authorities.length; i++) {
                if (!$scope.permissions[policy.authorities[i].authority].rowLevel.result) {
                  delete policy.authorities[i]
                }
              }
              policy.externalStatus = policyService.policyStatus(policy);
              policy.deploymentStatus = policy.deployed ?
                (policy.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
                : (policy.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
              policy.authoritiesParsed = policyService.parseAuthorities(policy, $scope.permissions);
              policy.parentPolicy && (policy.parentPolicy.authoritiesParsed = policyService.parseAuthorities(policy.parentPolicy, $scope.permissions));
            });
            // $scope.updateSubpolicyLabel();
            $scope.updateSubpolicyLabel();
          });
        }
      }
      // $scope.refreshPolicyList();
    $scope.checkStatus = {
      allPolicyChecked: false, 
      hasPolicyChecked: false,
      hasFolderChecked: false  
    }
    $scope.show_search = false;
    $scope.searchCriteria = {
      status: [],
      effect: [],
      workflowStatus: [],
      tags: [],
      modifiedDate: {},
      modifiedFrom: null,
      modifiedTo: null,
      text: null,
      withSubpolicies: true,
      otherOption: null,
      sortBy: null
    };

    var criteriaPristine = function(criteria) {
      return !criteria.workflowStatus.length && !criteria.status.length && !criteria.effect.length && !criteria.tags.length && !criteria.text && criteria.withSubpolicies && !criteria.onlyEmptyComponents && !criteria.modifiedDate.name;
    }
    $scope.tempCustomDate = {};
    $scope.searchCriteria.pristine = true;
    $scope.checkAllPolicy = function(checked) {
      $scope.checkStatus.hasPolicyChecked = checked;
      $scope.checkStatus.hasFolderChecked = checked;
      angular.forEach($scope.policyList, function(item) {
        item.checked = checked;
      });
      if ($scope.folders.open) {
        let foldersInView = $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree;
        angular.forEach(foldersInView, function (item) {
          item.checked = checked;
        });
      }
      $scope.policyCheckStatusChange();
    };
    $scope.policyCheckStatusChange = function() {
      var allPolicyChecked = true;
      var hasPolicyChecked = false;
      var hasParentPolicyChecked = false;
      var hasFolderChecked = false;
      var allCheckedItemDeletable = true;
      var allCheckedItemDeployable = true;
      var allCheckedItemMoveable = true;
      angular.forEach($scope.policyList, function(item) {
        allPolicyChecked = allPolicyChecked && item.checked;
        hasPolicyChecked = hasPolicyChecked || item.checked;
        hasParentPolicyChecked = hasParentPolicyChecked || (!item.hasParent && item.checked);
        item.checked && (allCheckedItemDeletable = allCheckedItemDeletable && item.authoritiesParsed.DELETE_POLICY);
        item.checked && (allCheckedItemDeployable = allCheckedItemDeployable && item.authoritiesParsed.DEPLOY_POLICY);
        item.checked && (allCheckedItemMoveable = allCheckedItemMoveable && item.authoritiesParsed.MOVE_POLICY);
      });
      if ($scope.folders.open) {
        let foldersInView = $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree;
        angular.forEach(foldersInView, function (item) {
          allPolicyChecked = allPolicyChecked && item.checked;
          hasFolderChecked = hasFolderChecked || item.checked;
          item.checked && (allCheckedItemDeletable = allCheckedItemDeletable && item.authoritiesParsed.DELETE_POLICY_FOLDER);
          item.checked && (allCheckedItemMoveable = allCheckedItemMoveable && item.authoritiesParsed.MOVE_POLICY_FOLDER);
        });
      }
      $scope.checkStatus.allPolicyChecked = allPolicyChecked;
      $scope.checkStatus.hasPolicyChecked = hasPolicyChecked;
      $scope.checkStatus.hasParentPolicyChecked = hasParentPolicyChecked;
      $scope.checkStatus.hasFolderChecked = hasFolderChecked;
      $scope.checkStatus.allCheckedItemDeletable = allCheckedItemDeletable;
      $scope.checkStatus.allCheckedItemDeployable = allCheckedItemDeployable;
      $scope.checkStatus.allCheckedItemMoveable = allCheckedItemMoveable;
    };

    var policyWithOpenOption = [];

    $scope.closeAllOpenOption = function() {
      if (policyWithOpenOption.length > 0) {
        angular.forEach(policyWithOpenOption, function(policy) {
          logger.log(policy)
          if (policy.optionOpen)
            policy.optionOpen = false;
        });
        policyWithOpenOption = [];
      }
    }
    $scope.openOption = function(policy, open, $event) {
      if (angular.isDefined(open)) {
        policy.optionOpen = open;
        if (open) {
          $scope.closeAllOpenOption();
          autoCloseOptionService.close();
          autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
          policyWithOpenOption.push(policy);
        } else {
          policyWithOpenOption = [];
        }
      } else return angular.isDefined(policy.optionOpen) ? policy.optionOpen : false;
    };
    $scope.editPolicy = function(policy) {
      loggerService.getLogger().log('edit policy:', policy, 1);
      //    policyService.setPolicyID(policy.id);
      $state.go('PolicyStudio.editPolicy', {
        policyId: policy.id
      });
      closeSockConnection()
    };
    $scope.showSubpolicy = function(policy) {
      if (policy.subPoliciesLoaded) {
        policy.showsubpolicy = true;
        return;
      }
      loggerService.getLogger().log('get subpolicies for policy:' + policy.id, 1);
      var idList = policy.subPolicies.map(function(p) {
        return String(p.id)
      });
      policy.subPolicies = [];
      policyService.getPoliciesById(idList, function(subPolicies) {
        policy.subPoliciesLoaded = true;
        angular.forEach(subPolicies.data, function(subpolicy) {
          policy.subPolicies.push(subpolicy);
          subpolicy.externalStatus = policyService.policyStatus(subpolicy);
          subpolicy.deploymentStatus = subpolicy.deployed ?
              (subpolicy.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
              : (subpolicy.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
          subpolicy.authoritiesParsed = policyService.parseAuthorities(subpolicy, $scope.permissions);
        });
      });
      policy.showsubpolicy = true;
    };
    $scope.hideSubpolicy = function(policy) {
      policy.showsubpolicy = false;
    };

    var _getNewPolicyListTimer = null;

    $scope.applySearch = function() {
      loggerService.getLogger().log('manually refresh');
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshPolicyList();
    }
    
    $scope.loadMore = function() {
      // loggerService.getLogger().log('loadMore');
      $scope.checkStatus.allPolicyChecked = false;
      policyService.getPolicies(searchReq, $scope.policyList.length, function(policyList) {
        $scope.policyList = $scope.policyList.concat(policyList.data);
        $scope.policyTotal = policyList.totalNoOfRecords;
        angular.forEach(policyList.data, function(policy) {
          policy.externalStatus = policyService.policyStatus(policy);
          policy.deploymentStatus = policy.deployed ?
              (policy.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
              : (policy.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
          policy.authoritiesParsed = policyService.parseAuthorities(policy, $scope.permissions);
          policy.parentPolicy && (policy.parentPolicy.authoritiesParsed = policyService.parseAuthorities(policy.parentPolicy, $scope.permissions));
        });
      });
    };
    // a flag to indicate the window size is changed, to trigger angular's watch
    // $scope.windowResizedPlaceHolder = true;
    $scope.subpolicyTitleTempWidth = 0;
    $scope.updateSubpolicyLabel = function(basedOnWindowResize) {
      // return;
      logger.log('updateSubpolicyLabel', 'window resized?', basedOnWindowResize);
      var temp = $('<span/>').addClass('cc-ps-subpolicy-title-temp').css('background-color', 'transparent').css('color', 'transparent');
      $('*:eq(0)').append(temp);
      // loggerService.getLogger().log($scope.subpolicyTitleTempWidth ,temp.width())
      if (basedOnWindowResize && $scope.subpolicyTitleTempWidth == temp.width()) {
        $('.cc-ps-subpolicy-title-temp').remove();
        return;
      }
      maxwidth = temp.css('width');
      maxwidth = parseInt(maxwidth.substring(0, maxwidth.length - 2));
      $scope.subpolicyTitleTempWidth = temp.width();
      temp.css('display', 'inline');
      angular.forEach($scope.policyList, function(policy) {
        if (!angular.isArray(policy.subPolicies)) return;
        temp.html('');
        var remaining = policy.subPolicies.length;
        // var content = '';
        policy.subpolicyTitleHide = "-hide";
        angular.forEach(policy.subPolicies, function(subPolicy) {
          var lengthAfter = length + subPolicy.name.length;
          if (length > 0) {
            temp.text(temp.text() + ', ');
            // content += ', ';
          }
          if (temp.width() < maxwidth) remaining--;
          // content += subPolicy.name;
          temp.text(temp.text() + subPolicy.name);
          // loggerService.getLogger().log(temp.width(),temp.css('width'), remaining, temp.text());
          length = lengthAfter;
        });
        if (remaining > 0) {
          policy.moreLabel = '+' + remaining + ' more';
          policy.subpolicyTitleHide = null;
        }
      });
      temp.remove();
    }
    $scope.$watch(function() {
      return $scope.windowResizedPlaceHolder;
    }, function(newValue, oldValue) {
      $scope.updateSubpolicyLabel(true);
    }, true);
    $scope.$watch(function() {
      return $scope.policyList;
    }, function(newValue, oldValue) {
      $scope.updateSubpolicyLabel();
    }, true);

    var _windowResizeTimer = null;

    $(window).resize(function() {
      clearTimeout(_windowResizeTimer);
      _windowResizeTimer = setTimeout(function() {
        $scope.$apply(function() {
          $scope.windowResizedPlaceHolder = !$scope.windowResizedPlaceHolder;
        });
      }, 200);
    });
    $scope.resetSavedSearchTitle = function() {
      $scope.searchCriteria.$_nameDisplay = $filter('translate')("policylist.title.savedSearches");
      $scope.searchCriteria.name = null;
    }
    $scope.resetSavedSearchTitle();

    var resetSearchCriteria = function() {
      $scope.searchCriteria.sortBy = $scope.getPolicySortBy();

      $scope.searchSet = null;
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        effect.$_checked = false;
      });
      angular.forEach($scope.searchOptions.statusOptions, function(status) {
        status.$_checked = false;
      });
      angular.forEach($scope.searchOptions.workflowStatusOptions, function(status) {
        status.$_checked = false;
      });
      angular.forEach($scope.searchOptions.modifiedDateOptions, function(date) {
        date.$_checked = false;
      });
      $scope.searchOptions.$noTagChecked = false;
      angular.forEach($scope.searchOptions.tagOptions, function(tag) {
        tag.$_checked = false;
      });
      $scope.searchCriteria.modifiedDate = {};
      $scope.searchCriteria.withSubpolicies = true;
      $scope.searchCriteria.text = null;
      /*$scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];*/
      $scope.isCustomPeriodSelected = false;
      angular.forEach($scope.searchOptions.moreOptions, function(option) {
        option.open = false;
      });
      $scope.statusChanged();
      $scope.workflowStatusChanged();
      // $scope.updateStatus();
      $scope.effectChanged();
      // $scope.updateEffect();
      $scope.tagChanged();
      // $scope.updateTag();
    };

     $scope.setPolicySortBy = function(sort) {
        $scope.searchCriteria.sortBy = sort;
        localStorage.setItem('policy.sortBy', JSON.stringify(sort));
    };

    $scope.getPolicySortBy = function() {
        return localStorage.getItem('policy.sortBy') === null ? $scope.searchOptions.sortOptions[0] : JSON.parse(localStorage.getItem('policy.sortBy'));
    }

    // $scope.searchOptions.$allStatusChecked = false;
    // $scope.searchOptions.$allEffectChecked = false;
    $scope.searchOptions = {
      statusOptions: [],
      workflowStatusOptions: [],
      effectOptions: [],
      sortOptions: [],
      modifiedDateOptions: [],
      moreOptions: [],
      $allStatusChecked: false,
      $allWorkflowStatusChecked: false,
      $allEffectChecked: false,
      $noTagChecked: false,
      $allTagChecked: false
    };
    $scope.searchOptions.statusLabel = '';
    $scope.searchOptions.workflowStatusLabel = '';
    $scope.searchOptions.effectLabel = '';
    $scope.searchOptions.tagLabel = '';

    var searchArgsPromises = [];

    searchArgsPromises.push(policyService.retrieveSearchOption(function(searchOptions) {
      $scope.searchOptions.statusOptions = searchOptions.data.statusOptions;
      $scope.searchOptions.workflowStatusOptions = searchOptions.data.workflowStatusOptions;
      $scope.searchOptions.effectOptions = searchOptions.data.policyEffectOptions;
      $scope.searchOptions.modifiedDateOptions = searchOptions.data.modifiedDateOptions;
      $scope.searchOptions.specialModifiedDateOption = {
        $_checked: true
      };
      $scope.searchOptions.sortOptions = searchOptions.data.sortOptions;
      $scope.searchOptions.moreOptions = searchOptions.data.moreFieldOptions;
      angular.forEach($scope.searchOptions.moreOptions, function(option) {
        option.open = false;
      })
      $scope.updateModifiedDate();
    }));

    searchArgsPromises.push(policyService.retrieveAvailableTags(function(tagOptions) {
      $scope.searchOptions.tagOptions = tagOptions.data;
    }));

    $q.all(searchArgsPromises).then(function() {
      // $scope.tagOptions = searchOptions.data;
      // resetSearchCriteria();
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      if(cachedCriteria){
        $scope.resetSavedSearchTitle();
        $scope.setSearch(cachedCriteria);
        // $scope.statusChanged();
        // $scope.updateStatus();
        // $scope.effectChanged();
        // $scope.updateEffect();
        // $scope.tagChanged();
        // $scope.updateTag();
      } else resetSearchCriteria();
      $scope.refreshPolicyList();
      $scope.$watch(function() {
        return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
      }, function(newValue, oldValue) {
        if (newValue === oldValue) {
          return
        }
        loggerService.getLogger().log('should get new policy list now.', 1);
        // loggerService.getLogger().log(newValue, 1);
        // clearTimeout(_getNewPolicyListTimer);
        // _getNewPolicyListTimer = setTimeout(function() {
        $scope.refreshPolicyList();
        // }, 100);
      }, true);
    });

    $scope.tagLimitation = 100;

    $scope.loadMoreTag = function() {
      $scope.tagLimitation += 100;
    }

    policyService.getSavedSearch(function(savedSearch) {
      loggerService.getLogger().log('getSavedSearch');
      $scope.savedSearchList = savedSearch.data;
    });

    $scope.searchNameDefined = function(name, description) {
      // loggerService.getLogger().log('search name is ', name);
      $scope.searchCriteria.name = name;
      $scope.searchCriteria.description = description;
      policyService.saveSearch($scope.searchCriteria, function(data) {
        var savedId = data.data;
        policyService.getSavedSearch(function(savedSearch) {
          loggerService.getLogger().log('getSavedSearch');
          $scope.savedSearchList = savedSearch.data;
          angular.forEach($scope.savedSearchList, function(search) {
            if (search.id == savedId)
              $scope.setSearch(search)
          });
        }); 
        // dialogService.notify({
        //   msg: $filter('translate')('policylist.search.saved.notify')
        // });
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('policylist.search.saved.notify'),
          timeout:5000
        });
      });
    }

    var searchNameDefined = $scope.searchNameDefined;

    $scope.saveSearch = function() {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/partials/save-search-modal.html',
        controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
          $scope.ok = function() {
            $uibModalInstance.dismiss('cancel');
            searchNameDefined($scope.name, $scope.description);
          };
          $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
          };
        }]
      });
    };

    $scope.clearSearch = function(notrefresh) {
      resetSearchCriteria();
      $scope.policySearchForm && $scope.policySearchForm.$setPristine();
      $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.name = null;
      $scope.searchOptions.specialModifiedDateOption.$_checked = true;
      $scope.resetSavedSearchTitle();
      $scope.updateCustomPeriod(undefined);
      $scope.updateModifiedDate();
      !notrefresh && $scope.refreshPolicyList();
    };

    $scope.setDirty = function() {
      // $scope.searchCriteria.pristine = false;
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      // $scope.searchCriteria.name = null;
      $scope.resetSavedSearchTitle();
    };

    $scope.tags = [];

    $scope.searchSet = null;

    $scope.setSearch = function(search) {
      loggerService.getLogger().log('setSearch:', search, 1)
      $scope.clearSearch(true);
      $scope.searchSet = search;
      // $scope.savedSarchTitle = search.name;
      search.name && ($scope.searchCriteria.name = search.name);
      search.name && ($scope.searchCriteria.$_nameDisplay = search.name);
      // $scope.searchCriteria.name = search.name;
      angular.forEach(search.criteria.fields, function(field) {
        switch (field.field) {
          case 'effectType':
            angular.forEach($scope.searchOptions.effectOptions, function(effect) {
              effect.$_checked = false;
              switch (field.type) {
                case 'MULTI_EXACT_MATCH':
                  angular.forEach(field.value.value, function(fieldEffect) {
                    if (effect.name == fieldEffect) {
                      effect.$_checked = true;
                    }
                  });
                  break;
                case 'SINGLE':
                  if (effect.name == field.value.value) {
                    effect.$_checked = true;
                  }
                  break;
              }
            });
            $scope.effectChanged();
            // $scope.updateEffect();
            break;
          case 'status':
            angular.forEach($scope.searchOptions.statusOptions, function(status) {
              status.$_checked = false;
              switch (field.type) {
                case 'MULTI':
                  angular.forEach(field.value.value, function(fieldStatus) {
                    if (status.name == fieldStatus) {
                      status.$_checked = true;
                    }
                  });
                  break;
                case 'SINGLE':
                  if (status.name == field.value.value) {
                    status.$_checked = true;
                  }
                  break;
              }
            });
            $scope.statusChanged();
            // $scope.updateStatus();
            break;
            case 'activeWorkflowRequestLevelStatus':
              angular.forEach($scope.searchOptions.workflowStatusOptions, function(status) {
                status.$_checked = false;
                switch (field.type) {
                  case 'MULTI':
                    angular.forEach(field.value.value, function(fieldStatus) {
                      if (status.name == fieldStatus) {
                        status.$_checked = true;
                      }
                    });
                    break;
                  case 'SINGLE':
                    if (status.name == field.value.value) {
                      status.$_checked = true;
                    }
                    break;
                }
              });
              $scope.workflowStatusChanged();
              // $scope.updateStatus();
              break;
              
          case 'tags':
            $scope.searchOptions.$noTagChecked = field.value.value.length == 0; 
            angular.forEach($scope.searchOptions.tagOptions, function(tag) {
              tag.$_checked = false;
              angular.forEach(field.value.value, function(fieldModifiedDate) {
                if (tag.key == fieldModifiedDate) {
                  tag.$_checked = true;
                }
              });
            });
            $scope.tagChanged();
            // $scope.updateTag();
            break;
          case 'text':
            $scope.searchCriteria.text = field.value.value;
            break;
          case 'hasParent':
            $scope.searchCriteria.withSubpolicies = field.value.value == 'true';
            break;
          case 'lastUpdatedDate':
            // $scope.searchOptions.specialModifiedDateOption.$_checked = true;
            $scope.updateCustomPeriod($scope.searchOptions.specialModifiedDateOption);
            $scope.checkModifiedDate($scope.searchOptions.specialModifiedDateOption);
            angular.forEach($scope.searchOptions.modifiedDateOptions, function(option) {
              option.$_checked = false;
              if (option.name == field.value.dateOption) {
                option.$_checked = true;
                $scope.updateCustomPeriod(option);
                $scope.checkModifiedDate(option);
              }
            });
            if (field.value.dateOption == 'CUSTOM') {
              $scope.tempCustomDate.modifiedFrom = new Date(field.value.fromDate);
              $scope.tempCustomDate.modifiedTo = new Date(field.value.toDate);
              $scope.tempCustomDate.modifiedTo.setDate($scope.tempCustomDate.modifiedTo.getDate() - 1);
            }
            // $scope.modifiedDateChanged();
            $scope.updateModifiedDate();
            break;
        }
      });
      /*if (angular.isArray(search.criteria.sortFields) && search.criteria.sortFields.length > 0) {
        angular.forEach(policyService.searchOptions.sortOptions, function(sortOption) {
          if (sortOption.name == search.criteria.sortFields[0].field) $scope.searchCriteria.sortBy = sortOption;
        });
      }*/
      // $scope.refreshCriteria();
      // $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.folders.open = folderService.isPolicyFoldersOpen();
      $scope.refreshFolders();
      $scope.refreshPolicyList();
    };
    $scope.checkModifiedDate = function(modifiedDate) {
      $scope.searchOptions.specialModifiedDateOption.$_checked = false;
      angular.forEach($scope.searchOptions.modifiedDateOptions, function(aModifiedDate) {
        aModifiedDate.$_checked = false;
      });
      modifiedDate && (modifiedDate.$_checked = true);
      $scope.updateModifiedDate();
      // $scope.setDirty();
      $scope.modified_search_open=false;
    };

    $scope.isCustomPeriodSelected = false;

    var updateCustomPeriodTimer = null;

    $scope.updateCustomPeriod = function(option, $event) {
      if (!option) {
        $scope.isCustomPeriodSelected = false;
        return;
      } else {
        if (option.name == "CUSTOM") $scope.isCustomPeriodSelected = true;
        else $scope.isCustomPeriodSelected = false;
      }
      // clearTimeout(updateCustomPeriodTimer);
      // updateCustomPeriodTimer = setTimeout(function(){
      //   $($event.target).click();
      // }, 50);
    }
    $scope.updateStatus = function() {
      $scope.searchCriteria.status = [];
      angular.forEach($scope.searchOptions.statusOptions, function(status) {
        if (status.$_checked) $scope.searchCriteria.status.push(status);
      });
      // $scope.refreshCriteria();
      if ($scope.searchOptions.$allStatusChecked) {
        $scope.searchOptions.statusLabel = $filter('translate')('policysearch.title.AllStatus');
      } else {
        $scope.searchOptions.statusLabel = '';
        angular.forEach($scope.searchCriteria.status, function(status, index) {
          if (index > 0) $scope.searchOptions.statusLabel += ', ';
          if($scope.isWorkFlowActive){
            if(status.label === "Deactivated"){
              status.label = "Inactive"
            }
          }
          $scope.searchOptions.statusLabel += status.label;
        });
      }
    };
    $scope.allStatusChanged = function() {
      angular.forEach($scope.searchOptions.statusOptions, function(status) {
        status.$_checked = !$scope.searchOptions.$allStatusChecked;
      });
      $scope.statusChanged();
    };
    $scope.statusChanged = function() {
      var allStatusChecked = true;
      angular.forEach($scope.searchOptions.statusOptions, function(status) {
        allStatusChecked = allStatusChecked && !status.$_checked;
      });
      $scope.searchOptions.$allStatusChecked = allStatusChecked;
      $scope.updateStatus();
      // $scope.setDirty();
      $scope.status_search_open = false;

    };

    $scope.updateWorkflowStatus = function() {
      $scope.searchCriteria.workflowStatus = [];
      angular.forEach($scope.searchOptions.workflowStatusOptions, function(status) {
        if (status.$_checked) $scope.searchCriteria.workflowStatus.push(status);
      });
      // $scope.refreshCriteria();
      if ($scope.searchOptions.$allWorkflowStatusChecked) {
        $scope.searchOptions.workflowStatusLabel = $filter('translate')('policysearch.title.AllStatus.workflow');
      } else {
        $scope.searchOptions.workflowStatusLabel = '';
        angular.forEach($scope.searchCriteria.workflowStatus, function(status, index) {
          if (index > 0) $scope.searchOptions.workflowStatusLabel += ', ';
          $scope.searchOptions.workflowStatusLabel += status.label;
        });
      }
    };
    $scope.allWorkflowStatusChanged = function() {
      angular.forEach($scope.searchOptions.workflowStatusOptions, function(status) {
        status.$_checked = !$scope.searchOptions.$allWorkflowStatusChecked;
      });
      $scope.workflowStatusChanged();
    };
    $scope.workflowStatusChanged = function() {
      var allWorkflowStatusChecked = true;
      angular.forEach($scope.searchOptions.workflowStatusOptions, function(status) {
        allWorkflowStatusChecked = allWorkflowStatusChecked && !status.$_checked;
      });
      $scope.searchOptions.$allWorkflowStatusChecked = allWorkflowStatusChecked;
      $scope.updateWorkflowStatus();
      $scope.workflow_status_search_open = false;
    };
    $scope.updateEffect = function() {
      $scope.searchCriteria.effect = [];
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        if (effect.$_checked) $scope.searchCriteria.effect.push(effect);
      });
      // $scope.refreshCriteria();
      // loggerService.getLogger().log(angular.toJson($scope.searchOptions.effectOptions, true));
      if ($scope.searchOptions.$allEffectChecked) {
        $scope.searchOptions.effectLabel = $filter('translate')('policysearch.title.AllEffect');
      } else {
        $scope.searchOptions.effectLabel = '';
        angular.forEach($scope.searchCriteria.effect, function(effect, index) {
          if (index > 0) $scope.searchOptions.effectLabel += ', ';
          $scope.searchOptions.effectLabel += effect.label;
        });
      }
    };
    $scope.allEffectChanged = function() {
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        effect.$_checked = !$scope.searchOptions.$allEffectChecked;
      });
      $scope.effectChanged();
    };
    $scope.effectChanged = function() {
      var allEffectChecked = true;
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        allEffectChecked = allEffectChecked && !effect.$_checked;
      });
      $scope.searchOptions.$allEffectChecked = allEffectChecked;
      $scope.updateEffect();
      // $scope.setDirty();
      $scope.effect_search_open=false;
    };
    $scope.updateTag = function() {
      $scope.searchCriteria.tags = [];
      angular.forEach($scope.searchOptions.tagOptions, function(tag) {
        if (tag.$_checked) $scope.searchCriteria.tags.push(tag);
      });
      // $scope.refreshCriteria();
      if ($scope.searchOptions.$allTagChecked) {
        $scope.searchOptions.tagLabel = $filter('translate')('policysearch.title.AllTags');
      } else if($scope.searchOptions.$noTagChecked) {
        $scope.searchOptions.tagLabel = $filter('translate')('policysearch.title.NoTags');
        $scope.searchCriteria.tags.push($filter('translate')("policysearch.title.NoTags"));
      } else {
        $scope.searchOptions.tagLabel = '';
        angular.forEach($scope.searchCriteria.tags, function(tag, index) {
          if (index > 0) $scope.searchOptions.tagLabel += ', ';
          $scope.searchOptions.tagLabel += tag.label;
        });
      }
    };
    $scope.allTagChanged = function() {
      angular.forEach($scope.searchOptions.tagOptions, function(tag) {
        tag.$_checked = !$scope.searchOptions.$allTagChecked;
      });
      $scope.searchOptions.$noTagChecked = !$scope.searchOptions.$allTagChecked;
      $scope.tagChanged();
    };
    $scope.noTagChanged = function() {
      $scope.searchOptions.$allTagChecked = !$scope.searchOptions.$noTagChecked;
      if ($scope.searchOptions.$noTagChecked) {
        angular.forEach($scope.searchOptions.tagOptions, function(tag) {
          tag.$_checked = false;
        });
      }
      $scope.tagChanged();
    };
    $scope.tagChanged = function() {
      var noTagChecked = $scope.searchOptions.$noTagChecked;
      var allTagChecked = !noTagChecked;

      angular.forEach($scope.searchOptions.tagOptions, function(tag) {
        allTagChecked = allTagChecked && !tag.$_checked;
        noTagChecked = noTagChecked && !tag.$_checked;
      });
      $scope.searchOptions.$allTagChecked = allTagChecked;
      $scope.searchOptions.$noTagChecked = noTagChecked;
      $scope.updateTag();
      // $scope.setDirty();
      $scope.tags_search_open=false;
    };
    $scope.updateModifiedDate = function() {
      if ($scope.tempCustomDate) {
        $scope.searchCriteria.modifiedFrom = $scope.tempCustomDate.modifiedFrom;
        $scope.searchCriteria.modifiedTo = $scope.tempCustomDate.modifiedTo;
      }
      $scope.searchOptions.modifiedDateLabel = null;
      if ($scope.searchOptions.specialModifiedDateOption.$_checked) $scope.searchOptions.modifiedDateLabel = $filter('translate')("policysearch.label.AnyModifiedDate");
      $scope.searchCriteria.modifiedDate = {};
      angular.forEach($scope.searchOptions.modifiedDateOptions, function(modifiedDate) {
        if (modifiedDate.$_checked) {
          $scope.searchOptions.modifiedDateLabel = modifiedDate.label;
          $scope.searchCriteria.modifiedDate = modifiedDate;
        }
      });
    }
    $scope.delSearch = function(index, $event) {
      dialogService.confirm({
        msg: $filter('translate')('search.del.confirm'),
        ok: function() {
          var search = $scope.savedSearchList[index];
          policyService.delSavedSearch(search, function() {
            $scope.savedSearchList.splice(index, 1);
            if ($scope.searchSet == search) {
              $scope.searchSet = null;
              $scope.resetSavedSearchTitle();
            }
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('search.deleted.notify'),
              timeout:5000
            });

          });
        }
      });
      $event.stopPropagation();
    };


    $scope.delPolicy = function(policy, $event) {
      dialogService.confirm({
        msg: $filter('translate')('policylist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          policyService.delPolicy(policy, function() {
            $scope.refreshPolicyList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('policylist.deleted.notify', {length : 1}),
              timeout:5000
            });
          });
        }
      })
      $event.stopPropagation();
    };

    $scope.bulkDelete = function ($event) {
      dialogService.confirm({
        msg: $filter('translate')('policylist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          let policyIdList = [];
          angular.forEach($scope.policyList, function (item) {
            item.checked && policyIdList.push(item.id);
          });
          if (policyIdList.length > 0) {
            policyService.bulkDelPolicy(policyIdList, function () {
              $scope.refreshPolicyList();
              dialogService.notifyWithoutBlocking({
                msg: $filter('translate')('policylist.deleted.notify', { length: policyIdList.length }),
                timeout: 5000
              });
            });
          }
          let folderIdList = [];
          if ($scope.folders.open) {
            angular.forEach($scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree, function (item) {
              item.checked && folderIdList.push(item.id);
            });
          }
          if (folderIdList.length > 0) {
            folderService.deleteFolders('policy', folderIdList, function (data) {
              if (data.statusCode == 1002) {
                $scope.refreshFolders();
                dialogService.notifyWithoutBlocking({
                  msg: $filter('translate')('policylist.deleted.notify', { length: folderIdList.length }),
                  timeout: 5000
                });
              }
            });
          }
        }
      })
      $event.stopPropagation();
    };

    $scope.clonePolicy = function(policy) {
      policyService.clonePolicy(policy.id, function() {
        $scope.refreshPolicyList();
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('createpolicy.cloned.notify'),
          timeout:5000
        });
      });
    };
    $scope.addSubPolicy = function(policy) {
      loggerService.getLogger().log('add sub policy:', policy);
      $state.go('PolicyStudio.createPolicy', {
        folderId: $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.id : null,
        folderPath: policy.folderPath,
        parentPolicy: policy
      });
    }

    $scope.showImportDialog = function(msg){
      dialogService.notifyWithoutBlocking({
        msg: msg,
        html: true,
        timeout:5000
      });
    }

    var importPolicy = function(mechanism, file, cleanup) {
      policyService.importFromFile(mechanism, file, cleanup, function(response) {
        var msg = response.message;
        response.data.total_policies && (msg += '<br>' + $filter('translate')('policylist.import.policies.imported', {count:response.data.total_policies}));
        response.data.total_components && (msg += '<br>' + $filter('translate')('policylist.import.components.imported', {count:response.data.total_components}));
        response.data.total_policy_models && (msg += '<br>' + $filter('translate')('policylist.import.policymodels.imported', {count:response.data.total_policy_models}));
        $scope.refreshFolders();
        $scope.refreshPolicyList();
        if(response.data.non_blocking_error){
          dialogService.notify({
            msg: $filter('translate')('policylist.import.non_blocking_error'),
            ok: function() {
              dialogService.notifyWithoutBlocking({
                msg: msg,
                html: true,
                timeout:5000
              });
            }
          });
        } else{
          $scope.showImportDialog(msg);
        } 
      })
    }

    $scope.openImportModal = function() {
      var modalScope;
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/PolicyStudio/Policy/partials/import-modal.html',
        controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
          modalScope = $scope;
          $scope.data = {
            mechanism: 'PARTIAL',
            fileToImportName: '',
            cleanup: false
          };
          $scope.setMechanism = function(mechanism) {
            $scope.data.mechanism = mechanism;
          }
          $scope.fileChosen = function($event) {
            $scope.data.fileToImport = $event.target.files[0];
            $scope.data.fileToImportName = $scope.data.fileToImport.name;
            $scope.$digest();
          }
          $scope.import = function() {
            $uibModalInstance.dismiss('cancel');
            importPolicy($scope.data.mechanism, $scope.data.fileToImport, $scope.data.cleanup);
          };
          $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
          };
        }]
      });
      modal.rendered.then(function() {
        var element = document.getElementById('import-file');
        logger.log(element);
        element.addEventListener('change', modalScope.fileChosen);
      })
    };
    $scope.exportSelectedPolicies = function() {
      logger.log('exportSelectedPolicies');
      var exportEntities = [];
      exportEntities = exportEntities.concat($scope.policyList
        .filter(function (item) { return item.checked })
        .map(function (item) { return { entityType: 'POLICY', id: item.id } })
      );
      exportEntities = exportEntities.concat($scope.folders.list
        .filter(function (item) { return item.checked; })
        .map(function (item) { return { entityType: 'FOLDER', id: item.id } })
      );
      
      policyService.getPoliciesExportingOptions(function (data) {
        let exportMode = data.data.sandeEnabled ? $filter('translate')("policylist.export.option.sande") : $filter('translate')("policylist.export.option.plain");
        let plainTextEnabled = data.data.plainTextEnabled;
        policyService.getPoliciesExportingLink(exportMode, plainTextEnabled, exportEntities, function (url) {
          if (navigator.msSaveBlob) {
            policyService.getFileAsBlob(url, function (data) {
              navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
            });
          } else {
            $('#policy-export-download').remove();
            $('<iframe/>', { src: url, id: 'policy-export-download' }).hide().appendTo('body');
          }
        });
      });
    };
    $scope.exportAllPolicies = function () {
      policyService.getPoliciesExportingOptions(function (data) {
        let exportMode = data.data.sandeEnabled ? $filter('translate')("policylist.export.option.sande") : $filter('translate')("policylist.export.option.plain");
        let plainTextEnabled = data.data.plainTextEnabled;
        policyService.getPoliciesExportingLinkForAll(exportMode, plainTextEnabled, function (url) {
          if (navigator.msSaveBlob) {
            policyService.getFileAsBlob(url, function (data) {
              navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
            });
          } else {
            $('#policy-export-download').remove();
            $('<iframe/>', { src: url, id: 'policy-export-download' }).hide().appendTo('body');
          }
        });
      });
    };

    $scope.generatePDF = function() {
      logger.log('generating PDF');
      var exportEntities = [];
      exportEntities = exportEntities.concat($scope.policyList
        .filter(function (item) { return item.checked })
        .map(function (item) { return { entityType: 'POLICY', id: item.id } })
      );
      exportEntities = exportEntities.concat($scope.folders.list
        .filter(function (item) { return item.checked; })
        .map(function (item) { return { entityType: 'FOLDER', id: item.id } })
      );

      policyService.getPoliciesPDFLink(exportEntities, function (response) {
        if(response.statusCode != '1009') {
          dialogService.notify({
            msg: $filter('translate')(response.message),
          })
          return;
        }
        var url = configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data;
        var fileName = response.data;
        if (navigator.msSaveBlob) {
          policyService.getFileAsBlob(url, function (data) {
            navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
          });
        } else {
          //$('#policy-export-download').remove();
         // $('<iframe/>', { src: url, id: 'policy-export-download' }).hide().appendTo('body');
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', url);
        downloadLink.attr('target','_self');
        downloadLink.attr('download', fileName);
        downloadLink[0].click();
        //window.open(url);
        }
        
      });
    };

    $scope.generateXACML = function() {
      logger.log('generating XACML');
      var exportEntities = [];
      exportEntities = exportEntities.concat($scope.policyList
        .filter(function (item) { return item.checked })
        .map(function (item) { return { entityType: 'POLICY', id: item.id } })
      );
      exportEntities = exportEntities.concat($scope.folders.list
        .filter(function (item) { return item.checked; })
        .map(function (item) { return { entityType: 'FOLDER', id: item.id } })
      );

      policyService.getPoliciesXACMLLink(exportEntities, function (response) {
        if(response.statusCode != '1009') {
          dialogService.notify({
            msg: $filter('translate')(response.message),
          })
          return;
        }
        var url = configService.configObject['policyStudio'].url['online'].rootContext + 'exports/Policy/' + response.data;
        var fileName = response.data;
        if (navigator.msSaveBlob) {
          policyService.getFileAsBlob(url, function (data) {
            navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
          });
        } else {
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', url);
        downloadLink.attr('target','_self');
        downloadLink.attr('download', fileName);
        downloadLink[0].click();
        }
        
      });
    };

    $scope.showPolicyDeploymentOutcomeNotification = function (response, push) {
      $scope.refreshPolicyList()
      var failures = 0
      var messageType = "success"
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
                message += "<br/>" + $filter("translate")("policylist.deploy.notify.pushFailures") + "<ul>"
              }
              message += "<li>" + failedResult.dpsUrl + "</li>"
              if (index == results.length - 1) {
                message += "</ul>"
              }
            })
          if (failures > 0) {
            messageType = failures == response.data[0].pushResults.length ? "error" : "warning"
          }
        }
      }
      dialogService.notifyWithoutBlocking({
        type: messageType,
        msg: message,
        html: true,
        timeout: failures > 0 ? 10000 : 7000
      })
    }

    $scope.deployPolicies = function (policies) {
      policies = policies instanceof Array ? policies : [policies]
      policyService.deploy(policies.map(function (policy) {
        return policy.id
      }), false, false, null, function () {
        $scope.refreshPolicyList()
      })
    }

    $scope.deployApprovedPolicies = function (policies) {
      let workflowProperties = {
        unapprovedPolicies : [],
        approvedPolicies : [],
        workflowstatus: $scope.isWorkFlowActive
      }
      policies = policies instanceof Array ? policies : [policies]
      angular.forEach(policies, function (policy) {
        if (policy.activeEntityWorkflowRequestStatus !== 'APPROVED' && policy.status !== 'APPROVED') {
          workflowProperties.unapprovedPolicies.push(policy.id)
        }
        if (policy.activeEntityWorkflowRequestStatus === 'APPROVED' || policy.status === 'APPROVED') {
          workflowProperties.approvedPolicies.push(policy.id)
        }
      })
      if (!workflowProperties.approvedPolicies.length && workflowProperties.unapprovedPolicies) {
        dialogService.notify({
          msg: $filter('translate')('policy.workflow.selected.unapproved'),
          title: $filter('translate')('deployment.title.deploymentContents'),
        })
      } else {
        policyService.deploy(policies.map(function (policy) {
          return policy.id
        }), false, false, workflowProperties, function () {
          $scope.refreshPolicyList()
        })
      }
    }

    $scope.deploySelectedPolicies = function ($event) {
      if ($scope.isWorkFlowActive) {
        $scope.deployApprovedPolicies($scope.policyList.filter(function (policy) {
          return policy.checked
        }))
      } else {
        $scope.deployPolicies($scope.policyList.filter(function (policy) {
          return policy.checked
        }))
      }
      $event.stopPropagation()
    }

    $scope.deactivatePolicy = function(policy){
      dialogService.confirm({
        msg: $filter('translate')('policylist.deactivate.confirm'),
        ok: function() {
          
          policyService.deactivatePolicy([policy.id], function() {
            
            $scope.refreshPolicyList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('policylist.deactivate.notify'),
              timeout:5000
            });
          });
        },
        confirmLabel:$filter('translate')('DEACTIVATE'),
        cancelLabel:$filter('translate')('CANCEL')
      })
    }
    $scope.getPolicyUIStatus = function(policy){
      if(policy.deployed){
        return 'active';
      }else{
        return 'inactive';
      }
    }

    $scope.openFolder = function (folder) {
      if (folder) {
        folder.pathFolders = [folder];
        folder.parentIds.forEach(function (parentId) {
          let folders = $scope.folders.list.filter(function (folder) {
            return folder.id == parentId;
          });
          if (folders.length > 0) {
            folder.pathFolders.unshift(folders[0]);
            folders[0].collapsed = false;
          }
        });
      }
      $scope.folders.list.forEach(function(folder) {
        folder.checked = false;
      });
      $scope.folders.selectedFolder = folder;
      folderService.setSelectedPolicyFolder(folder);
      $scope.refreshPolicyList();
    }

    $scope.renameFolder = function (folder) {
      folderService.rename(folder, 'POLICY');
    }

    $scope.createFolder = function () {
      folderService.createFolder('POLICY', $scope.folders.selectedFolder, function (created) {
        if (created) {
          $scope.refreshFolders();
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('folders.created.folder.notify'),
            timeout: 5000
          });
        }
      });
    }

    $scope.bulkMove = function () {
      var folderIdList = $scope.folders.list
        .filter(function (item) { return item.checked && item.id > -1; })
        .map(function (item) { return item.id });
  
      var policyIdList = $scope.policyList
      .filter(function (item) { return item.checked; })
      .map(function (item) { return item.id });

      $scope.move(folderIdList, policyIdList);
    }

    $scope.move = function (folderIdList, policyIdList) {
      folderService.move('policy', folderIdList, policyIdList, $scope.refreshFolders, $scope.refreshPolicyList);
    }

    $scope.deleteFolder = function (folder, $event) {
      dialogService.confirm({
        msg: $filter('translate')('policylist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          folderService.deleteFolders('policy', [folder.id], function (data) {
            if (data.statusCode == 1002) {
              $scope.refreshFolders();
              dialogService.notifyWithoutBlocking({
                msg: $filter('translate')('folders.deleted.folder.notify', { length: 1 }),
                timeout: 5000
              });
            }
          });
        }
      })
      $event.stopPropagation();
    };

    $scope.deselectFolders = function () {
      let rootFolder = $scope.folders.tree.filter(function(folder) { return folder.id < 0})[0];
      $scope.folders.selectedFolder = rootFolder;
      folderService.setSelectedPolicyFolder(rootFolder);
      $scope.openFolder(rootFolder)
      $scope.refreshPolicyList();
    };

    $scope.collapseFolders = function () {
      angular.forEach($scope.folders.tree, function(folder){
        folder.collapsed = true
      })
    };

    $scope.resetFolders = function () {
      $scope.folders.selectedFolder = null
    }
    $scope.folderTreeCache = function () {
      $scope.folderStates = $scope.folders.list.map(this.getFolderIDandState)
    }

    $scope.getFolderIDandState = function (folder) {
      var object = {}
      var id = folder.id
      var state = folder.collapsed
      object = { id: id, state:state }
      return object
    }

    $scope.migratePayload = {
      exportEntityDTOS: [{
          entityType : "POLICY",
          id: null
      }],
      destinationEnvId: null
  }

    $scope.environmentSearchCriteria = {
      status: [],
      effect: [],
      modifiedDate: {},
      modifiedFrom: null,
      modifiedTo: null,
      text: null,
      otherOption: null,
      sortBy: null
    };

    $scope.environmentSortOptions = [
      {
        label: "Last Updated",
        name: "lastUpdatedDate",
        order: "DESC",
      },
      {
        label: "Name (A to Z)",
        name: "name",
        order: "ASC"
      },
      {
        label: "Name (Z to A)",
        name: "name",
        order: "DESC"
      }
    ]
    
    var searchReq = {}
    $scope.migrateSelectedPolicies = function () {
      var exportEntitiesDTOS = []
      $scope.environmentSearchCriteria.sortBy = $scope.environmentSortOptions[0]
      exportEntitiesDTOS = exportEntitiesDTOS.concat($scope.policyList
        .filter(function (item) { return item.checked })
        .map(function (item) { return { entityType: 'POLICY', id: item.id } })
      );
      exportEntitiesDTOS = exportEntitiesDTOS.concat($scope.folders.list
        .filter(function (item) { return item.checked; })
        .map(function (item) { return { entityType: 'FOLDER', id: item.id } })
      );

      searchReq = angular.copy($scope.environmentSearchCriteria)
      environmentService.getEnvironment(searchReq, 0, function (environmentList) {
        var modalScope;
        var modal = $uibModal.open({
          animation: true,
          templateUrl: 'ui/app/PolicyStudio/Policy/partials/migrate-modal.html',
          controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
            modalScope = $scope;
            $scope.data = {
              mechanism: 'PARTIAL',
              environments: environmentList.data,
              cleanup: false
            };
            $scope.migratePayload = {
              exportEntityDTOS: exportEntitiesDTOS
            };
            $scope.setMechanism = function(mechanism) {
              $scope.data.mechanism = mechanism;
            }
            $scope.setDestinationEnvironment = function(environment) {
              $scope.data.environment = environment;
            }
            $scope.migrate = function() {
              $uibModalInstance.dismiss('cancel');
              $scope.migratePayload.mechanism = $scope.data.mechanism;
              $scope.migratePayload.cleanup = $scope.data.cleanup;
              $scope.migratePayload.exportEntityDTOS = exportEntitiesDTOS;
              $scope.migratePayload.destinationEnvId = $scope.data.environment.id;
              policyService.migratePolicy($scope.migratePayload, function (response) {
                if (response) {
                  dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')('migration.policy.migrate.success'),
                    timeout: 5000
                  });
                }
              });
            };
            $scope.cancel = function() {
              $uibModalInstance.dismiss('cancel');
            };
          }]
        });
      });
    };

    $scope.notifications = []
    $scope.isNotificationVisible = false
    $scope.showNotification = function () {
      $scope.isNotificationVisible = !$scope.isNotificationVisible
      if ($scope.isNotificationVisible) {
        $scope.enableBackdropClick = true
        if(document.getElementById('notificationDiv')){
          document.getElementById('notificationDiv').style.display = 'block'
        }
      } else { $scope.enableBackdropClick = false }
      if (!$scope.isNotificationVisible) {
        angular.forEach($scope.notifications, function (notification) {
          notification.isNew = false
        })
      }
    }

    $scope.getLine = function (notification) {
      let stringLength = notification.content.length
      if (stringLength <= 60) {
        return "single"
      }
      if (stringLength <= 115) {
        return "double"
      }
      if (stringLength >= 116) {
        return "triple"
      }

      return "single"
    }

    let notificationPayload = {
      "criteria": {
          "fields": [
          ],
          "sortFields": [{
                  "field": "createdDate",
                  "order": "DESC"
              }
          ],
          "pageNo": 0,
          "pageSize": 20
      }
  }

    getnotifications()
    function getnotifications() {
      policyService.getnotifications(notificationPayload).then(function (notifications) {
        $scope.notifications = notifications.data
        let mappedNotifications = $scope.notifications.map(function (notification) {
          let policyWorkflowStatus
          const element = JSON.parse(notification["metadata"])
          let workflowStatus = element.workflowStatus
          policyWorkflowStatus = workflowStatus
          let notificationObj = {
            content: notification.content,
            status: policyWorkflowStatus,
            notified: notification.notified,
            id: notification.notificationId,
            lastUpdatedDate: notification.lastUpdatedDate
          }
          return notificationObj
        })
        let sortedNotification = mappedNotifications.sort(function (x, y) {
          return (x.notified === y.notified) ? 0 : x.notified ? 1 : -1;
        });
        $scope.notifications = sortedNotification
        countNewNotification()
      })
    }

    isWorkflowEnabled()
    $scope.isWorkFlowActive = false
    function isWorkflowEnabled() {
      let isWorkflowEnabled
      configService.getUIConfigs().then(function (uiConfig) {
        isWorkflowEnabled = uiConfig['policy.workflow.enable'];
        if (isWorkflowEnabled === "true") {
          $scope.isWorkFlowActive = true
        } else {
          $scope.isWorkFlowActive = false
        }
      });
    }

    $scope.undeploySelectedPolicies = function ($event) {
      dialogService.confirm({
        msg: $filter('translate')('policylist.deactivate.confirm'),
        ok: function () {
          $scope.undeployPolicies($scope.policyList.filter(function (policy) {
            return policy.checked
          }))
        },
        confirmLabel: $filter('translate')('DEACTIVATE'),
        cancelLabel: $filter('translate')('CANCEL')
      })
      $event.stopPropagation()
    }

    $scope.undeployPolicies = function (policies) {
      policies = policies instanceof Array ? policies : [policies]
      policyService.bulkDeactivatePolicy(policies.map(function (policy) {
        return policy.id
      })).then(function () {
        $scope.refreshPolicyList()
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('policylist.deactivate.notify'),
          timeout: 5000
        })
      }
      )
    }

    $scope.getActiveWorkflowStatusLabel = function (policy) {
      if (policy.activeEntityWorkflowRequestStatus === null) {
        return null
      } else if (policy.activeWorkflowRequestLevelStatus === 'PENDING') {
        return 'IN REVIEW'
      } else if (policy.activeWorkflowRequestLevelStatus === 'REQUESTED_AMENDMENT') {
        return 'PUSH BACK'
      } else if (policy.activeEntityWorkflowRequestStatus === 'APPROVED') {
        return 'APPROVED'
      }
    }

    $scope.isPolicyApproved = function (policy) {
      if($scope.isWorkFlowActive){
        if (policy.activeEntityWorkflowRequestStatus === 'APPROVED'){
          return false
        } else return true
      } else return false
    }

    var sockConnection;
    sock()
    function sock() {
      sockConnection = new SockJS('/console/secured/cc-updates');
      var stompClient = Stomp.over(sockConnection);
      var sessionId = "";

      // disable debug logging
      // this.stompClient.debug = () => {};
      stompClient.connect({}, function (frame) {
        var url = stompClient.ws._transport.url;
        if (url.startsWith("wss")) {
          sessionId = url.match(/^.*\/console\/secured\/cc-updates\/[0-9]+\/(.*?)\/websocket/)[1];
        } else {
          sessionId = url.match(/^.*\/console\/secured\/cc-updates\/[0-9]+\/(.*?)/)[1];
        }
        stompClient.subscribe('/secured/user/queue/notification' + '-user' + sessionId, function (msg) {
          let notificationObj
          let newNotification = JSON.parse(msg.body);
          let policyWorkflowStatus
          const element = JSON.parse(newNotification["metadata"])
          let workflowStatus = element.workflowStatus
          policyWorkflowStatus = workflowStatus
          let newNotificationObj = angular.copy(notificationObj = {
            content: newNotification.content,
            status: policyWorkflowStatus,
            notified: newNotification.notified,
            id: newNotification.notificationId
          })
          $scope.notifications.splice(0, 0, newNotificationObj)
          countNewNotification(true)
        });
      });
    };

    function closeSockConnection() {
      if (sockConnection) {
        sockConnection.close()
      }
    }

    $scope.newNotificationCount = null

    function countNewNotification(digest) {
      let newNotification = $scope.notifications.filter(function (notification) {
        return notification.notified === false;
      });
      $scope.newNotificationCount = newNotification.length
      if (!digest) {
        null
      } else {
        $scope.$digest()
      }
    }

    $scope.notificationNotified = function (notification, index) {
      let line = $scope.getLine(notification)
      let notificationId = "notification-" + index
      if(line === 'triple'){
        notificationItem = "cc-notification-item cc-notification-text-triple-content"
      } else {
        notificationItem = "cc-notification-item"
      }
      policyService.markNotificationAsRead(notification.id).then(function (data) {
        if (document.getElementById(notificationId)) {
          document.getElementById(notificationId).className = notificationItem
          notification.notified = true
          countNewNotification(false)
        }
      })
    }

    $scope.enableBackdropClick = false
    document.onclick = function (div) {
      var notificationDiv = document.getElementById('notificationDiv')
      if ($scope.enableBackdropClick && notificationDiv) {
        if (div.target.id !== 'notificationDiv' && div.target.id !== 'btn-policy-notification' && div.target.id !== 'label-notification-content' && div.target.id !== 'policy-notification-text' && div.target.id !== 'policy-current-status' && div.target.id !== 'policy-text-container' && div.target.id !== 'policy-status-container') {
          if (div.target.className !== 'cc-notification-item' && div.target.className !== 'cc-notification-backdrop ng-scope cc-notification-item' && div.target.className !== 'cc-notification-backdrop cc-notification-text-single-content cc-notification-item'
          && div.target.className !== 'cc-notification-backdrop cc-notification-text-single-content cc-notification-item-new' && div.target.className !== 'cc-notification-backdrop cc-notification-text-double-content cc-notification-item' && div.target.className !== 'cc-notification-backdrop cc-notification-text-double-content cc-notification-item-new' 
          && div.target.className !== 'cc-notification-backdrop cc-notification-text-triple-content cc-notification-item' && div.target.className !== 'cc-notification-backdrop cc-notification-text-triple-content cc-notification-item-new'
          && div.target.className !== 'cc-notification-item cc-notification-text-triple-content') {
            notificationDiv.style.display = 'none'
            $scope.isNotificationVisible = false
          }
        }
      }
    }
  }
]);
