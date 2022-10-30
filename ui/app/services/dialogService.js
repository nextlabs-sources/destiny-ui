/*
  This is a shared service for app level config settings
*/
controlCenterConsoleApp.factory('dialogService', ['$uibModal','toaster', '$q', function($uibModal, toaster, $q) {
  var dialogOpen = null;
  var confirm = function(parameter) {
    var title = parameter.title;
    var msg = parameter.msg;
    var ok = parameter.ok;
    var cancel = parameter.cancel;
    if(dialogOpen) {
      // console.log('Another dialog exists, request ignored.')
      return;
    }
    var confirmLabel = parameter.confirmLabel;
    var cancelLabel = parameter.cancelLabel;
    var buttonList = parameter.buttonList;
    dialogOpen = $uibModal.open({
      animation: true,
      // template: msg,
      templateUrl: buttonList ? 'ui/app/partials/dialog.html' : 'ui/app/partials/dialog-confirm.html',
      controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
        $scope.title = title;
        msg && (msg = msg.replace(/\n/g, '<br>'));
        $scope.msg = msg;
        $scope.confirmLabel = confirmLabel;
        $scope.cancelLabel = cancelLabel;
        $scope.buttonList = buttonList;
        $scope.clickButton = function(button) {
          button.onClick(function() {
            $uibModalInstance.dismiss('cancel');
            dialogOpen = null;
          });
        }
        $scope.ok = function() {
            $uibModalInstance.dismiss('cancel');
            ok && ok();
            dialogOpen = null;
          },
          $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
            cancel && cancel();
            dialogOpen = null;
          };
      }]
    }).closed.then(function() {
      dialogOpen = null;
    });;
  };
  var migrate = function(parameter) {
    var title = parameter.title;
    var ok = parameter.ok;
    var cancel = parameter.cancel;
    if(dialogOpen) {
      return;
    }
    var mechanism = parameter.mechanism;
    var environments = parameter.environments
    var confirmLabel = parameter.confirmLabel;
    var cancelLabel = parameter.cancelLabel; 
    dialogOpen = $uibModal.open({
      animation: true,
      templateUrl: 'ui/app/partials/dialog-migrate.html',
      windowClass: 'cc-modal-window',
      controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
        $scope.title = title;
        $scope.mechanism = mechanism;
        $scope.environments = environments;
        $scope.confirmLabel = confirmLabel;
        $scope.cancelLabel = cancelLabel;
        $scope.chosenEnvironment = {};
        $scope.chosenEnvironment.selectedOccurrence = 0;
        $scope.migrateBtn = true
        $scope.setMechanism = function(mechanism) {
          $scope.mechanism = mechanism;
        }
        $scope.migrateBtnEnabled = function() {
          $scope.migrateBtn = false
        }
        $scope.ok = function () {
          $uibModalInstance.close('migrate');
          ok && ok($scope.mechanism, $scope.chosenEnvironment.selectedOccurrence);
          dialogOpen = null;
        },
          $scope.cancel = function () {
            $uibModalInstance.close('cancel');
            cancel && cancel();
            dialogOpen = null;
          };
      }]
    }).closed.then(function () {
      dialogOpen = null;
    });
  };
  var notifyWithoutBlocking = function(params){
    var timeout = params.timeout || null;
    var type = params.type || "success";
    var strObj = JSON.stringify(params);
    //var html = '<p>'+ tplData.msg +'</p><a href="#/PolicyStudio/Components/Resource" onclick==>'+ tplData.backLabel +'</a>';
     //toaster.pop('success', title, html, 150000, 'trustedHtml');
    toaster.pop(type, null, "{template: 'ui/app/partials/toaster-notify.html', data:" + strObj + "}", timeout, 'templateWithData');
    
  };
  var notifyInfo = function(params){
    var timeout = params.timeout || null;
    var strObj = JSON.stringify(params);
    toaster.pop('info', null, "{template: 'ui/app/partials/toaster-notify.html', data:"+ strObj +"}", timeout, 'templateWithData');
    
  };
  var notify = function(parameter) {
    var title = parameter.title;
    var msg = parameter.msg;
    var detailedMsg = parameter.detailedMsg;
    var ok = parameter.ok;
    var buttonList = parameter.buttonList;
    if(dialogOpen) {
      return;
    }
    var confirmLabel = parameter.confirmLabel;
    dialogOpen = $uibModal.open({
      animation: true,
      // template: msg,
      templateUrl: buttonList ? 'ui/app/partials/dialog.html' : 'ui/app/partials/dialog-notify.html',
      controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
        $scope.title = title;
        $scope.msg = msg;
        $scope.detailedMsg = detailedMsg;
        $scope.buttonList = buttonList;
        $scope.clickButton = function(button) {
          button.onClick(function() {
            $uibModalInstance.dismiss('cancel');
            dialogOpen = null;
          });
        }
        $scope.confirmLabel = confirmLabel;
        $scope.ok = function() {
          $uibModalInstance.dismiss('cancel');
          // ok && ok();
        }
      }]
    }).closed.then(function() {
      ok && ok();
      dialogOpen = null;
    });
  };
  var ldifUpload = function(parameter) {
    var title = parameter.title;
    var msg = parameter.msg;
    var file = parameter.file
    var id = parameter.id
    if(dialogOpen) {
      return;
    }
    var deferred = $q.defer();
    dialogOpen = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'ui/app/partials/dialog-notice.html',
      controller: ['$uibModalInstance', '$scope', 'toolEnrollmentService', '$timeout', function($uibModalInstance, $scope, toolEnrollmentService, $timeout) {
        $scope.title = title;
        $scope.msg = msg;
        $scope.upload = function() {
          toolEnrollmentService.uploadFileExtra(file, id, function (res) {
            if(res.data){
              $timeout(function(){
                deferred.resolve(res);
                $uibModalInstance.dismiss('ok');
              }, 1000);
            }
          });
        }
        $scope.upload()
      }]
    }).closed.then(function() {
      dialogOpen = null;
    });
    return deferred.promise
  };
  var ldifSync = function(parameter) {
    var ok = parameter.ok;
    var cancel = parameter.cancel;
    dialogOpen = $uibModal.open({
      animation: true,
      templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/partials/ldif-sync-dialog.html',
      controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
        $scope.ldifData = {ldifSyncType: "complete"};
        $scope.ok = function() {
          $uibModalInstance.dismiss('cancel');
          ok && ok($scope.ldifData.ldifSyncType);
          dialogOpen = null;
        };
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
          cancel && cancel();
          dialogOpen = null;
        };
      }]
    }).closed.then(function() {
      dialogOpen = null;
    });
  };

  return {
    confirm: confirm,
    migrate:migrate,
    notify: notify,
    notifyWithoutBlocking :notifyWithoutBlocking,
    notifyInfo: notifyInfo,
    ldifUpload: ldifUpload,
    ldifSync: ldifSync
  }
}]);