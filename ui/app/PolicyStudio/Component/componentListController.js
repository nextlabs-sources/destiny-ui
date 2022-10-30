policyStudio.controller('ComponentListController', ['$scope', '$http', '$state', 'componentService', 'folderService', 'loggerService', '$window', '$stateParams', '$uibModal', 'autoCloseOptionService', '$filter',
  'resourceService', 'dialogService', 'viewCacheService', 'userService', 'configService', '$q',
  function($scope, $http, $state,
    componentService, folderService, loggerService, $window, $stateParams, $uibModal, autoCloseOptionService, $filter, resourceService, dialogService, viewCacheService, userService, configService, $q) {
    $scope.instantSearch = configService.configObject.instantSearch;
    $scope.$parent.$parent.isCreatePage = false;
    $scope.type = $stateParams.type;
    $scope.folders = {
      tree: folderService.getComponentFoldersTree(),
      list: folderService.getComponentFoldersList(),
      open: folderService.isComponentFoldersOpen(),
      selectedFolder: folderService.getSelectedComponentFolder()
    }
    var cachedCriteria = viewCacheService.getCachedView("PS-COMPONENT-LIST" + $scope.type);
    var logger = loggerService.getLogger();
    logger.log('type', $scope.type);
    $scope.componentTotal = 0;
    $state.current.pageTitle = $filter('translate')("componentlist.title.ComponentManagement." +  $scope.type);
    userService.getPermissions('COMPONENT', function(permissions) {
      $scope.permissions = permissions;
    });
    userService.getPermissions('COMPONENT_FOLDER', function(permissions) {
      for(let attrName in permissions) {
        $scope.permissions[attrName] = permissions[attrName];
      }
    });
    userService.goBackIfAccessDeniedToApp('PolicyStudio.Components');

    $scope.refreshFolders = function () {
      if($scope.permissions.VIEW_COMPONENT_FOLDER.rowLevel.result) {
        folderService.refreshFolders('component', function () {
          $scope.folders.tree = folderService.getComponentFoldersTree();
          $scope.folders.list = folderService.getComponentFoldersList();
          $scope.folders.selectedFolder = folderService.getSelectedComponentFolder();
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

    var searchReq = {};
    $scope.refreshComponentList = function() {
        $scope.componentList = [];
        $scope.componentTotal = 0;
        $scope.checkStatus.allComponentChecked = false;
        $scope.checkStatus.hasComponentChecked = false;
        $scope.checkStatus.hasFolderChecked = false;
        // Set custom date range
        if($scope.searchCriteria.modifiedDate.name == 'CUSTOM'
          && $scope.tempCustomDate.modifiedFrom
          && $scope.tempCustomDate.modifiedTo) {
          $scope.searchCriteria.modifiedFrom = $scope.tempCustomDate.modifiedFrom;
          $scope.searchCriteria.modifiedTo = $scope.tempCustomDate.modifiedTo;
        }
        searchReq = angular.copy($scope.searchCriteria);
        folderService.setComponentFoldersOpen($scope.folders.open);
        if($scope.folders.open) {
          searchReq.folderId = $scope.folders.selectedFolder ? $scope.folders.selectedFolder.id : -1;
        } else {
          delete searchReq.folderId;
        }
        if ($scope.permissions.VIEW_COMPONENT.rowLevel.result) {
          componentService.getComponents(searchReq, 0, function(componentList) {
            $scope.componentList = componentList.data;
            $scope.componentTotal = componentList.totalNoOfRecords;
            // var componentMap = $scope.componentMap;
            angular.forEach($scope.componentList, function(component) {
              component.externalStatus = $scope.componentStatus(component);
              component.deploymentStatus = component.deployed ?
                (component.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
                : (component.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
              component.authoritiesParsed = componentService.parseAuthorities(component, $scope.permissions);
            });
            // $scope.updateSubcomponentLabel();
            $scope.updateSubcomponentLabel();
          });
        }
      }
      // $scope.refreshComponentList();
	  $scope.checkStatus = {
	      allComponentChecked : false,
	      hasComponentChecked : false,
	      hasFolderChecked : false
	  };
	  $scope.show_search = false;
    $scope.searchCriteria = {
      status: [],
      subGroup: [],
      tags: [],
      modifiedDate: {},
      modifiedFrom: null,
      modifiedTo: null,
      text: null,
      withSubcomponents: true,
      onlyEmptyComponents: false,
      otherOption: null,
      sortBy: null,
      group: $scope.type
    };
    var criteriaPristine = function(criteria) {
      return !criteria.status.length && !criteria.subGroup.length && !criteria.tags.length && !criteria.text && criteria.withSubcomponents && !criteria.onlyEmptyComponents && !criteria.modifiedDate.name;
    }
    $scope.searchCriteria.pristine = true;
    $scope.tempCustomDate = {};


    $scope.checkAllComponent = function(checked) {
      $scope.checkStatus.hasComponentChecked = checked;
      $scope.checkStatus.hasFolderChecked = checked;
      angular.forEach($scope.componentList, function(item) {
        item.checked = checked;
      });
      if ($scope.folders.open) {
        let foldersInView = $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree;
        angular.forEach(foldersInView, function (item) {
          item.checked = checked;
        });
      }
      $scope.componentCheckStatusChange();
    };
    $scope.componentCheckStatusChange = function() {
      var allComponentChecked = true;
      var hasComponentChecked = false;
      var hasFolderChecked = false;
      var allCheckedItemDeletable = true;
      var allCheckedItemDeployable = true;
      var allCheckedItemMoveable = true;
      angular.forEach($scope.componentList, function(item) {
        allComponentChecked = allComponentChecked && item.checked;
        hasComponentChecked = hasComponentChecked || item.checked;
        item.checked && (allCheckedItemDeletable = allCheckedItemDeletable && item.authoritiesParsed.DELETE_COMPONENT);
        item.checked && (allCheckedItemDeployable = allCheckedItemDeployable && item.authoritiesParsed.DEPLOY_COMPONENT);
        item.checked && (allCheckedItemMoveable = allCheckedItemMoveable && item.authoritiesParsed.MOVE_COMPONENT);
      });
      if ($scope.folders.open) {
        let foldersInView = $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree;
        angular.forEach(foldersInView, function (item) {
          allComponentChecked = allComponentChecked && item.checked;
          hasFolderChecked = hasFolderChecked || item.checked;
          item.checked && (allCheckedItemDeletable = allCheckedItemDeletable && item.authoritiesParsed.DELETE_COMPONENT_FOLDER);
          item.checked && (allCheckedItemMoveable = allCheckedItemMoveable && item.authoritiesParsed.MOVE_COMPONENT_FOLDER);
        });
      }
      $scope.checkStatus.allComponentChecked = allComponentChecked;
      $scope.checkStatus.hasComponentChecked = hasComponentChecked;
      $scope.checkStatus.hasFolderChecked = hasFolderChecked;
      $scope.checkStatus.allCheckedItemDeletable = allCheckedItemDeletable;
      $scope.checkStatus.allCheckedItemDeployable = allCheckedItemDeployable;
      $scope.checkStatus.allCheckedItemMoveable = allCheckedItemMoveable;
    };
    var componentWithOpenOption = [];
    $scope.closeAllOpenOption = function() {
      if (componentWithOpenOption.length > 0) {
        angular.forEach(componentWithOpenOption, function(component) {
          logger.log(component)
          if (component.optionOpen)
            component.optionOpen = false;
        });
        componentWithOpenOption = [];
      }
    }
    $scope.openOption = function(component, open) {
      if (angular.isDefined(open)) {
        component.optionOpen = open;
        if (open) {
          $scope.closeAllOpenOption();
          autoCloseOptionService.close();
          autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
          componentWithOpenOption.push(component);
        } else {
          componentWithOpenOption = [];
        }
      } else return angular.isDefined(component.optionOpen) ? component.optionOpen : false;
    };
    $scope.editComponent = function(component) {
      loggerService.getLogger().log('edit component:', component, 1);
      //    componentService.setComponentID(component.id);
      $state.go('PolicyStudio.editComponent', {
        componentId: component.id,
        type: $scope.type
      });
    };
    $scope.showSubcomponent = function(component) {
      if (component.subComponentsLoaded) {
        component.showsubcomponent = true;
        return;
      }
      var idList = component.subComponents.map(function(p) {
        return String(p.id)
      });
      component.subComponents = [];
      componentService.getComponentsById(idList, function(subComponents) {
        component.subComponentsLoaded = true;
        angular.forEach(subComponents.data, function(subcomponent) {
          component.subComponents.push(subcomponent);
          subcomponent.externalStatus = $scope.componentStatus(subcomponent);
          subcomponent.deploymentStatus = subcomponent.deployed ?
              (subcomponent.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
              : (subcomponent.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
          subcomponent.authoritiesParsed = componentService.parseAuthorities(subcomponent, $scope.permissions);
        });
      });
      component.showsubcomponent = true;
    };
    $scope.hideSubcomponent = function(component) {
      component.showsubcomponent = false;
    };
    var _getNewComponentListTimer = null;
    $scope.applySearch = function() {
      loggerService.getLogger().log('manually refresh');
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshComponentList();
    }

    $scope.loadMore = function() {
      // loggerService.getLogger().log('loadMore');
      logger.log('loadMore');
      componentService.getComponents(searchReq, $scope.componentList.length, function(componentList) {
        $scope.componentList = $scope.componentList.concat(componentList.data);
        $scope.componentTotal = componentList.totalNoOfRecords;
        // var componentMap = $scope.componentMap;
        angular.forEach(componentList.data, function(component) {
          component.externalStatus = $scope.componentStatus(component);
          component.deploymentStatus = component.deployed ?
              (component.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
              : (component.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
          component.authoritiesParsed = componentService.parseAuthorities(component, $scope.permissions);
        });
      });
    };
    // a flag to indicate the window size is changed, to trigger angular's watch
    $scope.windowResizedPlaceHolder = true;
    $scope.subcomponentTitleTempWidth = 0;

    $scope.componentParentTitleTempWidth = 0;

    $scope.updateSubcomponentLabel = function(basedOnWindowResize) {
      // return;
      logger.log('updateSubcomponentLabel', 'window resized?', basedOnWindowResize);
      var temp = $('<span/>').addClass('cc-ps-subcomponent-title-temp').css('background-color', 'transparent').css('color', 'transparent');

      $('*:eq(0)').append(temp);
      // loggerService.getLogger().log($scope.subcomponentTitleTempWidth ,temp.width())
      if (basedOnWindowResize && $scope.subcomponentTitleTempWidth == temp.width()) {
        $('.cc-ps-subcomponent-title-temp').remove();
        return;
      }

      maxwidth = temp.css('width');
      maxwidth = parseInt(maxwidth.substring(0, maxwidth.length - 2));
      $scope.subcomponentTitleTempWidth = temp.width();
      temp.css('display', 'inline');

      angular.forEach($scope.componentList, function(component) {
        if (angular.isArray(component.subComponents)) {
          temp.html('');
          var remaining = component.subComponents.length;
          //console.log("includedInComponents",component.hasIncludedIn);
          // var content = '';
          component.subcomponentTitleHide = "-hide";
          var length = 0;
          angular.forEach(component.subComponents, function(subComponent) {
            var lengthAfter = length + subComponent.name.length;
            if (length > 0) {
              temp.text(temp.text() + ', ');
              // content += ', ';
            }
            if (temp.width() < maxwidth) remaining--;
            // content += subComponent.title;
            temp.text(temp.text() + subComponent.name);
            // loggerService.getLogger().log(temp.width(),temp.css('width'), remaining, temp.text());
            length = lengthAfter;
          });
          if (remaining > 0) {
            component.moreLabel = '+' + remaining + ' more';
            component.subcomponentTitleHide = null;
          }
        }

        if (angular.isArray(component.includedInComponents)) {
          temp.html('');
          var remainingParent = component.includedInComponents.length;
          // var content = '';
          component.componentParentTitleHide = "-hide";
          length = 0;
          angular.forEach(component.includedInComponents, function(includedInComponents) {
            var lengthAfter = length + includedInComponents.name.length;
            if (length > 0) {
              temp.text(temp.text() + ', ');
              // content += ', ';
            }
            if (temp.width() < maxwidth) remainingParent--;
            // content += subComponent.title;
            temp.text(temp.text() + includedInComponents.name);

            // loggerService.getLogger().log(temp.width(),temp.css('width'), remaining, temp.text());
            length = lengthAfter;
          });
          if (remainingParent > 0) {
            component.moreParentLabel = '+' + remainingParent + ' more';
            component.componentParentTitleHide = null;
          }
        }

      });
      temp.remove();
    }
    $scope.$watch(function() {
      return $scope.windowResizedPlaceHolder;
    }, function(newValue, oldValue) {
      $scope.updateSubcomponentLabel(true);
    }, true);
    $scope.$watch(function() {
      return $scope.componentList;
    }, function(newValue, oldValue) {
      $scope.updateSubcomponentLabel();
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
      $scope.searchCriteria.$_nameDisplay = $filter('translate')("componentlist.title.savedSearches");
      $scope.searchCriteria.name = null;
    }
    $scope.resetSavedSearchTitle();

    var resetSearchCriteria = function() {
	  $scope.searchCriteria.sortBy = $scope.getComponentSortBy();
      $scope.searchSet = null;
      angular.forEach($scope.searchOptions.subGroupOptions, function(option) {
        option.$_checked = false;
      });
      angular.forEach($scope.searchOptions.statusOptions, function(status) {
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
      $scope.searchCriteria.withSubcomponents = true;
      $scope.searchCriteria.onlyEmptyComponents = false;
      $scope.searchCriteria.text = null;
      /*$scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];*/
      $scope.isCustomPeriodSelected = false;
      angular.forEach($scope.searchOptions.moreOptions, function(option) {
        option.open = false;
      });

      $scope.statusChanged();
      // $scope.updateStatus();
      $scope.subGroupChanged();
      // $scope.updateSubGroup();
      $scope.tagChanged();
      // $scope.updateTag();
    };

     $scope.setComponentSortBy = function(sort) {
        $scope.searchCriteria.sortBy = sort;
        if ($scope.type == "Subject") {
            localStorage.setItem('componentSubjectType.sortBy', JSON.stringify(sort));
        } else if ($scope.type == "Resource") {
            localStorage.setItem('componentResourceType.sortBy', JSON.stringify(sort));
        } else {
            localStorage.setItem('componentActionType.sortBy', JSON.stringify(sort));
        }
    };

    $scope.getComponentSortBy = function() {
        if ($scope.type == "Subject") {
            return localStorage.getItem('componentSubjectType.sortBy') === null ? $scope.searchOptions.sortOptions[0] : JSON.parse(localStorage.getItem('componentSubjectType.sortBy'));
        } else if ($scope.type == "Resource") {
            return localStorage.getItem('componentResourceType.sortBy') === null ? $scope.searchOptions.sortOptions[0] : JSON.parse(localStorage.getItem('componentResourceType.sortBy'));
        } else {
            return localStorage.getItem('componentActionType.sortBy') === null ? $scope.searchOptions.sortOptions[0] : JSON.parse(localStorage.getItem('componentActionType.sortBy'));
        }
    }

    // $scope.searchOptions.$allStatusChecked = false;
    $scope.searchOptions = {
      statusOptions: [],
      sortOptions: [],
      modifiedDateOptions: [],
      moreOptions: [],
      $allStatusChecked: false,
      $noTagChecked: false,
      $allTagChecked: false
    };
    $scope.searchOptions.statusLabel = '';
    $scope.searchOptions.tagLabel = '';
    componentService.getSavedSearch(function(savedSearch) {
      $scope.savedSearchList = $filter('filter')(savedSearch.data, function(search) {
        var groupField = $filter('filter')(search.criteria.fields, {field : "group"});
        return groupField && groupField[0].value.value == $scope.componentType;
      });
    });
    $scope.searchNameDefined = function(name, description) {
      // loggerService.getLogger().log('search name is ', name);
      $scope.searchCriteria.name = name;
      $scope.searchCriteria.description = description;
      componentService.saveSearch($scope.searchCriteria, function(data) {
        var savedId = data.data;
        componentService.getSavedSearch(function(savedSearch) {
          // loggerService.getLogger().log('getSavedSearch');
          $scope.savedSearchList = $filter('filter')(savedSearch.data, function(search) {
            var groupField = $filter('filter')(search.criteria.fields, {field : "group"});
            return groupField && groupField[0].value.value == $scope.componentType;
          });
          angular.forEach($scope.savedSearchList, function(search) {
            if (search.id == savedId)
              $scope.setSearch(search)
          });
        });
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('componentlist.search.saved.notify'),
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
      $scope.componentSearchForm && $scope.componentSearchForm.$setPristine();
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.searchCriteria.name = null;
      $scope.searchOptions.specialModifiedDateOption.$_checked = true;
      $scope.resetSavedSearchTitle();
      $scope.updateCustomPeriod(undefined);
      $scope.updateModifiedDate();
      !notrefresh && $scope.refreshComponentList();
    };
    $scope.setDirty = function() {
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
          case 'modelType':
            angular.forEach($scope.searchOptions.subGroupOptions, function(subGroup) {
              subGroup.$_checked = false;
              angular.forEach(field.value.value, function(subGroupValue) {
                if (subGroup.name == subGroupValue) {
                  subGroup.$_checked = true;
                }
              });
            });
            $scope.subGroupChanged();
            // $scope.updateSubGroup();
            break;
          case 'text':
            $scope.searchCriteria.text = field.value.value;
            break;
          case 'hasIncludedIn':
            $scope.searchCriteria.withSubcomponents = field.value.value == 'true';
            break;
          case 'empty':
            $scope.searchCriteria.onlyEmptyComponents = field.value.value == 'true';
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
        angular.forEach(componentService.searchOptions.sortOptions, function(sortOption) {
          if (sortOption.name == search.criteria.sortFields[0].field) $scope.searchCriteria.sortBy = sortOption;
        });
      }*/
      // $scope.refreshCriteria();

      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshFolders();
	    $scope.refreshComponentList();
    };
    $scope.checkModifiedDate = function(modifiedDate) {
      $scope.searchOptions.specialModifiedDateOption.$_checked = false;
      angular.forEach($scope.searchOptions.modifiedDateOptions, function(aModifiedDate) {
        aModifiedDate.$_checked = false;
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
        $scope.searchOptions.statusLabel = $filter('translate')('componentsearch.title.AllStatus');
      } else {
        $scope.searchOptions.statusLabel = '';
        angular.forEach($scope.searchCriteria.status, function(status, index) {
          if (index > 0) $scope.searchOptions.statusLabel += ', ';
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
    };
    $scope.updateSubGroup = function() {
      $scope.searchCriteria.subGroup = [];
      angular.forEach($scope.searchOptions.subGroupOptions, function(option) {
        if (option.$_checked) $scope.searchCriteria.subGroup.push(option);
      });
      // $scope.refreshCriteria();
      if ($scope.searchOptions.$allSubGroupChecked) {
        $scope.searchOptions.subGroupLabel = $filter('translate')('componentsearch.title.AllSubGroup.' + $scope.type);
      } else {
        $scope.searchOptions.subGroupLabel = '';
        angular.forEach($scope.searchCriteria.subGroup, function(subGroup, index) {
          if (index > 0) $scope.searchOptions.subGroupLabel += ', ';
          $scope.searchOptions.subGroupLabel += subGroup.name;
        });
      }
    };
    $scope.allSubGroupChanged = function() {

      angular.forEach($scope.searchOptions.subGroupOptions, function(option) {
        option.$_checked = !$scope.searchOptions.$allSubGroupChecked;
      });
      $scope.subGroupChanged();
    };
    $scope.subGroupChanged = function() {
      var allSubGroupChecked = true;
      angular.forEach($scope.searchOptions.subGroupOptions, function(option) {
        allSubGroupChecked = allSubGroupChecked && !option.$_checked;
      });
      $scope.searchOptions.$allSubGroupChecked = allSubGroupChecked;
      $scope.updateSubGroup();
    };
    $scope.updateTag = function() {
      $scope.searchCriteria.tags = [];
      angular.forEach($scope.searchOptions.tagOptions, function(tag) {
        if (tag.$_checked) $scope.searchCriteria.tags.push(tag);
      });
      // $scope.refreshCriteria();
      if ($scope.searchOptions.$allTagChecked) {
        $scope.searchOptions.tagLabel = $filter('translate')('componentsearch.title.AllTags');
      } else if($scope.searchOptions.$noTagChecked){
        $scope.searchOptions.tagLabel = $filter('translate')('componentsearch.title.NoTags');
        $scope.searchCriteria.tags.push($filter('translate')("componentsearch.title.NoTags"));
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
    };
    $scope.updateModifiedDate = function() {
      if ($scope.tempCustomDate) {
        $scope.searchCriteria.modifiedFrom = $scope.tempCustomDate.modifiedFrom;
        $scope.searchCriteria.modifiedTo = $scope.tempCustomDate.modifiedTo;
      }
      $scope.searchOptions.modifiedDateLabel = null;
      if ($scope.searchOptions.specialModifiedDateOption.$_checked) $scope.searchOptions.modifiedDateLabel = $filter('translate')("componentsearch.label.AnyModifiedDate");
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
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          var search = $scope.savedSearchList[index];
          componentService.delSavedSearch(search, function() {
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
    var searchArgsPromises = [];
    searchArgsPromises.push(componentService.retrieveSearchOption(function(searchOptions) {
      $scope.searchOptions.statusOptions = searchOptions.data.statusOptions;
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
      loggerService.getLogger().log($scope.searchOptions);
    }));
    searchArgsPromises.push(componentService.retrieveAvailableTags(function(tagOptions) {
      $scope.searchOptions.tagOptions = tagOptions.data;
    }));
    switch ($stateParams.type.toUpperCase()) {
      case 'RESOURCE':
        $scope.componentType = 'RESOURCE';
        // get resouce types
        searchArgsPromises.push(resourceService.getResourceLiteList('RESOURCE', function (data) {
          $scope.searchOptions.subGroupOptions = data.data;
        }));
        break;
      case 'ACTION':
        $scope.componentType = 'ACTION';
        searchArgsPromises.push(resourceService.getResourceLiteList('RESOURCE', function(data) {
          $scope.searchOptions.subGroupOptions = data.data;
        }));
        break;
      case 'SUBJECT':
        $scope.componentType = 'SUBJECT';
        searchArgsPromises.push(resourceService.getResourceLiteList('SUBJECT', function (data) {
          $scope.searchOptions.subGroupOptions = data.data;
        }));
        break;
    }
    $q.all(searchArgsPromises).then(function() {
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      if(cachedCriteria){
        $scope.resetSavedSearchTitle();
        $scope.setSearch(cachedCriteria);
      } else resetSearchCriteria();
      $scope.refreshComponentList();
      $scope.$watch(function() {
        return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
      }, function(newValue, oldValue) {
        if (newValue === oldValue) {
          return
        }
        loggerService.getLogger().log('should get new component list now.', 1);
        // loggerService.getLogger().log(newValue, 1);
        clearTimeout(_getNewComponentListTimer);
        _getNewComponentListTimer = setTimeout(function() {
            $scope.refreshComponentList();
          }, 100);
        }, true);
    });

    $scope.componentStatus = function(component) {
      switch (component.status) {
        case 'SUBMITTED':
        case 'DEPLOYED':
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
    };
    $scope.delComponent = function(component, $event) {
      dialogService.confirm({
        msg: $filter('translate')('componentlist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          componentService.delComponent(component, function() {
            $scope.refreshComponentList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('componentlist.deleted.notify'),
              timeout:5000
            });
          });
        }
      })
      $event.stopPropagation();
    };
    $scope.bulkDelete = function ($event) {
      dialogService.confirm({
        msg: $filter('translate')('componentlist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          var checkedComponentList = $filter('filter')($scope.componentList, { checked: true });
          var componentIdList = checkedComponentList.map(function (item) {
            return item.id
          });
          if (componentIdList.length > 0) {
            componentService.bulkDelComponent(componentIdList, function () {
              $scope.refreshComponentList();
              dialogService.notifyWithoutBlocking({
                msg: $filter('translate')('componentlist.deleted.notify'),
                timeout: 5000
              });
            });
          }
          var folderIdList = [];
          if ($scope.folders.open) {
            angular.forEach($scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.children : $scope.folders.tree, function (item) {
              item.checked && folderIdList.push(item.id);
            });
          }
          if (folderIdList.length > 0) {
            folderService.deleteFolders('component', folderIdList, function (data) {
              if (data.statusCode == 1002) {
                $scope.refreshFolders();
                dialogService.notifyWithoutBlocking({
                  msg: $filter('translate')('componentlist.deleted.notify', { length: folderIdList.length }),
                  timeout: 5000
                });
              }
            });
          }
        }
      })
      $event.stopPropagation();
    };
    $scope.cloneComponent = function(component) {
      componentService.cloneComponent(component.id, function() {
        $scope.refreshComponentList();
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('createComponent.cloned.notify'),
          timeout:5000
        });
      });
    };
    $scope.addSubComponent = function(component) {
      if(!component.modelType) {
        dialogService.notify({
          msg: $filter('translate')('componentlist.notify.addingToEmptyComponent')
        });
        return;
      }
      loggerService.getLogger().log('add sub component:', component);
      //    componentService.setComponentID(component.id);
      $state.go('PolicyStudio.createComponent', {
        folderId: $scope.folders.selectedFolder && $scope.folders.selectedFolder.id > -1 ? $scope.folders.selectedFolder.id : null,
        folderPath: component.folderPath,
        parentComponent: component,
        type: $scope.type
      });
    }

    $scope.deployComponents = function (components) {
      components = components instanceof Array ? components : [components]
      componentService.deploy(components.map(function (component) {
        return component.id
      }), false, $scope.type, false, function () {
        $scope.refreshComponentList()
      })
    }

    $scope.deploySelectedComponents = function ($event) {
      $scope.deployComponents($scope.componentList.filter(function (component) {
        return component.checked
      }))
      $event.stopPropagation()
    }

    $scope.deactivateComponent = function(component){
      dialogService.confirm({
        msg: $filter('translate')('componentlist.deactivate.confirm'),
        confirmLabel: $filter('translate')('DEACTIVATE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {

          componentService.deactivateComponent([component.id], function() {


            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('componentlist.deactivate.notify'),
              timeout:5000
            });
            $scope.refreshComponentList();
          });
        }
      })
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
      folderService.setSelectedComponentFolder(folder);
      $scope.refreshComponentList();
    }

    $scope.renameFolder = function (folder) {
      folderService.rename(folder, 'COMPONENT');
    }

    $scope.createFolder = function () {
      folderService.createFolder('COMPONENT', $scope.folders.selectedFolder, function (created) {
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
  
      var componentIdIdList = $scope.componentList
      .filter(function (item) { return item.checked; })
      .map(function (item) { return item.id });

      $scope.move(folderIdList, componentIdIdList);
    }

    $scope.move = function (folderIdList, componentIdIdList) {
      if (folderIdList.length > 0 || componentIdIdList.length > 0) {
        folderService.move('component', folderIdList, componentIdIdList, $scope.refreshFolders, $scope.refreshComponentList);
      }
    }

    $scope.deleteFolder = function (folder, $event) {
      dialogService.confirm({
        msg: $filter('translate')('componentlist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          folderService.deleteFolders('component', [folder.id], function (data) {
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
      $scope.refreshComponentList();
    };

    $scope.collapseFolders = function () {
      angular.forEach($scope.folders.tree, function(folder){
        folder.collapsed = true
      })
    };
    $scope.folderTreeCache = function () {
      $scope.folderStates = $scope.folders.list.map(this.getFolderIDandState)
    }

    $scope.resetFolders = function () {
      $scope.folders.selectedFolder = null
    }
    
    $scope.getFolderIDandState = function (folder) {
      var object = {}
      var id = folder.id
      var state = folder.collapsed
      object = { id:id, state:state }
      return object
    }

  }
]);