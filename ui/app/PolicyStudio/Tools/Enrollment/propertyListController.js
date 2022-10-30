policyStudio.controller('propertyListController', ['$scope', '$state', 'propertyManagerService', 'loggerService', '$filter', '$uibModal',
  'dialogService',  'viewCacheService', '$q',  function ($scope, $state,
    propertyManagerService, loggerService, $filter, $uibModal, dialogService, viewCacheService, $q) {
    var cachedCriteria = viewCacheService.getCachedView("PS-PROPERTY-LIST");
    var logger = loggerService.getLogger();

    $scope.propertyForm = {
      val: null,
    }

    $scope.show_search = false;
    $scope.searchCriteria = {
      entityTypes: [],
      dataTypes: [],
      text: null,
      sortBy: null
    };

    $scope.searchCriteria.searchOptions = $scope.searchOptions = {
      entityTypeOptions: [],
      dataTypeOptions: [],
      sortOptions: [],
      $allEntityTypeChecked: true,
      $allDataTypeChecked: true
    };

    var criteriaPristine = function(criteria) {
      return !criteria.entityTypes.length && !criteria.dataTypes.length && !criteria.text;
    }

    $scope.searchCriteria.pristine = true;
    var searchArgPromises = [];
    searchArgPromises.push(propertyManagerService.retrieveSearchOption(function (searchOptions) {
      $scope.searchOptions.entityTypeOptions = searchOptions.data.typeOptions;
      $scope.searchOptions.dataTypeOptions = searchOptions.data.statusOptions;
      $scope.searchOptions.sortOptions = searchOptions.data.sortOptions;
      logger.log($scope.searchCriteria.searchOptions);
    }));

    $q.all(searchArgPromises).then(function () {
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      if(cachedCriteria){
        $scope.resetSavedSearchTitle();
        $scope.setSearch(cachedCriteria);
      } else{
        resetSearchCriteria();
      }
        $scope.refreshPropertyList(0);
        $scope.$watch(function() {
          return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
        }, function(newValue, oldValue) {
          if (newValue === oldValue) {
            return
          }
          loggerService.getLogger().log('should get new property list now.', 1);
          $scope.refreshPropertyList(0);
        }, true);
    });

    $scope.resetSavedSearchTitle = function() {
      $scope.searchCriteria.$_nameDisplay = $filter('translate')("policylist.title.savedSearches");
      $scope.searchCriteria.name = null;
    }
    $scope.resetSavedSearchTitle();

    var resetSearchCriteria = function () {
      $scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];
      $scope.searchSet = null;
      $scope.searchCriteria.text = null;
      angular.forEach($scope.searchOptions.entityTypeOptions, function(option) {
        option.$_checked = false;
      });
      angular.forEach($scope.searchOptions.dataTypeOptions, function(option) {
        option.$_checked = false;
      });

      $scope.entityTypeChanged();
      $scope.dataTypeChanged();
    };

    var searchReq = {};
    $scope.refreshPropertyList = function (startPos) {
      if (startPos == 0) {
        $scope.propertyList = [];
        $scope.propertyTotal = 0;
      }

      $scope.preSeededNum = 0;
      searchReq = angular.copy($scope.searchCriteria);
      propertyManagerService.getProperties(searchReq, startPos, function (propertyList) {
        $scope.propertyList = startPos == 0 ? propertyList.data : $scope.propertyList.concat(propertyList.data);
        $scope.propertyTotal = propertyList.totalNoOfRecords;
        angular.forEach($scope.propertyList, function (property) {
          property.isEdit = false;
          property.ParentNameOld = '';
          property.labelOld = '';
          property.nameOld = '';
          property.typeOld = '';
          property.checked = false;
          property.nameEditable = false;
          if($scope.preSeeded){
            $scope.preSeededNum++;
          }
        })
      });
    }

    $scope.allPropertiesChecked = false;
    $scope.totalChecked = 0;

    $scope.checkProperty = function (property) {
      property.checked ? $scope.totalChecked++ : $scope.totalChecked--;
    }

    $scope.updateAllChecks = function(){
      $scope.allPropertiesChecked = !$scope.allPropertiesChecked;
      angular.forEach($scope.propertyList, function(prop){
        prop.checked = !prop.preSeeded && $scope.allPropertiesChecked;
      });
    }

    $scope.bulkDeleteProperty = function () {
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.propertyManager.list.bulkDelete.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          var deletePropList = [];
          angular.forEach($scope.propertyList, function (property) {
            property.checked && deletePropList.push(property);
          })
          propertyManagerService.bulkDeleteProperty(deletePropList, function (response) {
            var deleted = response.data;
            var size = deletePropList.length;

            if (deleted <= size) {
              dialogService.notify({
                msg: $filter('translate')(deleted == size ? 'toolManagement.propertyManager.list.delete.success' : 'toolManagement.propertyManager.list.bulkDelete.result', { toDelete: size - deleted, size: size })
              });
            }
            $state.reload();


          })
        }
      })
    }

    $scope.searchSet = null;
    $scope.setSearch = function(search) {
      loggerService.getLogger().log('setSearch:', search, 1);
      $scope.clearSearch(true); 
      $scope.searchSet = search;
      search.name && ($scope.searchCriteria.name = search.name);
      search.name && ($scope.searchCriteria.$_nameDisplay = search.name);
      angular.forEach(search.criteria.fields, function(field) {
        switch (field.field) {
          case 'type':
            angular.forEach($scope.searchOptions.entityTypeOptions, function(eType) {
              eType.$_checked = false;
              switch (field.type) {
                case 'MULTI':
                  angular.forEach(field.value.value, function(t) {
                    if (eType.name == t) {
                      eType.$_checked = true;
                    }
                  });
                  break;
              }
            });
            $scope.entityTypeChanged();
            break;
          case 'status':
            angular.forEach($scope.searchOptions.dataTypeOptions, function(dType) {
              dType.$_checked = false;
              switch (field.type) {
                case 'MULTI':
                  angular.forEach(field.value.value, function(t) {
                    if (dType.name == t) {
                      dType.$_checked = true;
                    }
                  });
                  break;
              }
            });
            $scope.dataTypeChanged();
            break;
          case 'title':
            $scope.searchCriteria.text = field.value.value;
            break;
        }
      });
      
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshPropertyList(0);
    };

    $scope.applySearch = function () {
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshPropertyList(0);
    }

    $scope.clearSearch = function(notrefresh) {
      resetSearchCriteria();
      $scope.propertySearchForm && $scope.propertySearchForm.$setPristine();
      $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.name = null;
      $scope.resetSavedSearchTitle();
      !notrefresh && $scope.refreshPropertyList(0);
    };

    propertyManagerService.getSavedSearch(function(savedSearch) {
      loggerService.getLogger().log('getSavedSearch');
      $scope.savedSearchList = savedSearch.data;
    });

    $scope.searchNameDefined = function(name, description) {
      // loggerService.getLogger().log('search name is ', name);
      $scope.searchCriteria.name = name;
      $scope.searchCriteria.description = description;
      propertyManagerService.saveSearch($scope.searchCriteria, function(data) {
        var savedId = data.data;
        propertyManagerService.getSavedSearch(function(savedSearch) {
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

    $scope.loadMore = function () {
      $scope.refreshPropertyList($scope.propertyList.length);
    };

    $scope.delSearch = function(index, $event) {
      dialogService.confirm({
        msg: $filter('translate')('search.del.confirm'),
        ok: function() {
          var search = $scope.savedSearchList[index];
          propertyManagerService.delSavedSearch(search, function() {
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


    /* ---------- Property Table ---------- */
    $scope.getEmptyProperty = function () {
      return {
        id: null,
        parentName: "User",
        type: $scope.searchOptions.dataTypeOptions[0].label,
        isEdit: true,
        nameEditable: true
      }
    }

    $scope.addProperty = function () {
      var l = $scope.getEmptyProperty();
      $scope.propertyList.push(l)
    //  $scope.propertyList.unshift(l);

     $(document).ready(function() {
      var element = document.getElementById('resource-list-table');
      element.scrollIntoView(false);
    }); 
    }

    $scope.updateProperty = function (property) {
      property.parentNameOld = property.parentName;
      property.labelOld = property.label;
      property.nameOld = property.name;
      property.typeOld = property.type;
      property.isEdit = true;
    }

    $scope.saveEdit = function (frm, property) {
      if (frm.$invalid) {
        frm.$setDirty();
        for (var field in frm) {
          if (field[0] == '$')
            continue;
          frm[field].$touched = true;
        }
        $scope.$broadcast('scrollto');
        return;
      }

      propertyManagerService.saveProperty(property, function (response) {
        if (response && response.statusCode != '1000') {
          dialogService.notify({
            msg: $filter('translate')(response.data ? response.data.statusMessage : response.message),
          });
          if(response.statusCode == '7014'){
            $scope.revertValues(property);
          }
          property.isEdit = true;
        } else {
          property.id = response.data;
          property.nameEditable = false;
          property.isEdit = false;
        }
      });
    }

    $scope.cancelEdit = function (property) {
      if (!property.name) {
        $scope.propertyList.splice($scope.propertyList.indexOf(property), 1);
      }
      $scope.revertValues(property);
      property.isEdit = false;
    }

    $scope.revertValues = function(property){
      property.parentName = property.parentNameOld;
      property.label = property.labelOld;
      property.name = property.nameOld;
      property.type = property.typeOld;
    }

    $scope.deleteProperty = function (property, index) {
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.propertyManager.list.bulkDelete.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          propertyManagerService.deleteProperty(property, function (response) {
            if (response && response.statusCode == '1002') {
              //$scope.propertyList.splice(index, 1);
              $scope.refreshPropertyList(0);
            }
            dialogService.notify({
              msg: $filter('translate')(response.data ? response.data.statusMessage : response.message),
            });
          });
        }
      })
    }


    /* **************Search Form ********** */
    $scope.updateEntityType = function() {
      $scope.searchCriteria.entityTypes = [];
      angular.forEach($scope.searchOptions.entityTypeOptions, function(type) {
        if (type.$_checked) $scope.searchCriteria.entityTypes.push(type);
      });
      if ($scope.searchOptions.$allEntityTypeChecked) {
        $scope.searchOptions.entityTypeLabel = $filter('translate')('resourcesearch.title.AllTypes');
      } else {
        $scope.searchOptions.entityTypeLabel = '';
        angular.forEach($scope.searchCriteria.entityTypes, function(type, index) {
          if (index > 0) $scope.searchOptions.entityTypeLabel += ', ';
          $scope.searchOptions.entityTypeLabel += type.label;
        });
      }
    };

    $scope.allEntityTypeChanged = function() {
      angular.forEach($scope.searchOptions.entityTypeOptions, function(type) {
        type.$_checked = !$scope.searchOptions.$allEntityTypeChecked;
      });
      $scope.entityTypeChanged();
    };

    $scope.entityTypeChanged = function() {
      var allEntityTypeChecked = true;
      angular.forEach($scope.searchOptions.entityTypeOptions, function(type) {
        allEntityTypeChecked = allEntityTypeChecked && !type.$_checked;
      });
      $scope.searchOptions.$allEntityTypeChecked = allEntityTypeChecked;
      $scope.updateEntityType();
    };

    $scope.updateDataType = function() {
      $scope.searchCriteria.dataTypes = [];
      angular.forEach($scope.searchOptions.dataTypeOptions, function(type) {
        if (type.$_checked) $scope.searchCriteria.dataTypes.push(type);
      });
      if ($scope.searchOptions.$allDataTypeChecked) {
        $scope.searchOptions.dataTypeLabel = $filter('translate')('resourcesearch.title.AllTypes');
      } else {
        $scope.searchOptions.dataTypeLabel = '';
        angular.forEach($scope.searchCriteria.dataTypes, function(type, index) {
          if (index > 0) $scope.searchOptions.dataTypeLabel += ', ';
          $scope.searchOptions.dataTypeLabel += type.label;
        });
      }
    };

    $scope.allDataTypeChanged = function() {
      angular.forEach($scope.searchOptions.dataTypeOptions, function(type) {
        type.$_checked = !$scope.searchOptions.$allDataTypeChecked;
      });
      $scope.dataTypeChanged();
    };

    $scope.dataTypeChanged = function() {
      var allDataTypeChecked = true;
      angular.forEach($scope.searchOptions.dataTypeOptions, function(type) {
        allDataTypeChecked = allDataTypeChecked && !type.$_checked;
      });
      $scope.searchOptions.$allDataTypeChecked = allDataTypeChecked;
      $scope.updateDataType();
    };

    var buttonListForBackToList = [{
      label: $filter('translate')('BACK TO TOOL LIST'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        $state.go('PolicyStudio.Enrollment');
        callback && callback();
      }
    }, {
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        // console.log('stay');
        callback && callback();
      }
    }];

    $scope.backToToolsList = function(frm) {
      var hasEditingRow = false;

      angular.forEach($scope.propertyList, function(item) {
        hasEditingRow = hasEditingRow || item.isEdit;
      });
      
      if (frm.$pristine || !hasEditingRow) {
        $scope.propertyForm.val.$setPristine();
        $state.go('PolicyStudio.Enrollment');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createpolicy.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };
  }]);