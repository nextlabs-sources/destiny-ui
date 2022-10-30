delegationApp.controller('importUserController', ['$scope', 'dialogService', 'loggerService', '$state', '$rootScope', '$filter', 'delegationUserService', 'loginConfigService', 'userService',
  function($scope, dialogService, loggerService, $state, $rootScope, $filter, delegationUserService, loginConfigService, userService) {
    var logger = loggerService.getLogger();
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
    $scope.noUserFound = false;
    $scope.userList = [];
    $scope.cookieForNextPage = null;
    $scope.attributeList = [];
    $scope.loginConfig = null;
    $scope.checkStatus = {
      allUserChecked: false
    };
    delegationUserService.getUserTypeList().then(function(response) {
      $scope.searchOptions.typeOptions = response.data;
    });
    loginConfigService.listLoginConfig().then(function(response) {
      angular.forEach(response.data, function(config) {
        if(config.type == 'LDAP' || config.type == 'OIDC') {
          $scope.loginConfigList.push(config);
        }
      })

      if($scope.loginConfigList.length){
        $scope.setLoginConfig($scope.loginConfigList[0]);
        $scope.loadUser();
      }
    });
    var safeForStateChange = function() {
      return !$filter('filter')($scope.userList, {
        $checked: true
      }).length;
    }
    $rootScope.immediateStateChange = function() {
      return safeForStateChange();
    }
    $rootScope.stateChangeHook = function(state) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.user.import.confirm.user.import.pending'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function() {
          $rootScope.immediateStateChange = function() {
            return true;
          };
          $state.go(state.name, state.params)
        },
        cancel: function() {}
      })
    }
    $scope.checkAllUser = function() {
      angular.forEach($scope.userList, function(user) {
        user.$checked = $scope.checkStatus.allUserChecked;
      })
    }
    $scope.userCheckStatusChange = function() {
      $scope.checkStatus.allUserChecked = $filter('filter')($scope.userList, {
        $checked: true
      }).length == $scope.userList.length;
    }
    
    $scope.setPageSize = function(number){
       $scope.pageSize = number;
       
    }
    $scope.setLoginConfig = function(loginConfig){
      $scope.loginConfig = loginConfig;
    }
    $scope.validateAndSearch = function(){
      $scope.noUserFound = false;
      $scope.searchInvalid = false;
      if($scope.searchText.text.indexOf('(') !== -1 || $scope.searchText.text.indexOf(')') !== -1){
        $scope.searchInvalid = true;
        return;
      }else {
        $scope.importFrom($scope.loginConfig,1);
      }
    }

    $scope.importFrom = function(loginConfig, forceReload) {
	  $scope.hasMoreResults = false;
      if (!forceReload && loginConfig == $scope.loginConfig)
        return;
      
      logger.log('import user from', loginConfig);
      $scope.userList = [];
      $scope.attributeList = [];
      $scope.checkStatus.allUserChecked = false;
      $scope.cookieForNextPage = null;
      $scope.loadUser();
    };
    $scope.loadUser = function() {
      var option = {};
      option.handlerId = $scope.loginConfig.id;
      option.pageSize = $scope.pageSize.size;
      //option.cookieStr = $scope.cookieForNextPage;
      option.searchText = $scope.searchText.text;
      
      delegationUserService.getUserListToImport(option).then(function(response) {
        if (response.data && response.data.adUsers) {
          $scope.hasMoreResults = response.data.hasMoreResults;
          $scope.numOfRecords = $scope.pageSize.size;
          $scope.userList = $scope.userList.concat(response.data.adUsers.filter(function(user) {
            return true
          }));
        }
        $scope.cookieForNextPage = response.data && response.data.cookieStr;
        if (!$scope.userList || !$scope.userList.length) {
/*          dialogService.notify({
            msg: $filter('translate')('No user found for the specified configuration.'),
          })*/
          $scope.noUserFound = true;
        } 
      });
    }
    $scope.importUser = function() {
      var userList = $filter('filter')($scope.userList, {
        $checked: true
      }).map(function(user) {
        return {
          externalId: user.externalId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          authHandlerId: user.authHandlerId
        }
      });
      logger.log('trying to import following users:', userList);
      delegationUserService.importUser(userList).then(function(response) {
        if(response.statusCode && response.statusCode[0] == '1') {
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('delegation.user.import.notify.user.imported')
          });
          $scope.importFrom($scope.loginConfig, true);
        } else {
          var invalidUser = [];
          var failedUser = {};
          angular.forEach(response.data[0].details, function(detail) {
            failedUser[detail.name] = true;
            switch(detail.msgCode) {
              case "6006":
                invalidUser.push(detail.name);
                break;
            }
          })
          if(userList.length > response.data[0].details.length)
          angular.forEach(userList, function(user) {
            if(!failedUser[user.username] || invalidUser.indexOf(user.username) > -1) {
              $scope.userList.splice($scope.userList.indexOf(user), 1);
            }
          });
          if(response.data[0].details.length == invalidUser.length) {
            dialogService.notify({
              msg: $filter('translate')('delegation.user.import.notify.user.import.invalid', {
                user: invalidUser
              }),
              ok: function() {
                $scope.importFrom($scope.loginConfig, true);
              }
            });
          }
          else if(response.data[0].details.length > invalidUser.length) {
            dialogService.notify({
              msg: $filter('translate')('delegation.user.import.notify.user.import.invalid', {
                user: invalidUser
              }) + $filter('translate')('delegation.user.import.notify.user.import.failed')
            });
          }
        }
      })
    };
  }
]);