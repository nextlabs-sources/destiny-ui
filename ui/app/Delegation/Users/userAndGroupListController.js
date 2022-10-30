delegationApp.controller('userAndGroupListController',
['$scope', 'autoCloseOptionService', 'dialogService', 'configService', 'loggerService', 
'$state', '$rootScope', '$filter', 'delegationUserService', 'userService', 'loginConfigService',
function($scope, autoCloseOptionService, dialogService, configService, loggerService, $state, 
	$rootScope, $filter, delegationUserService, userService, loginConfigService) {
    var logger = loggerService.getLogger();
    $scope.instantSearch = configService.configObject.instantSearch;
    userService.goBackIfAccessDenied('MANAGE_USERS');
    var userWithOpenOption = [];
    $scope.$parent.$parent.isCreatePage = false;
    $scope.gAuthEnabled = localStorage.getItem('mfaEnabled') ? JSON.parse(localStorage.getItem('mfaEnabled')) : false;
    $scope.searchOptions = {
      userSortOptions: [{
        "name": "lastUpdatedDate",
        "label": "Last Updated",
        "order": "DESC"
      }, {
        "name": "displayName",
        "label": "Name",
        "order": "ASC"
      }],
      userTypeOptions: [],
      groupSortOptions: [{
        "name": "displayName",
        "label": "Name",
        "order": "ASC"
      }],
      groupTypeOptions: []
    };

    $scope.userSearchCriteria = {};
    $scope.groupSearchCriteria = {};

    $scope.userSearchCriteria.pristine = true;
    $scope.groupSearchCriteria.pristine = true;

    $scope.tabs = {
      activeTab: 0,
      hasError: false,
      hasTagError: false,
      hasFolderError: false,
      previousTab: -1
    };

    $scope.checkStatus = {
      allUserChecked: false,
      hasUserChecked: false,
      allGroupChecked: false,
      hasGroupChecked: false
    };


    $scope.handleUserGroupListTab = function(){
      if (window.location.href.indexOf("?/") > -1)
        window.location.href = window.location.href.replace("?", "#");

      var url = window.location.href.substring(
        window.location.href.indexOf("#") + 2
      );
      if (url == "Users/grouplist") {
        $scope.tabs.activeTab = 1
      }else{
        $scope.tabs.activeTab = 0;
      }
    }

    $scope.handleUserGroupListTab();

    $scope.navigate = function(url){
      window.location.href = "/console/#/" + url;
    }

    $scope.checkAllUser = function() {
      angular.forEach($scope.userList, function(item) {
        item.id && (item.checked = $scope.checkStatus.allUserChecked);
      });
      $scope.userCheckStatusChange();
    };

    $scope.checkAllGroups = function() {
      angular.forEach($scope.groupList, function(item) {
        item.id && (item.checked = $scope.checkStatus.allGroupChecked);
      });
      $scope.groupCheckStatusChange();
    };

    $scope.userCheckStatusChange = function() {
      var allUserChecked = true;
      var hasUserChecked = false;
      angular.forEach($scope.userList, function(item) {
        allUserChecked = allUserChecked && (!item.id || item.checked);
        hasUserChecked = hasUserChecked || item.checked;
      });
      $scope.checkStatus.allUserChecked = allUserChecked;
      $scope.checkStatus.hasUserChecked = hasUserChecked;
    };

    $scope.groupCheckStatusChange = function() {
      var allGroupChecked = true;
      var hasGroupChecked = false;
      angular.forEach($scope.groupList, function(item) {
        allGroupChecked = allGroupChecked && (!item.id || item.checked);
        hasGroupChecked = hasGroupChecked || item.checked;
      });
      $scope.checkStatus.allGroupChecked = allGroupChecked;
      $scope.checkStatus.hasGroupChecked = hasGroupChecked;
    };

    loginConfigService.listLoginConfig().then(function(response){
      var obj = {
        authHandlerId : 0,
        name : "internal",
        label : "Internal"
      }
      $scope.searchOptions.userTypeOptions.push(obj);
      angular.forEach(response.data, function(data){
        obj = {
          authHandlerId : data.id,
          name : data.type,
          label : data.name
        }
        $scope.searchOptions.userTypeOptions.push(obj);
        if(data.type == 'OIDC') {
          $scope.searchOptions.groupTypeOptions.push(obj);
        }
      });
    });

    $scope.updateUserType = function() {
      $scope.userSearchCriteria.type = [];
      angular.forEach($scope.searchOptions.userTypeOptions, function(type) {
        if (type.$_checked) $scope.userSearchCriteria.type.push(type);
      });
      if ($scope.searchOptions.$allUserTypeChecked) {
        $scope.searchOptions.typeLabel = $filter('translate')('delegation.search.usertype.all');
      } else {
        $scope.searchOptions.typeLabel = '';
        angular.forEach($scope.userSearchCriteria.type, function(type, index) {
          if (index > 0) $scope.searchOptions.typeLabel += ', ';
          $scope.searchOptions.typeLabel += type.label;
        });
      }
    };

    $scope.updateGroupType = function() {
      $scope.groupSearchCriteria.type = [];
      angular.forEach($scope.searchOptions.groupTypeOptions, function(type) {
        if (type.$_checked) $scope.groupSearchCriteria.type.push(type);
      });
      if ($scope.searchOptions.$allGroupTypeChecked) {
        $scope.searchOptions.typeLabel = $filter('translate')('delegation.search.usertype.all');
      } else {
        $scope.searchOptions.typeLabel = '';
        angular.forEach($scope.groupSearchCriteria.type, function(type, index) {
          if (index > 0) $scope.searchOptions.typeLabel += ', ';
          $scope.searchOptions.typeLabel += type.label;
        });
      }
    };

    $scope.allUserTypeChanged = function() {
      angular.forEach($scope.searchOptions.userTypeOptions, function(type) {
        type.$_checked = !$scope.searchOptions.$allUserTypeChecked;
      });
      $scope.userTypeChanged();
    };

    $scope.allGroupTypeChanged = function() {
      angular.forEach($scope.searchOptions.groupTypeOptions, function(type) {
        type.$_checked = !$scope.searchOptions.$allGroupTypeChecked;
      });
      $scope.groupTypeChanged();
    };

    $scope.userTypeChanged = function() {
      var allUserTypeChecked = true;
      angular.forEach($scope.searchOptions.userTypeOptions, function(type) {
        allUserTypeChecked = allUserTypeChecked && !type.$_checked;
      });
      $scope.searchOptions.$allUserTypeChecked = allUserTypeChecked;
      $scope.updateUserType();
    };

    $scope.groupTypeChanged = function() {
      var allGroupTypeChecked = true;
      angular.forEach($scope.searchOptions.groupTypeOptions, function(type) {
        allGroupTypeChecked = allGroupTypeChecked && !type.$_checked;
      });
      $scope.searchOptions.$allGroupTypeChecked = allGroupTypeChecked;
      $scope.updateGroupType();
    };
    
    $scope.updateUserType();
    $scope.updateGroupType();

    $scope.setUserDirty = function() {
      $scope.userSearchCriteria.pristine = false;
      $scope.userSearchCriteria.name = null;
    };

    $scope.setGroupDirty = function() {
      $scope.groupSearchCriteria.pristine = false;
      $scope.groupSearchCriteria.name = null;
    };

    $scope.refreshUserList = function() {
      $scope.userList = [];
      $scope.userTotal = 0;
      delegationUserService.getUserList($scope.userSearchCriteria, 0, function(userList) {
        $scope.userList = userList.data;
        $scope.userTotal = userList.totalNoOfRecords;
      });
    };

    $scope.refreshGroupList = function() {
      $scope.groupList = [];
      $scope.groupTotal = 0;
      delegationUserService.getGroupList($scope.groupSearchCriteria, 0, function(groupList) {
        $scope.groupList = groupList.data;
        $scope.groupTotal = groupList.totalNoOfRecords;
      });
    };

    var resetUserSearchCriteria = function() {
      $scope.userSearchCriteria.sortBy = $scope.getUserSortBy();
      angular.forEach($scope.searchOptions.userTypeOptions, function(type) {
        type.$_checked = false;
      });
      $scope.userSearchCriteria.text = null;
      $scope.userTypeChanged();
      $scope.updateUserType();
    };

     $scope.setUserSortBy = function(sort) {
        $scope.userSearchCriteria.sortBy = sort;
        localStorage.setItem('userList.sortBy', JSON.stringify(sort));
    };

    $scope.getUserSortBy = function() {
        return localStorage.getItem('userList.sortBy') === null ? $scope.searchOptions.userSortOptions[0] : JSON.parse(localStorage.getItem('userList.sortBy'));
    }

    var resetGroupSearchCriteria = function() {
      $scope.groupSearchCriteria.sortBy = $scope.searchOptions.groupSortOptions[0];
      angular.forEach($scope.searchOptions.groupTypeOptions, function(type) {
        type.$_checked = false;
      });
      $scope.groupSearchCriteria.text = null;
      $scope.groupTypeChanged();
      $scope.updateGroupType();
    };

    resetUserSearchCriteria();
    resetGroupSearchCriteria();
    
    $scope.clearUserSearch = function() {
      resetUserSearchCriteria();
      $scope.userSearchForm && $scope.userSearchForm.$setPristine();
      $scope.userSearchCriteria.pristine = true;
      $scope.userSearchCriteria.name = null;
      $scope.refreshUserList();
    };

    $scope.clearGroupSearch = function() {
      resetGroupSearchCriteria();
      $scope.groupSearchForm && $scope.groupSearchForm.$setPristine();
      $scope.groupSearchCriteria.pristine = true;
      $scope.groupSearchCriteria.name = null;
      $scope.refreshGroupList();
    };
    
    $scope.applyUserSearch = function() {
      logger.log('manually refresh');
      $scope.userSearchCriteria.pristine = criteriaPristine($scope.userSearchCriteria);
      $scope.refreshUserList();
    };
    
    $scope.applyGroupSearch = function() {
      logger.log('manually refresh');
      $scope.groupSearchCriteria.pristine = criteriaPristine($scope.groupSearchCriteria);
      $scope.refreshGroupList();
    };
    
    var criteriaPristine = function(criteria) {
      return !criteria.type.length && !criteria.text;
    };
    
    $scope.editUser = function(user) {
      $state.go('Users.edituser', {
        userId: user.id
      });
    };
    
    $scope.closeAllOpenOption = function() {
      if (userWithOpenOption.length > 0) {
        angular.forEach(userWithOpenOption, function(user) {
          logger.log(user)
          if (user.optionOpen) user.optionOpen = false;
        });
        userWithOpenOption = [];
      }
    };
    
    $scope.openOption = function(user, open, $event) {
      if (angular.isDefined(open)) {
        user.optionOpen = open;
        if (open) {
          $scope.closeAllOpenOption();
          autoCloseOptionService.close();
          autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
          userWithOpenOption.push(user);
        } else {
          userWithOpenOption = [];
        }
      } else return angular.isDefined(user.optionOpen) ? user.optionOpen : false;
    };
    
    $scope.delUser = function(user) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationUserService.removeUser(user, function(response) {
            $scope.refreshUserList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.userlist.del.success')
            });
          })
        }
      });
    };
    
    $scope.delGroup = function(group) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationUserService.removeGroup(group, function(response) {
            $scope.refreshGroupList();
            $scope.refreshUserList();

            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.grouplist.del.success')
            });
          })
        }
      });
    };

    $scope.resetGAuthToken = function(user) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.userlist.reset.gauth.token.confirm'),
        confirmLabel: $filter('translate')('RESET'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationUserService.resetGAuthToken(user, function(response) {
            $scope.refreshUserList();
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.userlist.reset.gauth.token.success')
            });
          })
        }
      });
    };

    $scope.unlockUser = function(user) {
      delegationUserService.unlockUser(user, function(response) {
        $scope.refreshUserList();
        dialogService.notifyWithoutBlocking({
          msg: $filter('translate')('delegation.userlist.unlocked.success')
        });
      });
    };

    $scope.bulkDelUser = function() {
      var ids = $filter('filter')($scope.userList, {
        checked: true
      }).map(function(delegation) {
        return delegation.id;
      })
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationUserService.bulkDelUser(ids, function(response) {
            $scope.refreshUserList();

            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.userlist.del.success')
            });
          })
        }
      });
    };

    $scope.bulkDelGroup = function() {
      var ids = $filter('filter')($scope.groupList, {
        checked: true
      }).map(function(delegation) {
        return delegation.id;
      })
      dialogService.confirm({
        msg: $filter('translate')('delegation.list.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          delegationUserService.bulkDelGroup(ids, function(response) {
            $scope.refreshGroupList();
            $scope.refreshUserList();
            
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('delegation.grouplist.del.success')
            });
          })
        }
      });
    };

    $scope.$watch(function() {
      return $scope.instantSearch ? $scope.userSearchCriteria : $scope.userSearchCriteria.sortBy
    }, function(newValue, oldValue) {
      if (newValue === oldValue) return
      $scope.refreshUserList();
    }, true);

    $scope.loadMore = function() {
      delegationUserService.getUserList($scope.userSearchCriteria, $scope.userList.length, function(userList) {
        $scope.userList = $scope.userList.concat(userList.data);
        $scope.delegationTotal = userList.totalNoOfRecords;
      });
    };


    $scope.refreshUserList();
    $scope.refreshGroupList();
}]);