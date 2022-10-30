policyStudio.controller('enrolledDataViewerController', ['$scope', '$state', 'enrolledDataViewerService', 'loggerService', '$filter', '$uibModal',
  'dialogService',  'viewCacheService', '$q',  function ($scope, $state,
    enrolledDataViewerService, loggerService, $filter, $uibModal, dialogService, viewCacheService, $q) {
    var cachedCriteria = viewCacheService.getCachedView("PS-ENROLLED-DATA-LIST");
    var logger = loggerService.getLogger();

    $scope.groups = {
      selected : null,
      path: []
    }

    $scope.showSearch = false;
    $scope.searchCriteria = {
      types: [],
      enrollments: [],
      text: null,
      sortBy: null
    };

    $scope.searchCriteria.searchOptions = $scope.searchOptions = {
      typeOptions: [],
      enrollmentOptions: [],
      sortOptions: [],
      $allTypesChecked: true,
      $allEnrollmentsChecked: true
    };

    var criteriaPristine = function(criteria) {
      return !criteria.types.length && !criteria.enrollments.length && !criteria.text;
    }

    $scope.searchCriteria.pristine = true;
    var searchArgPromises = [];
    searchArgPromises.push(enrolledDataViewerService.retrieveSearchOption(function (searchOptions) {
      $scope.searchOptions.typeOptions = searchOptions.data.typeOptions;
      $scope.searchOptions.enrollmentOptions = searchOptions.data.enrollmentOptions;
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
        $scope.refreshElementList(0);
        $scope.$watch(function() {
          return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
        }, function(newValue, oldValue) {
          if (newValue === oldValue) {
            return
          }
          $scope.refreshElementList(0);
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
      angular.forEach($scope.searchOptions.typeOptions, function(option) {
        option.$_checked = false;
      });
      angular.forEach($scope.searchOptions.enrollmentOptions, function(option) {
        option.$_checked = false;
      });

      $scope.typeChanged();
      $scope.enrollmentChanged();
    };

    var searchReq = {};
    $scope.refreshElementList = function (startPos) {
      if (startPos == 0) {
        $scope.elementList = [];
        $scope.totalElements = 0;
      }
      searchReq = angular.copy($scope.searchCriteria);
      enrolledDataViewerService.getEnrolledData(searchReq, startPos, function (elementList) {
        $scope.elementList = startPos == 0 ? elementList.data : $scope.elementList.concat(elementList.data);
        $scope.totalElements = elementList.totalNoOfRecords;
      });
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
            angular.forEach($scope.searchOptions.typeOptions, function(eType) {
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
            $scope.typeChanged();
            break;
          case 'enrollment':
            angular.forEach($scope.searchOptions.enrollmentOptions, function(dType) {
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
            $scope.enrollmentChanged();
            break;
          case 'title':
            $scope.searchCriteria.text = field.value.value;
            break;
        }
      });
      
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshElementList(0);
    };

    $scope.applySearch = function () {
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshElementList(0);
    }

    $scope.clearSearch = function(notrefresh) {
      resetSearchCriteria();
      $scope.enrolledDataSearchForm && $scope.enrolledDataSearchForm.$setPristine();
      $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.name = null;
      $scope.resetSavedSearchTitle();
      !notrefresh && $scope.refreshElementList(0);
    };

    enrolledDataViewerService.getSavedSearch(function(savedSearch) {
      loggerService.getLogger().log('getSavedSearch');
      $scope.savedSearchList = savedSearch.data;
    });

    $scope.searchNameDefined = function(name, description) {
      $scope.searchCriteria.name = name;
      $scope.searchCriteria.description = description;
      enrolledDataViewerService.saveSearch($scope.searchCriteria, function(data) {
        var savedId = data.data;
        enrolledDataViewerService.getSavedSearch(function(savedSearch) {
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
      $scope.refreshElementList($scope.elementList.length);
    };

    $scope.delSearch = function(index, $event) {
      dialogService.confirm({
        msg: $filter('translate')('search.del.confirm'),
        ok: function() {
          var search = $scope.savedSearchList[index];
          enrolledDataViewerService.delSavedSearch(search, function() {
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

    
    $scope.updateType = function() {
      $scope.searchCriteria.types = [];
      angular.forEach($scope.searchOptions.typeOptions, function(type) {
        if (type.$_checked) $scope.searchCriteria.types.push(type);
      });
      if ($scope.searchOptions.$allTypesChecked) {
        $scope.searchOptions.typeLabel = $filter('translate')('toolManagement.enrolledDataViewer.search.values.allTypes');
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
        type.$_checked = !$scope.searchOptions.$allTypesChecked;
      });
      $scope.typeChanged();
    };

    $scope.typeChanged = function() {
      var allTypesChecked = true;
      angular.forEach($scope.searchOptions.typeOptions, function(type) {
        allTypesChecked = allTypesChecked && !type.$_checked;
      });
      $scope.searchOptions.$allTypesChecked = allTypesChecked;
      $scope.updateType();
    };

    $scope.updateEnrollments = function() {
      $scope.searchCriteria.enrollments = [];
      angular.forEach($scope.searchOptions.enrollmentOptions, function(type) {
        if (type.$_checked) $scope.searchCriteria.enrollments.push(type);
      });
      if ($scope.searchOptions.$allEnrollmentsChecked) {
        $scope.searchOptions.enrollmentsLabel = $filter('translate')('resourcesearch.title.AllTypes');
      } else {
        $scope.searchOptions.enrollmentsLabel = '';
        angular.forEach($scope.searchCriteria.enrollments, function(type, index) {
          if (index > 0) $scope.searchOptions.enrollmentsLabel += ', ';
          $scope.searchOptions.enrollmentsLabel += type.label;
        });
      }
    };

    $scope.allEnrollmentsChanged = function() {
      angular.forEach($scope.searchOptions.enrollmentOptions, function(type) {
        type.$_checked = !$scope.searchOptions.$allEnrollmentsChecked;
      });
      $scope.enrollmentChanged();
    };

    $scope.enrollmentChanged = function() {
      var allEnrollmentsChecked = true;
      angular.forEach($scope.searchOptions.enrollmentOptions, function(type) {
        allEnrollmentsChecked = allEnrollmentsChecked && !type.$_checked;
      });
      $scope.searchOptions.$allEnrollmentsChecked = allEnrollmentsChecked;
      $scope.updateEnrollments();
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
        callback && callback();
      }
    }];

    $scope.backToToolsList = function() {
        $state.go('PolicyStudio.Enrollment');
    };

    $scope.selectedElement = null;
    $scope.open = function (selectedElement) {
      $scope.closeOverview();
      if (selectedElement.type === 'GROUP') {
        $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
        $scope.searchCriteria['group'] = selectedElement.id;
        $scope.groups.selected = selectedElement;
        $scope.groups.path.push(selectedElement);
        $scope.refreshElementList(0);
      } else {
        enrolledDataViewerService.getElement(selectedElement.id, function (data) {
          $scope.selectedElement = data;
        });
      }
    }

    $scope.closeOverview = function() {
      $scope.selectedElement = undefined;
    }

    $scope.goBack = function(selectedElement) {
      while($scope.groups.path.length > 0) {
        let current = $scope.groups.path.pop();
        if(current.id == selectedElement.id) {
          break;
        }
      }
      $scope.open(selectedElement);
    }

    $scope.goToHome = function() {
      $scope.groups.selected = null;
      $scope.groups.path = [];
      $scope.searchCriteria['group'] =  null;
      $scope.refreshElementList(0);
    }

  }]);