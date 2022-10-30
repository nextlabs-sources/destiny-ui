policyStudio.controller('enrollmentListController', ['$scope', '$rootScope', '$state', 'toolEnrollmentService', 'loggerService', '$stateParams', 'autoCloseOptionService', '$filter',
  'dialogService', 'userService', 'configService', '$timeout', 
  function($scope, $rootScope, $state,
    toolEnrollmentService, loggerService, $stateParams, autoCloseOptionService, $filter, dialogService, userService, configService, $timeout) {
    
    $scope.instantSearch = configService.configObject.instantSearch;
    $scope.$parent.$parent.isCreatePage = false;
    $scope.toolId = $stateParams.toolId;
    $scope.toolName = $stateParams.toolName;
    var logger = loggerService.getLogger();
    $scope.toolTotal = 0;
    $state.current.pageTitle = $filter('translate')($scope.toolName);

    function getEnrollmentList(){
      toolEnrollmentService.getEnrollments(function(enrollmentList){
        $scope.enrollmentList = enrollmentList.data;
        angular.forEach($scope.enrollmentList, function(enrollment){
          enrollment.lastUpdatedDate = toolEnrollmentService.getFormattedDate(enrollment.lastUpdatedDate);
        });
        checkFailedEnrollment()
      });
    }
    getEnrollmentList()

    userService.goBackIfAccessDeniedToApp('PolicyStudio.Enrollment');

    $rootScope.hideSpinner = false;
    
    $scope.createEnrollment = function(){
      $state.go("PolicyStudio.createEnrollment");
    }

    $scope.editEnrollment = function(enrollment){
      $state.go('PolicyStudio.editEnrollment', {
        taskId: enrollment.id,
        toolName: $scope.toolName
      });
    }

    $scope.deleteEnrollment = function(enrollment, $event) {
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.taskList.confirmDelete'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
            toolEnrollmentService.deleteEnrollment(enrollment.id, function(response) {           
            dialogService.notify({
              msg: $filter('translate')(response.data? response.data.statusMessage : response.message),
            });
            $scope.refreshEnrollmentList();
          });
        }
      })
      $event.stopPropagation();
    };

    $scope.syncEnrollment = function(enrollment, $event){
      $rootScope.hideSpinner = true;
      if (enrollment.type == "LDIF") {
        dialogService.ldifSync({
          ok: function(ldifSyncType) {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('toolManagement.taskList.notifyInProgress')
            });
            var ldifSyncFile = document.getElementById('input-enrollment-ldif-sync-file').files[0];
            var delta = false;
            if (ldifSyncType == "delta") {
                delta = true;
            } else {
                delta = false;
            }
            if (ldifSyncFile) {
              toolEnrollmentService.uploadFileExtra(ldifSyncFile, enrollment.id, delta, function (response) {
                  toolEnrollmentService.syncEnrollment(enrollment.id, function(response) {
                    $rootScope.hideSpinner = false;
                    $scope.refreshEnrollmentList();
                  });
              });
            }
            $scope.refreshEnrollmentList();
          }
        });
      } else {
        dialogService.confirm({
          msg: $filter('translate')('toolManagement.taskList.confirmExecute'),
          confirmLabel: $filter('translate')('SYNC'),
          cancelLabel: $filter('translate')('CANCEL'),
          ok: function() {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('toolManagement.taskList.notifyInProgress')
            });
            toolEnrollmentService.syncEnrollment(enrollment.id, function(response) {
              $rootScope.hideSpinner = false;
              $scope.refreshEnrollmentList();
            });
            $scope.refreshEnrollmentList();
          }
        })
      }
      $event.stopPropagation();
    };

    $scope.refreshEnrollmentList = function () {
      getEnrollmentList()
    }

    let timeoutRefresh = null
    function timeOutRefresh() {
      timeoutRefresh = $timeout(function () {
        $scope.refreshEnrollmentList()
      }, 30000);
    }
    timeOutRefresh()

    $scope.tags = [];

    var enrollmentWithOpenOption = [];
    $scope.closeAllOpenOption = function() {
      if (enrollmentWithOpenOption.length > 0) {
        angular.forEach(enrollmentWithOpenOption, function(enrollment) {
          logger.log(enrollment)
          if (enrollment.optionOpen)
          enrollment.optionOpen = false;
        });
        enrollmentWithOpenOption = [];
      }
    }
    $scope.openOption = function(enrollment, open) {
      if (angular.isDefined(open)) {
        enrollment.optionOpen = open;
        if (open) {
          $scope.closeAllOpenOption();
          autoCloseOptionService.close();
          autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
          enrollmentWithOpenOption.push(enrollment);
        } else {
          enrollmentWithOpenOption = [];
        }
      } else return angular.isDefined(enrollment.optionOpen) ? enrollment.optionOpen : false;
    };    

    $scope.backToToolsList = function() {
      $state.go('PolicyStudio.Enrollment');
    };

    $scope.getEnrollmentType = function (type) {
      if (type === 'AZURE_ACTIVE_DIRECTORY') return 'AZURE'
      else type = type.replace(/_/g, " ")
      return type
    }
    
    $scope.syncDisabled = false
    function checkFailedEnrollment() {
      let failedEnrollment = $scope.enrollmentList.filter(function (enrollment) {
        return enrollment.status === 'FAILED'
      })

      if (failedEnrollment.length > 0) $scope.syncDisabled = true
      else $scope.syncDisabled = false
    }

    $scope.$on('$destroy', function(){
      $timeout.cancel(timeoutRefresh);
    });
  }
]);