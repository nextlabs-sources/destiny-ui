delegationApp.controller('loginConfigListController', ['$scope', 'autoCloseOptionService', 'dialogService', 'networkService', 'userService', 'loggerService', '$location', '$anchorScroll', '$state', '$rootScope', '$filter', 'loginConfigService',
  function($scope, autoCloseOptionService, dialogService, networkService, userService, loggerService, $location, $anchorScroll, $state, $rootScope, $filter, loginConfigService) {
    var logger = loggerService.getLogger();
    userService.goBackIfAccessDenied('MANAGE_USERS');
    $scope.checkAllConfig = function() {
      angular.forEach($scope.configList, function(item) {
        item.id && (item.checked = $scope.checkStatus.allConfigChecked);
      });
      $scope.configCheckStatusChange();
    };
    $scope.refreshList = function() {
      $scope.configList = [];
      loginConfigService.listLoginConfig().then(function(configList) {
        $scope.configList = configList.data;
      });
    }
    $scope.editConfig = function(config) {
      if(config.inUse){
        dialogService.notifyInfo({
          msg: $filter('translate')('delegation.loginConfig.msg.userSource.notifyEdit'),
        });
      }
      $state.go('LoginConfig.modify', {
        id: config.id
      });
    };
    $scope.delConfig = function(config) {
      dialogService.confirm({
        msg: $filter('translate')('delegation.loginConfig.msg.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          loginConfigService.removeLoginConfig(config.id).then(function(response) {
            if(response.statusCode && response.statusCode[0] == '1') {
              $scope.refreshList();
              dialogService.notifyWithoutBlocking({
                msg: $filter('translate')('delegation.loginConfig.msg.del.success'),
                ok: $scope.refreshList
              });
            } else {
              dialogService.notify({
                msg: response.message
              });
            }
          })
        }
      });
    }
    // $scope.bulkDelConfig = function() {
    //   var ids = $filter('filter')($scope.configList, {
    //     checked: true
    //   }).map(function(delegation) {
    //     return delegation.id;
    //   })
    //   dialogService.confirm({
    //     msg: $filter('translate')('delegation.list.del.confirm'),
    //     confirmLabel: $filter('translate')('DELETE'),
    //     cancelLabel: $filter('translate')('CANCEL'),
    //     ok: function() {
    //       loginConfigService.bulkDelConfig(ids, function(response) {
    //         $scope.refreshList();
    //       })
    //     }
    //   });
    // }
    $scope.refreshList();
  }
]);