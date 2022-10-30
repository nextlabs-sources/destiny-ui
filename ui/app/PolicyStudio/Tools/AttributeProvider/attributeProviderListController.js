policyStudio.controller('AttributeProviderListController', ['$scope', '$http', '$state', 'resourceService', 'loggerService', '$window', '$stateParams', '$uibModal', 'autoCloseOptionService', 'dialogService', '$filter', 'viewCacheService', 'userService', 'configService', '$q', function($scope,
  $http, $state,
  resourceService, loggerService, $window, $stateParams, $uibModal, autoCloseOptionService, dialogService, $filter, viewCacheService, userService, configService, $q) {
  $scope.$parent.$parent.isCreatePage = false;
  $scope.instantSearch = configService.configObject.instantSearch;
  var cachedCriteria = viewCacheService.getCachedView("PS-POLICY-MODEL-LIST");
  $scope.resourceTotal = 0;
  var logger = loggerService.getLogger();
  $state.current.pageTitle = $filter('translate')("resourcelist.title.ResourceManagement");
  userService.getPermissions('POLICY_MODEL', function(permissions) {
    $scope.permissions = permissions;
  });
  userService.goBackIfAccessDeniedToApp('PolicyStudio.PolicyModel');
  var searchReq = {};
  $scope.refreshResourceList = function() {
      $scope.resourceList = [];
      $scope.resourceTotal = 0;
      $scope.checkStatus.allResourceChecked = false;
      $scope.checkStatus.hasResourceChecked = false;
      searchReq = angular.copy($scope.searchCriteria);
      resourceService.getResources(searchReq, 0, function(resourceList) {
        $scope.resourceList = resourceList.data;
        $scope.resourceTotal = resourceList.totalNoOfRecords;
        angular.forEach(resourceList.data, function(resource) {
          resource.authoritiesParsed = resourceService.parseAuthorities(resource, $scope.permissions);
        });
      });
    }
  $scope.checkStatus = {
    allResourceChecked : false,
    hasResourceChecked : false
  };
  $scope.show_search = false;
  $scope.checkAllResource = function(checked) {
    $scope.checkStatus.hasResourceChecked = false;
    angular.forEach($scope.resourceList, function(item) {
      if(item.type != 'SUBJECT'){
        item.checked = checked;
        $scope.checkStatus.hasResourceChecked = checked
      }
    });
    $scope.resourceCheckStatusChange()
  };
  $scope.resourceCheckStatusChange = function() {
    var allResourceChecked = true;
    var hasResourceChecked = false;
    var allCheckedItemDeletable = true;
    angular.forEach($scope.resourceList, function(item) {
      if(item.type == 'SUBJECT') return;
      allResourceChecked = allResourceChecked && item.checked;
      hasResourceChecked = hasResourceChecked || item.checked;
      item.checked && (allCheckedItemDeletable = allCheckedItemDeletable && item.authoritiesParsed.DELETE_POLICY_MODEL);
    });
    $scope.checkStatus.allResourceChecked = allResourceChecked;
    $scope.checkStatus.hasResourceChecked = hasResourceChecked;
    $scope.checkStatus.allCheckedItemDeletable = allCheckedItemDeletable;
  };
  var resourceWithOpenOption = [];
  $scope.closeAllOpenOption = function() {
    if (resourceWithOpenOption.length > 0) {
      angular.forEach(resourceWithOpenOption, function(resource) {
        logger.log(resource)
        if (resource.optionOpen)
          resource.optionOpen = false;
      });
      resourceWithOpenOption = [];
    }
  }
  $scope.openOption = function(resource, open) {
    if (angular.isDefined(open)) {
      resource.optionOpen = open;
      if (open) {
        $scope.closeAllOpenOption();
        autoCloseOptionService.close();
        autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
        resourceWithOpenOption.push(resource);
      } else {
        resourceWithOpenOption = [];
      }
    } else return angular.isDefined(resource.optionOpen) ? resource.optionOpen : false;
  };
  $scope.editResource = function(resource) {
    loggerService.getLogger().log('edit resource:', resource, 1);
    //    resourceService.setResourceID(resource.id);
    $state.go('PolicyStudio.editPolicyModel', {
      resourceId: resource.id
    });
  };
  // $scope.resource_sortby = 'updateTime';
  $scope.searchCriteria = {};
  $scope.searchCriteria = {
    tags: [],
    types: [],
    modifiedDate: {},
    modifiedFrom: null,
    modifiedTo: null,
    text: null,
    // withSubresources: true,
    otherOption: null,
    sortBy: null
  };
  var _getNewResourceListTimer = null;
  $scope.applySearch = function() {
    loggerService.getLogger().log('manually refresh');
    $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
    $scope.refreshResourceList();
  }

  $scope.loadMore = function() {
    // loggerService.getLogger().log('loadMore');
    logger.log('loadMore');
    resourceService.getResources(searchReq, $scope.resourceList.length, function(resourceList) {
      $scope.resourceList = $scope.resourceList.concat(resourceList.data);
      $scope.resourceTotal = resourceList.totalNoOfRecords;
      angular.forEach(resourceList.data, function(resource) {
        resource.authoritiesParsed = resourceService.parseAuthorities(resource, $scope.permissions);
      });
    });
  };
  // a flag to indicate the window size is changed, to trigger angular's watch
  $scope.windowResizedPlaceHolder = true;
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
    $scope.searchCriteria.$_nameDisplay = $filter('translate')("resourcelist.title.savedSearches");
    $scope.searchCriteria.name = null;
  }
  $scope.resetSavedSearchTitle();
  $scope.searchCriteria.pristine = true;
  // $scope.searchCriteria = $scope.searchCriteria;
  var resetSearchCriteria = function() {
    $scope.searchSet = null;
    angular.forEach($scope.searchOptions.modifiedDateOptions, function(option) {
      option.$_checked = false;
    });
    angular.forEach($scope.searchOptions.typeOptions, function(option) {
      option.$_checked = false;
    });
    $scope.searchOptions.$noTagChecked = false;
    angular.forEach($scope.searchOptions.tagOptions, function(option) {
      option.$_checked = false;
    });
    $scope.searchCriteria.modifiedDate = {};
    // $scope.searchCriteria.withSubresources = true;
    $scope.searchCriteria.text = null;
    // $scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];
    $scope.isCustomPeriodSelected = false;
    angular.forEach($scope.searchOptions.moreOptions, function(option) {
      option.open = false;
    });
    $scope.tagChanged();
    // $scope.updateTag();
    $scope.typeChanged();
    // $scope.updateType();
    $scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];
  };
  $scope.searchCriteria.searchOptions = $scope.searchOptions = {
    sortOptions: [],
    modifiedDateOptions: [],
    moreOptions: [],
    $allTagChecked: false,
    $allTypeChecked: false,
    typeLabel: ''

  };
  $scope.tempCustomDate = {};
  $scope.searchOptions.tagLabel = '';
  var searchArgsPromises = [];
  searchArgsPromises.push(resourceService.retrieveSearchOption(function(searchOptions) {
    $scope.searchOptions.modifiedDateOptions = searchOptions.data.modifiedDateOptions;
    $scope.searchOptions.specialModifiedDateOption = {
      $_checked: true
    };
    $scope.searchOptions.sortOptions = searchOptions.data.sortOptions;
    $scope.searchOptions.typeOptions = searchOptions.data.typeOptions;
    $scope.searchOptions.moreOptions = searchOptions.data.moreFieldOptions;
    angular.forEach($scope.searchOptions.moreOptions, function(option) {
      option.open = false;
    })
    $scope.updateModifiedDate();
    loggerService.getLogger().log($scope.searchOptions);
  }));
  searchArgsPromises.push(resourceService.retrieveAvailableTags(function(tagOptions) {
    $scope.searchOptions.tagOptions = tagOptions.data;
  }));
  $q.all(searchArgsPromises).then(function() {
    $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
    if(cachedCriteria){
      $scope.resetSavedSearchTitle();
      $scope.setSearch(cachedCriteria);
    } else resetSearchCriteria();
    $scope.refreshResourceList();
    $scope.$watch(function() {
      return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
    }, function(newValue, oldValue) {
      if (newValue === oldValue) {
        return
      }
      loggerService.getLogger().log('should get new resource list now.', 1);
      // loggerService.getLogger().log(newValue, 1);
      clearTimeout(_getNewResourceListTimer);
      _getNewResourceListTimer = setTimeout(function() {
        $scope.refreshResourceList();
      }, 100);
    }, true);
  });
  var criteriaPristine = function(criteria) {
    return !criteria.types.length && !criteria.tags.length && !criteria.text && !criteria.modifiedDate.name;
  }
  resourceService.getSavedSearch(function(savedSearch) {
    $scope.savedSearchList = savedSearch.data;
  });
  $scope.searchNameDefined = function(name, description) {
    // loggerService.getLogger().log('search name is ', name);
    $scope.searchCriteria.name = name;
    $scope.searchCriteria.description = description;
    resourceService.saveSearch($scope.searchCriteria, function(data) {
      var savedId = data.data;
      resourceService.getSavedSearch(function(savedSearch) {
        loggerService.getLogger().log('getSavedSearch');
        $scope.savedSearchList = savedSearch.data;
        angular.forEach($scope.savedSearchList, function(search) {
          if (search.id == savedId)
            $scope.setSearch(search)
        });
      });
      dialogService.notifyWithoutBlocking({
        msg: $filter('translate')('resourcelist.search.saved.notify'),
        timeout:5000
      });
    });
  };
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
    $scope.resourceSearchForm && $scope.resourceSearchForm.$setPristine();
    $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);;
    $scope.searchCriteria.name = null;
    $scope.searchOptions.specialModifiedDateOption.$_checked = true;
    $scope.resetSavedSearchTitle();
    $scope.updateCustomPeriod(undefined);
    $scope.updateModifiedDate();
    !notrefresh && $scope.refreshResourceList();
  };
  $scope.setDirty = function() {
    $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
    $scope.resetSavedSearchTitle();
  };
  $scope.tags = [];
  $scope.searchSet = null;
  $scope.setSearch = function(search) {
    loggerService.getLogger().log('setSearch:', search, 1);
    $scope.clearSearch(true);
    $scope.searchSet = search;
    // $scope.savedSarchTitle = search.name;
    search.name && ($scope.searchCriteria.name = search.name);
    search.name && ($scope.searchCriteria.$_nameDisplay = search.name);
    // $scope.searchCriteria.name = search.name;
    angular.forEach(search.criteria.fields, function(field) {
      switch (field.field) {
        case 'tags':
          $scope.searchOptions.$noTagChecked = field.value.value.length == 0; 
          angular.forEach($scope.searchOptions.tagOptions, function(option) {
            option.$_checked = false;
            angular.forEach(field.value.value, function(tag) {
              if (option.key == tag) {
                option.$_checked = true;
              }
            });
          });
          $scope.tagChanged();
          // $scope.updateTag();
          break;
        case 'type':
          angular.forEach($scope.searchOptions.typeOptions, function(option) {
            option.$_checked = false;
            angular.forEach(field.value.value, function(type) {
              if (option.name == type) {
                option.$_checked = true;
              }
            });
          });
          $scope.typeChanged();
          // $scope.updateType();
          break;
        case 'text':
          $scope.searchCriteria.text = field.value.value;
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
          if(field.value.dateOption == 'CUSTOM'){
            $scope.tempCustomDate.modifiedFrom = new Date(field.value.fromDate);
            $scope.tempCustomDate.modifiedTo = new Date(field.value.toDate);
            $scope.tempCustomDate.modifiedTo.setDate($scope.tempCustomDate.modifiedTo.getDate() - 1);
          }
          // $scope.modifiedDateChanged();
          $scope.updateModifiedDate();
          break;
          // $scope.modifiedDateChanged();
          $scope.updateModifiedDate();
          break;
      }
    });
    // $scope.refreshCriteria();
    $scope.refreshResourceList();
    $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);;
  };
  $scope.checkModifiedDate = function(modifiedDate) {
    $scope.searchOptions.specialModifiedDateOption.$_checked = false;
    angular.forEach($scope.searchOptions.modifiedDateOptions, function(option) {
      option.$_checked = false;
    });
    modifiedDate && (modifiedDate.$_checked = true);
    $scope.updateModifiedDate();
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
  }
  $scope.updateTag = function() {
    $scope.searchCriteria.tags = [];
    angular.forEach($scope.searchOptions.tagOptions, function(tag) {
      if (tag.$_checked) $scope.searchCriteria.tags.push(tag);
    });
    // $scope.refreshCriteria();
    if ($scope.searchOptions.$allTagChecked) {
      $scope.searchOptions.tagLabel = $filter('translate')('resourcesearch.title.AllTags');
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
    $scope.tagChanged();
  };
  $scope.tagChanged = function() {
    var allTagChecked = true;
    angular.forEach($scope.searchOptions.tagOptions, function(tag) {
      allTagChecked = allTagChecked && !tag.$_checked;
    });
    $scope.searchOptions.$allTagChecked = allTagChecked;
    $scope.updateTag();
  };
  $scope.updateType = function() {
    $scope.searchCriteria.types = [];
    angular.forEach($scope.searchOptions.typeOptions, function(type) {
      if (type.$_checked) $scope.searchCriteria.types.push(type);
    });
    // $scope.refreshCriteria();
    if ($scope.searchOptions.$allTypeChecked) {
      $scope.searchOptions.typeLabel = $filter('translate')('resourcesearch.title.AllTypes');
    } else {
      $scope.searchOptions.typeLabel = '';
      angular.forEach($scope.searchCriteria.types, function(type, index) {
        if (index > 0) $scope.searchOptions.typeLabel += ', ';
        $scope.searchOptions.typeLabel += type.label;
      });
    }
  };
  $scope.allTypeChanged = function() {
    angular.forEach($scope.searchOptions.typeOptions, function(type) {
      type.$_checked = !$scope.searchOptions.$allTypeChecked;
    });
    $scope.typeChanged();
  };
  $scope.typeChanged = function() {
    var allTypeChecked = true;
    angular.forEach($scope.searchOptions.typeOptions, function(type) {
      allTypeChecked = allTypeChecked && !type.$_checked;
    });
    $scope.searchOptions.$allTypeChecked = allTypeChecked;
    $scope.updateType();
  };
  $scope.updateModifiedDate = function() {
    if($scope.tempCustomDate){
      $scope.searchCriteria.modifiedFrom = $scope.tempCustomDate.modifiedFrom;
      $scope.searchCriteria.modifiedTo = $scope.tempCustomDate.modifiedTo;
    }
    $scope.searchOptions.modifiedDateLabel = null;
    if ($scope.searchOptions.specialModifiedDateOption.$_checked) $scope.searchOptions.modifiedDateLabel = $filter('translate')("resourcesearch.label.AnyModifiedDate");
    $scope.searchCriteria.modifiedDate = {};
    angular.forEach($scope.searchOptions.modifiedDateOptions, function(modifiedDate) {
      if (modifiedDate.$_checked) {
        $scope.searchOptions.modifiedDateLabel = modifiedDate.label;
        $scope.searchCriteria.modifiedDate = modifiedDate;
      }
    });
  }
  $scope.delResourceType = function(index, $event) {
    dialogService.confirm({
      msg: $filter('translate')('resourcelist.del.confirm'),
      confirmLabel: $filter('translate')('DELETE'),
      cancelLabel: $filter('translate')('CANCEL'),
      ok: function(){
        var resourceType = $scope.resourceList[index];
        resourceService.delResourceType(resourceType, function(response){
          if(response && response.statusCode == '6002') {
            dialogService.notify({
              msg: $filter('translate')(response.message)
            });  
            return;
          }
          $scope.resourceList.splice(index, 1);
          $scope.refreshResourceList();
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('resourcelist.deleted.notify'),
            timeout:5000
          });
        });
      }
    })
    $event.stopPropagation();
  };
  $scope.bulkDelResourceType = function($event) {
    dialogService.confirm({
      msg: $filter('translate')('resourcelist.del.confirm'),
      confirmLabel: $filter('translate')('DELETE'),
      cancelLabel: $filter('translate')('CANCEL'),
      ok: function(){
        var idList = [], indexList = [], index = 0;
        angular.forEach($scope.resourceList, function(item) {
          item.checked && idList.push(item.id) && indexList.push(index);
          index++;
        });
        resourceService.bulkDelResourceType(idList, function(response){
          if(response && response.statusCode == '6002') {
            dialogService.notify({
              msg: $filter('translate')(response.message)
            });  
            $scope.refreshResourceList();
            return;
          }
          angular.forEach(indexList.reverse(), function(index) {
            $scope.resourceList.splice(index, 1);
          });
          $scope.refreshResourceList();
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('resourcelist.deleted.notify'),
            timeout:5000
          });
        });
      }
    })
    $event.stopPropagation();
  };
  $scope.delSearch = function(index, $event) {
    dialogService.confirm({
      msg: $filter('translate')('search.del.confirm'),
      confirmLabel: $filter('translate')('DELETE'),
      cancelLabel: $filter('translate')('CANCEL'),
      ok: function(){
        var search = $scope.savedSearchList[index];
        resourceService.delSavedSearch(search, function(){
          $scope.savedSearchList.splice(index, 1);
          if($scope.searchSet == search){
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
  $scope.cloneResource = function(resource){
    resourceService.cloneResourceType(resource.id, function(){
      $scope.refreshResourceList();
      dialogService.notify({
        msg: $filter('translate')('createResource.cloned.notify.' + resource.type)
      });
    });
  }
}]);