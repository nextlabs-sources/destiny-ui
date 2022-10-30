policyStudio.controller('createAttributeProviderController', ['$scope', '$http', 'resourceService', 'loggerService', '$uibModal', '$location', 
  '$anchorScroll', '$stateParams', 'dialogService', '$state',
  '$filter', '$window', 'userManualTranslateService', 'commonFunctionService', '$rootScope', 'userService','$timeout', 'tagService',
  function($scope, $http, resourceService, loggerService, $uibModal, $location, $anchorScroll, $stateParams,
    dialogService, $state, $filter, $window, userManualTranslateService, commonFunctionService, $rootScope, userService,$timeout,tagService) {
    
    'use strict';
    $scope.attributeProviderForm = {
      val: null,
    }
    $scope.attributeProvider = {
    	name : '',
    	description : '',
    	script : 'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}'
    }
    $scope.scriptOptions = {
    	lineNumbers: true,
	    indentWithTabs: true,
	    mode : 'javascript'
	}
	$scope.isEditMode = false;
    $stateParams.attrProviderId && ($scope.isEditMode = true);
    var buttonListForBackToList = [{
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        // console.log('stay');
        callback && callback();
      }
    }, {
      label: $filter('translate')('BACK TO ATTRIBUTE PROVIDER LIST'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.attributeProviderForm.val.$setPristine();
        $state.go('PolicyStudio.AttributeProvider');
        callback && callback();
      }
    }];
    var buttonListForDiscarding = [{
      label: $filter('translate')('CANCEL'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        callback && callback();
      }
    }, {
      label: $filter('translate')('RESET'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.attributeProviderForm.val.$setPristine();
        $state.reload();
        callback && callback();
      }
    }];
    $scope.backToList = function(frm){
		if ($scope.isEditMode  || frm.$pristine) {
	        $scope.attributeProviderForm.val.$setPristine();
	        $state.go('PolicyStudio.AttributeProvider');
	    } else {
	        dialogService.confirm({
	          msg: $filter('translate')('attributeProvider.button.back.confirm'),
	          buttonList: buttonListForBackToList
	        });
	    }

    }
    $scope.reset = function(frm) {
      if (!frm.$pristine) {
        dialogService.confirm({
          msg: $filter('translate')('createResource.reset.confirm'),
          buttonList: buttonListForDiscarding
        });
      }

    };
    $scope.save = function(frm){
    
      if (frm.$invalid) {
        frm.$setDirty();
        for (var field in frm) {
          if (field[0] == '$')
            continue;
          //logger.log(field);
          frm[field].$touched = true;
        }
        $scope.$broadcast('scrollto');
        return;
      }
      return;
      prepareRequestPayload();
      if ($scope.isEditMode) {
        resourceService.modifyResourceType(resourcePayLoad, function(response) {
          frm.$setPristine();
          // loggerService.getLogger().log('response');
          // loggerService.getLogger().log(response);

          $scope.resourceTypeForm.val.$setPristine();
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createResource.saved.notify.' + $scope.resource.type),
            backLink:'PolicyStudio.PolicyModel',
            backLabel:$filter('translate')('BACK TO COMPONENT TYPE LIST')
          });
          $state.reload();
        })
      } else {
        resourceService.saveResourceType(resourcePayLoad, function(response) {
          // loggerService.getLogger().log('response');
          // loggerService.getLogger().log(response);
          frm.$setPristine();
          $scope.resource.id = response.data;
          $scope.editResource($scope.resource);
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createResource.added.notify'),
            backLink:'PolicyStudio.PolicyModel',
            backLabel:$filter('translate')('BACK TO COMPONENT TYPE LIST')
          });
          //$state.reload();
        })
      }

    }    
  }
]);    