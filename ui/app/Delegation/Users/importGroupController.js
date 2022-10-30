delegationApp.controller('importGroupController', ['$scope', 'dialogService', '$state', '$rootScope', '$filter', 'delegationUserService', 'loginConfigService', 'userService',
  function($scope, dialogService, $state, $rootScope, $filter, delegationUserService, loginConfigService, userService) {
    userService.goBackIfAccessDenied('MANAGE_USERS');
    $scope.loginConfigList = [];
    $scope.numOfRecordsList = [20, 100, 500, 1000];
    $scope.pageSize = {};
    $scope.pageSize.size = $scope.numOfRecordsList[0];
    $scope.numOfRecords = $scope.pageSize.size;
    $scope.searchText = {};
    $scope.searchText.text = "";
    $scope.hasMoreResults = false;
    $scope.searchInvalid = false;
    $scope.noGroupFound = false;
    $scope.groupList = [];
    $scope.cookieForNextPage = null;
    $scope.attributeList = [];
    $scope.loginConfig = null;
    
    $scope.checkStatus = {
      allGroupsChecked: false
    };
    
    delegationUserService.getUserTypeList().then(function(response) {
      $scope.searchOptions.typeOptions = response.data;
    });
    
    loginConfigService.listLoginConfig().then(function(response) {
      angular.forEach(response.data, function(config) {
        if(config.type == 'OIDC') {
          $scope.loginConfigList.push(config);
        }
      });

      if($scope.loginConfigList.length){
        $scope.setLoginConfig($scope.loginConfigList[0]);
        $scope.loadGroup();
      }
    });
    
    var safeForStateChange = function() {
      return !$filter('filter')($scope.groupList, {
        $checked: true
      }).length;
    };

    $rootScope.immediateStateChange = function() {
      return safeForStateChange();
    };

    $rootScope.stateChangeHook = function(state) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.group.import.confirm.group.import.pending'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function() {
          $rootScope.immediateStateChange = function() {
            return true;
          };
          $state.go(state.name, state.params)
        },
        cancel: function() {}
      });
    };

    $scope.checkAllGroups = function() {
      angular.forEach($scope.groupList, function(group) {
        group.$checked = $scope.checkStatus.allGroupsChecked;
      });
    };

    $scope.groupCheckStatusChange = function() {
      $scope.checkStatus.allGroupsChecked = $filter('filter')($scope.groupList, {
        $checked: true
      }).length == $scope.groupList.length;
    };
    
    $scope.setPageSize = function(number){
       $scope.pageSize = number;
    };

    $scope.setLoginConfig = function(loginConfig){
      $scope.loginConfig = loginConfig;
    };

    $scope.validateAndSearch = function(){
      $scope.noGroupFound = false;
      $scope.searchInvalid = false;
      if($scope.searchText.text.indexOf('(') !== -1 || $scope.searchText.text.indexOf(')') !== -1){
        $scope.searchInvalid = true;
        return;
      }else {
        $scope.importFrom($scope.loginConfig,1);
      }
    };

    $scope.importFrom = function(loginConfig, forceReload) {
	    $scope.hasMoreResults = false;
      if (!forceReload && loginConfig == $scope.loginConfig)
        return;
      
      $scope.groupList = [];
      $scope.attributeList = [];
      $scope.checkStatus.allGroupsChecked = false;
      $scope.cookieForNextPage = null;
      $scope.loadGroup();
    };

    $scope.loadGroup = function() {
      var option = {};
      option.handlerId = $scope.loginConfig.id;
      option.pageSize = $scope.pageSize.size;
      option.searchText = $scope.searchText.text;
      
      delegationUserService.getGroupListToImport(option).then(function(response) {
        if (response.data && response.data.adGroups) {
          $scope.hasMoreResults = response.data.hasMoreResults;
          $scope.numOfRecords = $scope.pageSize.size;
          $scope.groupList = $scope.groupList.concat(response.data.adGroups.filter(function(group) {
            return true;
          }));
        }
        $scope.cookieForNextPage = response.data && response.data.cookieStr;
        if (!$scope.groupList || !$scope.groupList.length) {
          $scope.noGroupFound = true;
        } 
      });
    };

    $scope.importGroup = function() {
      var groupList = $filter('filter')($scope.groupList, {
        $checked: true
      }).map(function(group) {
        return {
          authHandlerId: group.authHandlerId,
          externalId: group.externalId,
          name: group.name,
          description: group.description
        }
      });

      delegationUserService.importGroup(groupList).then(function(response) {
        if(response.statusCode && response.statusCode[0] == '1') {
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('delegation.group.import.notify.group.imported')
          });
          $scope.importFrom($scope.loginConfig, true);
        } else {
          var invalidGroup = [];
          var failedGroup = {};
          angular.forEach(response.data[0].details, function(detail) {
            failedGroup[detail.name] = true;
            switch(detail.msgCode) {
              case "6006":
                invalidGroup.push(detail.name);
                break;
            }
          })
          if(groupList.length > response.data[0].details.length)
          angular.forEach(groupList, function(group) {
            if(!failedGroup[group.name] || invalidGroup.indexOf(group.name) > -1) {
              $scope.groupList.splice($scope.groupList.indexOf(group), 1);
            }
          });
          if(response.data[0].details.length == invalidGroup.length) {
            dialogService.notify({
              msg: $filter('translate')('delegation.group.import.notify.group.import.invalid', {
                group: invalidGroup
              }),
              ok: function() {
                $scope.importFrom($scope.loginConfig, true);
              }
            });
          } else if(response.data[0].details.length > invalidGroup.length) {
            dialogService.notify({
              msg: $filter('translate')('delegation.group.import.notify.group.import.invalid', {
                group: invalidGroup
              }) + $filter('translate')('delegation.group.import.notify.group.import.failed')
            });
          }
        }
      })
    };
  }
]);