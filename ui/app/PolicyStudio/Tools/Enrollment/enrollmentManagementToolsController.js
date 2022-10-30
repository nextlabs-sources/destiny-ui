policyStudio.controller('enrollmentManagementToolsController', ['$scope', '$http', '$state', 'toolEnrollmentService', 'loggerService', '$window', '$stateParams', '$uibModal', 'autoCloseOptionService', 'dialogService', '$filter', 'viewCacheService', 'userService', 'configService', '$q', function($scope,
    $http, $state,
    toolEnrollmentService, loggerService, $window, $stateParams, $uibModal, autoCloseOptionService, dialogService, $filter, viewCacheService, userService, configService, $q) {
    $scope.$parent.$parent.isCreatePage = false;
    $scope.toolsTotal = 0;
    var logger = loggerService.getLogger();
    userService.goBackIfAccessDeniedToApp('PolicyStudio.Enrollment');  
    $scope.showUserManual = {};
    $scope.userManualOption = {
        app: 'Console',
        section: 'Tools',
        page: 'Enrollment',
    }
    $scope.pageOptionList = {};
    $scope.crypt = {
      w: null,
      ew: null
    }

    $scope.showCrypt = false;
    $scope.toggleCrypt = function(){
      $scope.showCrypt = !$scope.showCrypt;
    }
    $scope.toggleCrypt()

    $scope.executeCrypt = function(frm){
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
      toolEnrollmentService.executeCrypt($scope.crypt.w, function(response){
        $scope.crypt.ew = response.data;
      });
    }

    $scope.getList = function(tool){
      if(tool.commandName == 'importLocations'){
        $scope.getLocationList(tool);
      } else if(tool.commandName == 'propertymgr'){
        $scope.getPropertyList(tool);
      }else if(tool.commandName == 'mkpassword'){
        $scope.toggleCrypt();
      } else{
        $scope.getEnrollmentList(tool);
      }
    }

    $scope.getEnrollmentList = function(tool){
      $state.go("PolicyStudio.Task");
    }

    $scope.getLocationList = function(tool){
      $state.go("PolicyStudio.Locations", {
        toolId: tool.id,
        toolName: tool.displayName
      });
    }

    $scope.getPropertyList = function(tool){
      $state.go("PolicyStudio.Property", {
        toolId: tool.id,
        toolName: tool.displayName
      });
    }

    $scope.goToEnrolledDataViewer = function(){
      $state.go("PolicyStudio.enrolledDataViewer");
    }

    var showAllManual = function (show) {
      for (var key in $scope.showUserManual) {
        $scope.showUserManual[key] = show;
      }
    }

    $scope.closeManual = function (key) {
      $scope.showUserManual[key] = false;
    }

  $scope.toolList = [
    {
      id: 411,
      displayOrder: 4,
      displayName: "Generate Encrypted Password",
      commandName: "mkpassword",
      description: "Enables you to generate an encrypted password.",
      path: "\\tools\\crypt\\"
    }
  ]

  $scope.refreshToolList = function () {
    $scope.toolsTotal = 0;
    $scope.pageOptionList['CryptPassword'] = $filter('translate')('toolManagement.crypt.w.placeholder.tooltip');
    $scope.pageOptionList['CryptEncryptedPassword'] = $filter('translate')('toolManagement.crypt.ew.placeholder');
    $scope.showUserManual['CryptPassword'] = false;
    $scope.showUserManual['CryptEncryptedPassword'] = false;
    angular.forEach($scope.toolList, function (tool) {
      tool.lastUpdatedDate = toolEnrollmentService.getFormattedDate(tool.lastUpdatedDate);
    });
  }
  $scope.refreshToolList();

  }]);