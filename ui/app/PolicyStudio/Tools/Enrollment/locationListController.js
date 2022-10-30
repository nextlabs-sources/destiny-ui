policyStudio.controller('locationListController', ['$scope', '$state', 'toolEnrollmentService', 'loggerService', '$filter', '$uibModal',
  'dialogService', 'viewCacheService', '$q', 
  function ($scope, $state,
    toolEnrollmentService, loggerService, $filter, $uibModal, dialogService, viewCacheService, $q) {

    var cachedCriteria = viewCacheService.getCachedView("PS-LOCATION-LIST");
    var logger = loggerService.getLogger();

    $scope.locationForm = {
      val: null,
    }

    $scope.show_search = false;
    $scope.searchCriteria = {
      text: null,
      sortBy: null
    };

    $scope.searchCriteria.searchOptions = $scope.searchOptions = {
      sortOptions: []
    };

    
    var criteriaPristine = function(criteria) {
      return !criteria.text;
    }

    $scope.searchCriteria.pristine = true;
    var searchArgPromises = [];
    searchArgPromises.push(toolEnrollmentService.retrieveSearchOption(function (searchOptions) {
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
      $scope.refreshLocationList(0);
      $scope.$watch(function() {
        return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
      }, function(newValue, oldValue) {
        if (newValue === oldValue) {
          return
        }
        loggerService.getLogger().log('should get new location list now.', 1);
        $scope.refreshLocationList(0);
      }, true);
    });

    $scope.resetSavedSearchTitle = function() {
      $scope.searchCriteria.$_nameDisplay = $filter('translate')("policylist.title.savedSearches");
      $scope.searchCriteria.name = null;
    }
    $scope.resetSavedSearchTitle();

    var resetSearchCriteria = function () {
      $scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];
      //$scope.searchSet = null;
      $scope.searchCriteria.text = null;
    };

    var searchReq = {};
    $scope.refreshLocationList = function (startPos) {
      if (startPos == 0) {
        $scope.locationList = [];
        $scope.locationTotal = 0;
      }

      searchReq = angular.copy($scope.searchCriteria);
      toolEnrollmentService.getLocations(searchReq, startPos, function (locationList) {
        $scope.locationList = startPos==0? locationList.data: $scope.locationList.concat(locationList.data);
        $scope.locationTotal = locationList.totalNoOfRecords;
        angular.forEach($scope.locationList, function (loc) {
          loc.isEdit = false;
          loc.nameOld = '';
          loc.valueOld = '';
          loc.checked = false;
          loc.nameEditable = false;
        })
      });
    }

    $scope.allLocationsChecked = false;
    $scope.totalChecked = 0;

    $scope.checkLocation = function (loc) {
      loc.checked ? $scope.totalChecked++ : $scope.totalChecked--;
    }

    $scope.updateAllChecks = function(){
      $scope.allLocationsChecked = !$scope.allLocationsChecked;
      angular.forEach($scope.locationList, function(loc){
        loc.checked = $scope.allLocationsChecked;
      });
    }

    $scope.bulkDeleteLocation = function () {
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.locationManager.list.bulkDelete.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          var deleteLocList = [];
          angular.forEach($scope.locationList, function (loc) {
            loc.checked && deleteLocList.push(loc);
          })
          toolEnrollmentService.bulkDeleteLocation(deleteLocList, function (response) {
            var deleted = response.data;
            var size = deleteLocList.length;

            if (deleted <= size) {
              dialogService.notify({
                msg: $filter('translate')(deleted == size ? 'toolManagement.locationManager.list.delete.success' : 'toolManagement.locationManager.list.bulkDelete.result', { toDelete: size - deleted, size: size })
              });
            }
            $state.reload();


          })
        }
      })
    }

    var validateFile = function(file){
      toolEnrollmentService.validateFile(file, function(response) {
        if(response.statusCode == 1000){ //validate file
          bulkImportLocation(file);
        } else{ //invalid file
          dialogService.confirm({
            msg: $filter('translate')('toolManagement.locationManager.list.bulkImport.errors.confirm'),
            confirmLabel: $filter('translate')('PROCEED'),
            cancelLabel: $filter('translate')('RE-UPLOAD FILE'),
            ok: function() {
              bulkImportLocation(file);
            },
            cancel: function() {
              $scope.openImportModal();
            }
          })
        }
      });
    }
    var bulkImportLocation = function(file) {
      toolEnrollmentService.bulkImportLocation(file, function(response) {
        var msg = response.message;
        $scope.refreshLocationList(0);
        if(response.statusCode == '1000'){ //Success
          var size = response.data;
          dialogService.notify({
            msg: $filter('translate')('toolManagement.locationManager.list.bulkImport.result', {size: size}),
            html: true,
            timeout:5000
          });
        } else{
          dialogService.notify({
            msg: msg,
            html: true,
            timeout:5000
          });
        }
        
      })
    }

    $scope.openImportModal = function() {
      var modalScope;
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/partials/import-modal.html',
        controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
          modalScope = $scope;
          $scope.fileChosen = function($event) {
            $scope.fileToImport = $event.target.files[0];
            $scope.fileToImportName = $scope.fileToImport.name;
            $scope.$digest();
          }
          $scope.import = function() {
            $uibModalInstance.dismiss('cancel');
            validateFile($scope.fileToImport);
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

    $scope.searchSet = null;
    $scope.setSearch = function(search) {
      loggerService.getLogger().log('setSearch:', search, 1);
      $scope.clearSearch(true); 
      $scope.searchSet = search;
      search.name && ($scope.searchCriteria.name = search.name);
      search.name && ($scope.searchCriteria.$_nameDisplay = search.name);
      angular.forEach(search.criteria.fields, function(field) {
        switch (field.field) {
          case 'title':
            $scope.searchCriteria.text = field.value.value;
            break;
        }
      });
      
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshLocationList(0);
    };

    $scope.applySearch = function () {
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshLocationList(0);
    }

    $scope.clearSearch = function(notrefresh) {
      resetSearchCriteria();
      $scope.locationSearchForm && $scope.locationSearchForm.$setPristine();
      $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.name = null;
      $scope.resetSavedSearchTitle();
      !notrefresh && $scope.refreshLocationList(0);
    };

    toolEnrollmentService.getSavedSearch(function(savedSearch) {
      loggerService.getLogger().log('getSavedSearch');
      $scope.savedSearchList = savedSearch.data;
    });

    $scope.searchNameDefined = function(name, description) {
      // loggerService.getLogger().log('search name is ', name);
      $scope.searchCriteria.name = name;
      $scope.searchCriteria.description = description;
      toolEnrollmentService.saveSearch($scope.searchCriteria, function(data) {
        var savedId = data.data;
        toolEnrollmentService.getSavedSearch(function(savedSearch) {
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
      $scope.refreshLocationList($scope.locationList.length);
    };

    $scope.delSearch = function(index, $event) {
      dialogService.confirm({
        msg: $filter('translate')('search.del.confirm'),
        ok: function() {
          var search = $scope.savedSearchList[index];
          toolEnrollmentService.delSavedSearch(search, function() {
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


    /* ---------- Location Table ---------- */
    $scope.getEmptyLocation = function () {
      return {
        id: null,
        parentId: null,
        name: '',
        value: '',
        isEdit: true,
        nameEditable: true
      }
    }

    $scope.addLocation = function () {
      var l = $scope.getEmptyLocation();
      $scope.locationList.unshift(l);
    }

    $scope.updateLocation = function (loc) {
      loc.nameOld = loc.name;
      loc.valueOld = loc.value;
      loc.isEdit = true;
    }

    $scope.saveEdit = function (frm, loc) {
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

      toolEnrollmentService.saveLocation(loc, function (response) {
        if (response && response.statusCode != '1000') {
          dialogService.notify({
            msg: $filter('translate')(response.data ? response.data.statusMessage : response.message),
          });
          loc.isEdit = true;
        } else {
          loc.parentId = response.data;
          loc.nameEditable = false;
          loc.isEdit = false;
        }
      });
    }

    $scope.cancelEdit = function (loc) {
      if (!loc.nameOld) {
        $scope.locationList.splice($scope.locationList.indexOf(loc), 1);
      }
      loc.name = loc.nameOld;
      loc.value = loc.valueOld;
      loc.isEdit = false;
    }

    $scope.deleteLocation = function (loc, index) {
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.locationManager.list.bulkDelete.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          toolEnrollmentService.deleteLocation(loc, function (response) {
            if (response && response.statusCode == '1002') {
             //$scope.locationList.splice(index, 1);
             $scope.refreshLocationList(0);
            }
            dialogService.notify({
              msg: $filter('translate')(response.data ? response.data.statusMessage : response.message),
            });
          });
        }
      })
    }
    /* ------------------------------------- */

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

      angular.forEach($scope.locationList, function(item) {
        hasEditingRow = hasEditingRow || item.isEdit;
      });
      
      if (frm.$pristine || !hasEditingRow) {
        $scope.locationForm.val.$setPristine();
        $state.go('PolicyStudio.Enrollment');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createpolicy.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };

    $scope.didCreateLocationName = function (loc, index) {
      return (loc.name) ? 'loc-input-name-' + $filter('id')(loc.name) : 'loc-input-name-' + index.toString()
    }

    $scope.didCreateLocationIP = function (loc, index) {
      return (loc.name) ? 'loc-input-ip-' + $filter('id')(loc.name) : 'loc-input-ip-' + index.toString()
    }
  }
]);