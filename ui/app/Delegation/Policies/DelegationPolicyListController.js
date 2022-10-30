delegationApp.controller('DelegationPolicyListController', ['$scope', 'autoCloseOptionService', 'dialogService', 'networkService', 'configService', 'loggerService', '$location', '$anchorScroll', '$state', '$rootScope', '$filter', 'delegationService', '$window', 'userService', '$uibModal',
  function($scope, autoCloseOptionService, dialogService, networkService, configService, loggerService, $location, $anchorScroll, $state, $rootScope, $filter, delegationService, $window, userService, $uibModal) {
    var logger = loggerService.getLogger();
    $scope.$parent.$parent.isCreatePage = false;
    userService.goBackIfAccessDenied('MANAGE_DELEGATION_POLICIES');
    $scope.delegationList = [];
    $scope.instantSearch = configService.configObject.instantSearch;
    $scope.show_search = false;
    var delegationWithOpenOption = [];
    $scope.searchCriteria = {
      effect: []
    };
    $scope.searchOptions = {
      effectOptions: [{
        "name": "allow",
        "label": "Allow"
      }, {
        "name": "deny",
        "label": "Deny"
      }],
      sortOptions: [{
        "name": "lastUpdatedDate",
        "label": "Last Updated"
      }, {
        "name": "name",
        "label": "Name"
      }],
      $allEffectChecked: true,
      effectLabel: null
    };
    $scope.searchCriteria.pristine = true;
    $scope.updateEffect = function() {
      $scope.searchCriteria.effect = [];
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        if (effect.$_checked) $scope.searchCriteria.effect.push(effect);
      });
      if ($scope.searchOptions.$allEffectChecked) {
        $scope.searchOptions.effectLabel = $filter('translate')('delegation.search.title.AllEffect');
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
    };
    $scope.setDirty = function() {
      $scope.searchCriteria.pristine = false;
      $scope.searchCriteria.name = null;
    };
    $scope.refreshDelegationList = function() {
      $scope.delegationList = [];
      $scope.delegationTotal = 0;
      $scope.checkStatus.allDelegationChecked = false;
      $scope.checkStatus.hasDelegationChecked = false;
      delegationService.getDelegations($scope.searchCriteria, 0, function(delegationList) {
        $scope.delegationList = delegationList.data;
        $scope.delegationTotal = delegationList.totalNoOfRecords;
      });
    }
    var resetSearchCriteria = function() {
      $scope.searchCriteria.sortBy = $scope.getDelegationPoliciesSortBy();
      angular.forEach($scope.searchOptions.effectOptions, function(effect) {
        effect.$_checked = false;
      });
      $scope.searchCriteria.text = null;
      $scope.effectChanged();
      $scope.updateEffect();
    };

     $scope.setDelegationPoliciesSortBy = function(sort) {
        $scope.searchCriteria.sortBy = sort;
        localStorage.setItem('delegationPolicies.sortBy', JSON.stringify(sort));
    };

    $scope.getDelegationPoliciesSortBy = function() {
        return localStorage.getItem('delegationPolicies.sortBy') === null ? $scope.searchOptions.sortOptions[0] : JSON.parse(localStorage.getItem('delegationPolicies.sortBy'));
    }


    resetSearchCriteria();
    $scope.clearSearch = function() {
      resetSearchCriteria();
      $scope.delegationSearchForm && $scope.delegationSearchForm.$setPristine();
      $scope.searchCriteria.pristine = true;
      $scope.searchCriteria.name = null;
      $scope.refreshDelegationList();
    };
    $scope.applySearch = function() {
      logger.log('manually refresh');
      $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
      $scope.refreshDelegationList();
    }
    var criteriaPristine = function(criteria) {
      return !criteria.effect.length && !criteria.text;
    }
    $scope.closeAllOpenOption = function() {
      if (delegationWithOpenOption.length > 0) {
        angular.forEach(delegationWithOpenOption, function(delegation) {
          logger.log(delegation)
          if (delegation.optionOpen) delegation.optionOpen = false;
        });
        delegationWithOpenOption = [];
      }
    }
    $scope.openOption = function(delegation, open, $event) {
      if (angular.isDefined(open)) {
        delegation.optionOpen = open;
        if (open) {
          $scope.closeAllOpenOption();
          autoCloseOptionService.close();
          autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
          delegationWithOpenOption.push(delegation);
        } else {
          delegationWithOpenOption = [];
        }
      } else return angular.isDefined(delegation.optionOpen) ? delegation.optionOpen : false;
    };
    $scope.checkStatus = {
      allDelegationChecked: false,
      hasDelegationChecked: false
    }
    $scope.checkAllDelegation = function(checked) {
      $scope.checkStatus.hasDelegationChecked = checked;
      angular.forEach($scope.delegationList, function(item) {
        item.checked = checked;
      });
    };
    $scope.delegationCheckStatusChange = function() {
      var allDelegationChecked = true;
      var hasDelegationChecked = false;
      angular.forEach($scope.delegationList, function(item) {
        allDelegationChecked = allDelegationChecked && item.checked;
        hasDelegationChecked = hasDelegationChecked || item.checked;
      });
      $scope.checkStatus.allDelegationChecked = allDelegationChecked;
      $scope.checkStatus.hasDelegationChecked = hasDelegationChecked;
    };
    $scope.editDelegation = function(delegation) {
      $state.go('Delegations.edit', {
        delegationId: delegation.id
      });
    };
    $scope.delDelegation = function(delegation) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationService.delDelegation(delegation, function(response) {
            $scope.refreshDelegationList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.list.del.success')
              
            });
          })
        }
      });
    }
    $scope.bulkDelDelegation = function() {
      var ids = $filter('filter')($scope.delegationList, {
        checked: true
      }).map(function(delegation) {
        return delegation.id;
      })
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationService.bulkDelDelegation(ids, function(response) {
            $scope.refreshDelegationList();
          })
        }
      });
    }
    $scope.$watch(function() {
      return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
    }, function(newValue, oldValue) {
      if (newValue === oldValue) {
        return
      }
      $scope.refreshDelegationList();
    }, true);
    $scope.loadMore = function() {
      // loggerService.getLogger().log('loadMore');
      $scope.checkStatus.allDelegationChecked = false;
      delegationService.getDelegations($scope.searchCriteria, $scope.delegationList.length, function(delegationList) {
        $scope.delegationList = $scope.delegationList.concat(delegationList.data);
        $scope.delegationTotal = delegationList.totalNoOfRecords;
      });
    };
    $scope.refreshDelegationList();

    var importDA = function(file) {
      delegationService.importFromFile(file, function(response) {
        var msg = response.message;
        response.data.total_policies && (msg += '<br>' + $filter('translate')('policylist.import.policies.imported', {count:response.data.total_policies}));
        response.data.total_components && (msg += '<br>' + $filter('translate')('policylist.import.policies.imported', {count:response.data.total_components}));
        response.data.total_policy_models && (msg += '<br>' + $filter('translate')('policylist.import.policies.imported', {count:response.data.total_policy_models}));
        // console.log(msg);
        $scope.refreshDelegationList();
        dialogService.notifyWithoutBlocking({
          msg: msg,
          html: true,
          timeout:5000
        });
      })
    }
    $scope.openImportModal = function() {
      var modalScope;
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'ui/app/Delegation/template/import-modal.html',
        controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
          modalScope = $scope;
          $scope.fileChosen = function($event) {
            $scope.fileToImport = $event.target.files[0];
            $scope.fileToImportName = $scope.fileToImport.name;
            $scope.$digest();
          }
          $scope.import = function() {
            $uibModalInstance.dismiss('cancel');
            importDA($scope.fileToImport);
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
    $scope.exportSelectedDA = function() {
      // $scope.show_import_export = false;
      var checkedDAList = $filter('filter')($scope.delegationList, {checked : true});
      var idList = checkedDAList.map(function(item){
        return item.id
      });
      delegationService.getDAExportingLink(idList, function(data) {
        $('#DA-export-download').remove();
        $('<iframe/>', {src: data, id:'DA-export-download'}).hide().appendTo('body');
      })
    }
    $scope.exportAllDA = function() {
      delegationService.getDAExportingLinkForAll(function(data) {
        $('#DA-export-download').remove();
        $('<iframe/>', {src: data, id:'DA-export-download'}).hide().appendTo('body');
      })
    }
  }  
]);