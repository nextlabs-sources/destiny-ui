policyStudio.controller('createResourceController', ['$scope', '$http', 'resourceService', 'loggerService', '$uibModal', '$location', 
  '$anchorScroll', '$stateParams', 'dialogService', '$state',
  '$filter', '$window', 'userManualTranslateService', 'commonFunctionService', '$rootScope', 'userService','$timeout', 'tagService',
  function($scope, $http, resourceService, loggerService, $uibModal, $location, $anchorScroll, $stateParams,
    dialogService, $state, $filter, $window, userManualTranslateService, commonFunctionService, $rootScope, userService,$timeout,tagService) {
    //  $scope.ctrl=ctrl;
    'use strict';
    var snRegExPattern =/^[a-zA-Z]+[ -9:;-~]*$/;
    var paramSnRegExPattern =/^[a-zA-Z]+[ -9:;-~]*$/;
    var logger = loggerService.getLogger();
    $scope.$parent.transition = "fade-in";
    $scope.$parent.$parent.isCreatePage = true;
    $scope.isEditMode = false;
    $stateParams.resourceId && ($scope.isEditMode = true)
    userService.getPermissions('POLICY_MODEL', function(permissions) {
      $scope.permissions = permissions;
    });
    !$scope.isEditMode && userService.goBackIfAccessDenied('CREATE_POLICY_MODEL');
    $scope.userAccessMap = null;
    userService.getUserAccessMap(function(userAccessMap) {
      $scope.userAccessMap = userAccessMap;
    })
    $scope.model_error = false;
    $scope.tabSelected = {
      val: 0
    };
    $scope.resourceTypeForm = {
      val: null,
    }
    $scope.DataTypes = [];
    $scope.dataTypeOperators = [];
    $scope.ParameterTypes = [{
      $$hashKey: 'PARAMETER_TYPE:0',
      val: "TEXT_SINGLE_ROW",
      label: "Single Row"
    }, {
      $$hashKey: 'PARAMETER_TYPE:1',
      val: "TEXT_MULTIPLE_ROW",
      label: "Multiple Row"
    }, {
      $$hashKey: 'PARAMETER_TYPE:2',
      val: "LIST",
      label: "List"
    }];
    $scope.enrollmentSubjectAttributes = [];
    $scope.resource = {
      id: null,
      name: null,
      shortName: null,
      description: null,
      type: "RESOURCE",
      status: "ACTIVE",
      tags: [],
      attributes: [],
      actions: [],
      obligations: [],
      version : null
    };

    $scope.hideObliParams = {};

    $scope.timer = {
      errorAndWarning : 15000,
      notificationMessage : 5000
    }
    $scope.invalidSname = false;
    $scope.resetInvalidSname = function(){
      $scope.invalidSname = false;
    }
    $scope.IsSnameValid = function(shrt){
      //$scope.resetInvalidSname();
      var result = false;
      if(shrt){
        result = commonFunctionService.isPQLReservedKeyword(shrt.toLowerCase());
         if(result){
          $scope.invalidSname = true;
        }
      }
      return result;
    }
    $scope.setDirty = function(frm) {
      frm && frm.$setDirty && frm.$setDirty();
    }
    $scope.getOpConfigLabel = function(operators) {
        var label = '';
        angular.forEach(operators, function(operator, index) {
          if (index > 0) label += ', ';
          label += operator.label;
        });
        return label;
      }
      // to be sent with create/edit request
    var resourcePayLoad = {

      "id": null,
      "name": "",
      "shortName": "",
      "description": "",
      "type": "RESOURCE",
      "status": "ACTIVE",
      "tags": [],
      "attributes": [],
      "actions": [],
      "obligations": [],
      "version" : null

    }
    var getObligationPayload = function() {
      return {
        "id": null,
        "name": "",
        "shortName": "",
        "runAt": "PEP",
        "parameters": []
      }
    }
    var getObligationParametersPayload = function() {
      return {
        "id": null,
        "name": "",
        "type": "",
        "defaultValue": "",
        "value": "",
        "listValues": null,
        "hidden": false,
        "editable": true,
        "mandatory": false
      }
    }
    var getActionPayload = function() {
      return {
        "id": null,
        "name": "",
        "shortName": ""
      }
    }
    var getTagPayLoad = function() {
      return {
        "id": null,
        "key": "",
        "label": "",
        "type": "POLICY_MODEL_TAG",
        "status": "ACTIVE"
      }
    }
    var getAttributePayload = function() {
      return {
        "id": null,
        "name": "",
        "shortName": "",
        "dataType": "",
        "operatorConfigs": [],
        "regExPattern": ""
      }
    }

    var getOperatorConfigPayload = function() {
      return {
        "id": null,
        "key": "",
        "label": "",
        "dataType": ""
      }
    }
    var prepareRequestPayload = function() {
      //obligations
      resourcePayLoad.obligations = [];
      for (var i = 0; i < $scope.resource.obligations.length; i++) {
        var o = getObligationPayload();
        // o.id = $scope.resource.obligations[i].id;
        o.sortOrder = i;
        o.name = $scope.resource.obligations[i].name;
        o.shortName = $scope.resource.obligations[i].shortName;
        for (var j = 0; j < $scope.resource.obligations[i].parameters.length; j++) {
          var p = getObligationParametersPayload();
          p.sortOrder = j;
          // p.id = $scope.resource.obligations[i].parameters[j].id;
          p.name = $scope.resource.obligations[i].parameters[j].name;
          p.shortName = $scope.resource.obligations[i].parameters[j].shortName;
          p.type = $scope.resource.obligations[i].parameters[j].type.val;
          p.defaultValue = $scope.resource.obligations[i].parameters[j].defaultValue;
          if(p.type == 'LIST') p.listValues = $scope.resource.obligations[i].parameters[j].listValues;
          p.hidden = $scope.resource.obligations[i].parameters[j].hidden;
          p.editable = $scope.resource.obligations[i].parameters[j].editable;
          p.mandatory = $scope.resource.obligations[i].parameters[j].mandatory;
          o.parameters.push(p);
        }
        resourcePayLoad.obligations.push(o);
      }
      //version
      resourcePayLoad.version = $scope.resource.version;

      //actions
      resourcePayLoad.actions = [];
      for (var i = 0; i < $scope.resource.actions.length; i++) {
        var a = getActionPayload();
        a.sortOrder = i;
        a.name = $scope.resource.actions[i].name;
        a.shortName = $scope.resource.actions[i].shortName;
        resourcePayLoad.actions.push(a);
      }

      //attributes
      resourcePayLoad.attributes = [];
      for (var i = 0; i < $scope.resource.attributes.length; i++) {
        var a = getAttributePayload();
        // a.id = $scope.resource.attributes[i].id;
        a.sortOrder = i;
        a.name = $scope.resource.attributes[i].name;
        a.shortName = $scope.resource.attributes[i].shortName;
        a.dataType = $scope.resource.attributes[i].dataType;
        a.regExPattern = $scope.resource.attributes[i].regExPattern;
        for (j = 0; j < $scope.resource.attributes[i].operatorConfigs.length; j++) {
          var o = getOperatorConfigPayload();
          o.id = $scope.resource.attributes[i].operatorConfigs[j].id;
          o.key = $scope.resource.attributes[i].operatorConfigs[j].key;
          o.label = $scope.resource.attributes[i].operatorConfigs[j].label;
          o.dataType = $scope.resource.attributes[i].operatorConfigs[j].dataType;
          a.operatorConfigs.push(o);
        }

        //for now, remove this after multi select operators is added

        // var o = getOperatorConfigPayload();
        // o.id = $scope.resource.attributes[i].operatorConfigs.id;
        // o.key = $scope.resource.attributes[i].operatorConfigs.key;
        // o.label = $scope.resource.attributes[i].operatorConfigs.label;
        // o.dataType = $scope.resource.attributes[i].operatorConfigs.dataType;
        // a.operatorConfigs.push(o);


        resourcePayLoad.attributes.push(a);
      }

      //tags
      resourcePayLoad.tags = [];
      for (var i = 0; i < $scope.resource.tags.length; i++) {
        var t = getTagPayLoad();
        t.id = $scope.resource.tags[i].id;
        t.key = $scope.resource.tags[i].key;
        t.label = $scope.resource.tags[i].label;
        resourcePayLoad.tags.push(t);
      }
      resourcePayLoad.id = $scope.resource.id;
      resourcePayLoad.name = $scope.resource.name;
      resourcePayLoad.shortName = $scope.resource.shortName;
      resourcePayLoad.description = $scope.resource.description;

      loggerService.getLogger().log('Resource Payload:');
      loggerService.getLogger().log(resourcePayLoad);
    }
    var currentTarget = "resourceInfo";
    $scope.scrollTo = function(target) {
      $anchorScroll(target);
      currentTarget = target;
    }
    $scope.isActive = function(newTarget) {
      return currentTarget == newTarget;
    }
    $scope.highlightGrammar = function(target) {
      currentTarget = target;
    }

    $scope.dropdownClicked = function($event) {

      if ($($event.target).attr('data-propagation') != 'true') $event.stopPropagation();

    }
    $scope.resource.attributes.$operatorLabel = '';
    $scope.updateOperator = function(attribute) {
      attribute.operatorConfigs = [];
      angular.forEach(attribute.$dataTypeOperators, function(operator) {
        if (operator.$_checked) attribute.operatorConfigs.push(operator);
      });

      setAttributeLabel(attribute);

      //loggerService.getLogger().log('update operators:', attribute.operatorConfigs);
    };
    var setAttributeLabel = function(attribute) {
      attribute.$operatorLabel = '';
      angular.forEach(attribute.operatorConfigs, function(operator, index) {
        if (index > 0) attribute.$operatorLabel += ', ';
        attribute.$operatorLabel += operator.label;
      });
    }
    var getEmptyAttribute = function() {
        return {
          id: null,
          name: '',
          shortName: '',
          dataType: '',
          operatorConfigs: [],
          $operatorLabel: '',
          $dataTypeOperators: [],
          regExPattern: '',
          editableShortName:true
        }

    }
      //$scope.resource.attributes.push(getEmptyAttribute());

    $scope.addAttribute = function() {
      var a = getEmptyAttribute();
      let index = $scope.DataTypes.indexOf("STRING");
      a.dataType = index >= 0 ? $scope.DataTypes[index] : $scope.DataTypes[0];
      $scope.resource.attributes.push(a);
      $scope.setOperatorsForDataType(a.dataType, $scope.resource.attributes.length - 1);
      $scope.editItem = a;
      itemBeforeEdit = {src:'ATTRIBUTE'};
      $scope.editItem.isEdit = false;
      $scope.attributeTable.notify = false;

    }
    $scope.removeAttribute = function(index,fromViewTable) {
      loggerService.getLogger().log('Remove attribute index:', index);
     

      if(fromViewTable){
        var a = $scope.resource.attributes[index];
        if(!$scope.checkReferenceBeforeRemoving(a,1)){
          $scope.resource.attributes.splice(index,1);
          $scope.attributeTable.notify = false;
        }
        
        
        return;
      }
      var errorList = []; 
      if(!$scope.editItem.isEdit ){
        $scope.resource.attributes.splice(index,1);
       
      }else{
        errorList = validateAttributeTable();
      }

      if(!errorList.length){
        $scope.attributeTable.dirty = false;
        $scope.attributeTable.notify = false;
        $scope.editItem = {};
        $scope.tabs.hasError = false;
      }else{
        $scope.attributeTable.error = true;
        $scope.attributeTable.success = false;
        $scope.attributeTable.notify = true;
        $scope.attributeTable.message = errorList.join(', ');
        $scope.tabs.hasError = true;
      }
    }

    var isInValidPolicyModel = function(){
      

      // check for attribute short-name uniqueness
      var errList = validateAttributeTable();
      if(errList.length){
        $scope.attributeTable.error = true;
        $scope.attributeTable.success = false;
        $scope.attributeTable.message = errList.join(', ');
        $scope.attributeTable.notify = true;
        return {tab:1,errList:errList};
      }  
      // for(var i=0;i < $scope.resource.attributes.length; i++){
      //   var attr = $scope.resource.attributes[i];
      //   for(var j=i+1; j<$scope.resource.attributes.length;j++){
      //     var attr1 = $scope.resource.attributes[j];
      //     if(attr1.shortName === attr.shortName){
            
      //       dialogService.notify({
      //         msg: $filter('translate')('Duplicate attribute short name found',{sname: attr.shortName}),
      //         ok: function() {
      //           //$state.go('PolicyStudio.PolicyModel');
      //         }
      //       });
      //       return true;
      //     }
      //   }
        
          
      // }

      // action should have unique short names
      var error = validateActionTable({returnInvalidAction:true});
      if(error.errMsgs && error.errMsgs.length){
        $scope.actionTable.error = true;
        $scope.actionTable.success = false;
        $scope.actionTable.message = error.errMsgs.join(', ');
        $timeout(function() {
        $scope.actionTable.notify = true;
            $scope.setEdit(error.action,2);
          }, 300)
        return {tab:2,errList:error.errMsgs};
      }
      // for(var i=0; i < $scope.resource.actions.length;i++){
      //   var action = $scope.resource.actions[i];
      //   for(var j=i+1; j<$scope.resource.actions.length;j++){
      //     var action1 = $scope.resource.actions[j];
      //     if(action1.shortName === action.shortName){
              
      //         dialogService.notify({
      //           msg: $filter('translate')('Duplicate action short name found',{sname: action.shortName}),
      //           ok: function() {
      //             //$state.go('PolicyStudio.PolicyModel');
      //           }
      //         });
      //         return true;
      //     }
      //   }   
      // }

       // obligation should have unique short names
      errList = validateObligationTable();
      if(errList.length){
        $scope.obligationTable.error = true;
        $scope.obligationTable.success = false;
        $scope.obligationTable.message = errList.join(', ');
        $scope.obligationTable.notify = true;
        return {tab:3,errList:errList};
      }
      // for(var i = 0; i < $scope.resource.obligations.length;i++){
      //   var obligation = $scope.resource.obligations[i];
      //   for(var j=i+1; j<$scope.resource.obligations.length;j++){
      //     var obligation1 = $scope.resource.obligations[j];
      //     if(obligation1.shortName === obligation.shortName){
              
      //         dialogService.notify({
      //           msg: $filter('translate')('Duplicate obligation short name found',{sname: obligation.shortName}),
      //           ok: function() {
      //             //$state.go('PolicyStudio.PolicyModel');
      //           }
      //         });
      //         return true;
      //     }    
      //   }
      // }   

      // // obligation parameters should have unique short names
      
      // for(var index in $scope.resource.obligations){
      //   var obligation = $scope.resource.obligations[index];
        
      //   for(var i=0; i < obligation.parameters.length; i++){
      //     var param = obligation.parameters[i];
      //     for(var j=i+1; j<obligation.parameters.length;j++){
      //        var param1 = obligation.parameters[j];
      //        if(param1.shortName === param.shortName){
            
      //         dialogService.notify({
      //           msg: $filter('translate')('Duplicate parameter short name found in the obligation',{sname:param.shortName,obligation:obligation.name}),
      //           ok: function() {
      //             //$state.go('PolicyStudio.PolicyModel');
      //           }
      //         });
      //         return true;
      //       }
      //     }
      //   }  
      // }  
      return false;
    }
    $scope.editResource = function(resource) {
      // loggerService.getLogger().log('edit resource:', resource, 1);
      //    resourceService.setResourceID(resource.id);
      $state.go('PolicyStudio.editPolicyModel', {
        resourceId: resource.id
      });
    };
    var buttonListForBackToList = [{
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        // console.log('stay');
        callback && callback();
      }
    }, {
      label: $filter('translate')('BACK TO COMPONENT TYPE LIST'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.resourceTypeForm.val.$setPristine();
        localStorage.removeItem("activeResourceTab");
        $state.go('PolicyStudio.PolicyModel');
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
        $scope.resourceTypeForm.val.$setPristine();
        localStorage.removeItem("activeResourceTab");
        $state.reload();
        callback && callback();
      }
    }];
    $rootScope.immediateStateChange = function() {
      return $scope.resourceTypeForm.val.$pristine;
    }
    $rootScope.stateChangeHook = function(state) {
      dialogService.confirm({
        msg: $filter('translate')('common.discard.confirm'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function() {
          $scope.resourceTypeForm.val.$setPristine();
          localStorage.removeItem("activeResourceTab");
          $state.go(state.name, state.params)
        },
        cancel: function() {
        }
      })
    }
    $scope.saveResource = function(frm) {
      $scope.model_error = false;
      if (frm.$invalid || $scope.invalidSname) {
        frm.$setDirty();
        for (var field in frm) {
          if (field[0] == '$')
            continue;
          logger.log(field);
          frm[field].$touched = true;
        }
        $scope.$broadcast('scrollto');
        return;
      }
      var policyModelErrList = isInValidPolicyModel();
      if(policyModelErrList){
        $scope.model_error = true;
        // dialogService.notify({
          // msg: policyModelErrList.errList[0],
          // ok: function() {
            $scope.tabSelected.val = ($scope.enrollmentSubjectAttributes.length ? 4 : 3) - policyModelErrList.tab;
            $timeout(function(){
              $scope.tabSelected.val = policyModelErrList.tab;
            }, 30);
            $scope.$broadcast('scrollto');
            $scope.tabs.hasError = true;
            // setNotification($scope.actionTable)
          // }
        // });
        return;
      }

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


    };
    var getEmptyAction = function() {
        return {
          id: null,
          name: '',
          shortName: '',
          editableShortName:true
        }
      }
      //$scope.resource.actions.push(getEmptyAction()); 
    $scope.addAction = function() {
      var a = getEmptyAction();
      $scope.resource.actions.push(a);
      $scope.editItem = a;
      itemBeforeEdit = {src:'ACTION'};
      $scope.editItem.isEdit = false;
      $scope.actionTable.notify = false;
    }
    $scope.removeAction = function(index,fromViewTable) {


      if(fromViewTable){
        var a = $scope.resource.actions[index];
        if(!$scope.checkReferenceBeforeRemoving(a,2)){
          $scope.resource.actions.splice(index,1);
          $scope.actionTable.notify = false;
        }
        return;
      }
      var errorList = []; 
      if(!$scope.editItem.isEdit ){
        $scope.resource.actions.splice(index,1);
       
      }else{
        errorList = validateActionTable();
      }

      if(!errorList.length){
        $scope.actionTable.dirty = false;
        $scope.actionTable.notify = false;
        $scope.editItem = {};
        $scope.tabs.hasError = false;
      }else{
        $scope.actionTable.error = true;
        $scope.actionTable.success = false;
        $scope.actionTable.notify = true;
        $scope.actionTable.message = errorList.join(', ');
        $scope.tabs.hasError = true;
      }
    }
    var getEmptyParameter = function() {
      return {
        id: null,
        name: null,
        shortName: null,
        type: $scope.ParameterTypes[0],
        defaultValue: null,
        hidden: false,
        editable: true,
        mandatory: false,
        listValues: null,
        editableShortName:true
      }
    }

    var getEmptyObligation = function() {
        return {
          id: null,
          name: '',
          shortName: '',
          parameters: [],
          editableShortName:true
        }
      }
      // $scope.resource.obligations.push(getEmptyObligation());
    $scope.addObligation = function() {
      var o = getEmptyObligation();
      //o.parameters.push(getEmptyParameter());
      $scope.resource.obligations.push(o);
      $scope.editItem = o;
      itemBeforeEdit = {src:'OBLIGATION'};
      $scope.editItem.isEdit = false;
      $scope.obligationTable.notify = false;
    }
    $scope.removeObligation = function(index,fromViewTable) {
      loggerService.getLogger().log('Remove Obligation:', index);

      if(fromViewTable){
        var o = $scope.resource.obligations[index];
        if(!$scope.checkReferenceBeforeRemoving(o,3)){
          $scope.resource.obligations.splice(index,1);
          $scope.obligationTable.notify = false;
        }
        //$scope.tabs.hasError = false;
        return;
      }
      var errorList = []; 
      if(!$scope.editItem.isEdit ){
        $scope.resource.obligations.splice(index,1);
       
      }else{
        errorList = validateObligationTable();
      }

      if(!errorList.length){
        $scope.obligationTable.dirty = false;
        $scope.obligationTable.notify = false;
        $scope.editItem = {};
        $scope.tabs.hasError = false;
      }else{
        $scope.obligationTable.error = true;
        $scope.obligationTable.success = false;
        $scope.obligationTable.notify = true;
        $scope.obligationTable.message = errorList.join(', ');
        $scope.tabs.hasError = true;
      }
    }
    $scope.addParameter = function(obli, index) {
      if(checkReference(obli,3)) {
        loggerService.getLogger().log('obligation is referenced');
        return;
      }
      var p = getEmptyParameter();
      $scope.resource.obligations[index].parameters.push(p);
      p.$$hashKey = 1000000 * (index + 1) + 1000 * ($scope.resource.obligations[index].parameters.length - 1) + 1;
      $scope.editItem = p;
      itemBeforeEdit = {src:'OBLIGATION_PARAMETER'};
      itemBeforeEdit.obligation = $scope.resource.obligations[index];
      $scope.editItem.isEdit = false;
      $scope.obligationTable.notify = false;
    }
    $scope.removeParameter = function(obli, index,fromViewTable) {
      loggerService.getLogger().log('Remove parameter:', index);

      if(fromViewTable){
        var p = obli.parameters[index];
        if(!checkReference(p,3)){
          obli.parameters.splice(index,1);
          $scope.obligationTable.notify = false;
        }
        //$scope.tabs.hasError = false;
        return;
      }
      var errorList = []; 
      if(!$scope.editItem.isEdit ){
        obli.parameters.splice(index,1);
       
      }else{
        errorList = validateObligationTable();
      }

      if(!errorList.length){
        $scope.obligationTable.dirty = false;
        $scope.obligationTable.notify = false;
        $scope.editItem = {};
        $scope.tabs.hasError = false;
      }else{
        $scope.obligationTable.error = true;
        $scope.obligationTable.success = false;
        $scope.obligationTable.notify = true;
        $scope.obligationTable.message = errorList.join(', ');
        $scope.tabs.hasError = true;
      }
    }
    $scope.editParameters = false;
    $scope.discardResource = function(frm) {
      if (frm.$pristine) {
        // $state.go('PolicyStudio.PolicyModel');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createResource.reset.confirm'),
          buttonList: buttonListForDiscarding
        });
      }

    };
    $scope.backToResourceList = function(frm) {
      if (($scope.isEditMode && !$scope.resource.authoritiesParsed.EDIT_POLICY_MODEL) || frm.$pristine) {
        $scope.resourceTypeForm.val.$setPristine();
        localStorage.removeItem("activeResourceTab");
        $state.go('PolicyStudio.PolicyModel');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createResource.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }

    };
    $scope.addTag = function(tag, callback) {
      loggerService.getLogger().log('add tag:' + tag);
      resourceService.addTag(tag, function(data) {
        var tagId = data.data;
        resourceService.getTagById(tagId, function(data) {
          $scope.resource.tags.push(data.data);
          callback && callback();
        });
      })
    }
    $scope.getDataTypes = function() {
      loggerService.getLogger().log('get DataTypes:');

      resourceService.getDataTypes(function(data) {
        $scope.DataTypes = data.data.sort()
        if ($scope.resource.attributes.length && !$scope.isEditMode) {
          $scope.resource.attributes[0].dataType = $scope.DataTypes[0];
          $scope.setOperatorsForDataType($scope.resource.attributes[0].dataType, 0);
        }
      })
    }
    $scope.setOperatorsForDataType = function(dataType, index, forExistingAttr) {
      let operators = $scope.dataTypeOperators[dataType];
      $scope.resource.attributes[index].$dataTypeOperators = angular.copy(operators);
      if ($scope.isEditMode && forExistingAttr) {
        var oConfig = $scope.resource.attributes[index].operatorConfigs;
        var dto = $scope.resource.attributes[index].$dataTypeOperators;
        for (var i = 0; i < dto.length; i++) {
          for (var j = 0; j < oConfig.length; j++) {
            if (oConfig[j].key === dto[i].key)
              dto[i].$_checked = true;
          }

        }

        //$scope.updateOperator($scope.resource.attributes[index]);
        setAttributeLabel($scope.resource.attributes[index]);
      } else {
        $scope.resource.attributes[index].$dataTypeOperators[0].$_checked = true;
        $scope.updateOperator($scope.resource.attributes[index]);
        $scope.resource.attributes[index].operatorConfigs = [operators[0]];
      }
    }
    $scope.changeDataType = function(dt, index) {
      $scope.resource.attributes.$operatorLabel = '';
      $scope.setOperatorsForDataType(dt, index);

    }
    var setResource = function(resource) {
      if (!resource.data) {
        dialogService.notify({
          msg: $filter('translate')('createresource.resource.unavailable'),
          ok: function() {
            $window.history.back();
            return;
          }
        })
      }
      loggerService.getLogger().log(resource);
      // set/ populate policy object to correctly reflect in the UI
      // ensure the key names match exactly
      $scope.resource = resource.data;
      $scope.resource.attributes = $filter('orderBy')($scope.resource.attributes, 'sortOrder');
      $scope.resource.obligations = $filter('orderBy')($scope.resource.obligations, 'sortOrder');
      $scope.resource.actions = $filter('orderBy')($scope.resource.actions, 'sortOrder');
      $scope.resource.actions && angular.forEach($scope.resource.actions, function(action) {
        action.editableShortName = !action.shortName;
      })
      $scope.resource.authoritiesParsed = resourceService.parseAuthorities($scope.resource, $scope.permissions);
      !$scope.resource.authoritiesParsed['VIEW_POLICY_MODEL'] && userService.showWarningAndGoBack();
      $scope.shortNameRef = $scope.resource.shortName;
      resourceService.getDataTypesList(function(data) {
        $scope.dataTypeOperators = [];
        data.data.forEach(function(operator) {
          if(!(operator.dataType in $scope.dataTypeOperators)) {
            $scope.dataTypeOperators[operator.dataType] = [];
          }
          $scope.dataTypeOperators[operator.dataType].push(operator);
        });
        for (var i = 0; i < $scope.resource.attributes.length; i++) {
          $scope.setOperatorsForDataType($scope.resource.attributes[i].dataType, i, true);
        }
        $scope.getDataTypes();
      });
      angular.forEach($scope.resource.obligations, function(obligation, obliIndex) {
        obligation.parameters = $filter('orderBy')(obligation.parameters, 'sortOrder');
        obligation.parameters && angular.forEach(obligation.parameters, function(param, paramIndex) {
          var typeVal = param.type;
          angular.forEach($scope.ParameterTypes, function(paramType) {
            if(typeVal == paramType.val) param.type = paramType;
          })
          // required to set parameter to view mode, otherwise always goes to edit mode
          param.$$hashKey = 1000000 * (obliIndex + 1) + 1000 * paramIndex + 1;
        })
      })
      if ($scope.resource.type === 'SUBJECT') {
        resourceService.getEnrollmentSubjectAttributes($scope.resource.shortName, function (data) {
          $scope.enrollmentSubjectAttributes = (data.data) ? data.data : [];
        });
      }
      $state.current.pageTitle = $scope.resource.name; 
      watchPolicyExt();
    }

    $scope.initObligationParamType = function(obliParam) {
      if (obliParam.type) return;
      obliParam.type = ParameterTypes[0];
    }
    if ($stateParams.resourceId) {
      resourceService.getResourceById($stateParams.resourceId, setResource);
    }else{
       $state.current.pageTitle = $filter('translate')("createResource.title.CreatePolicyModel");
    }
    $scope.shouldShowAction = function() {
      return $scope.resource.type != 'SUBJECT';
    }
    $scope.shouldShowObligation = function() {
      return $scope.resource.type != 'SUBJECT';
    }
    if (!$scope.DataTypes || $scope.DataTypes.length === 0) {
      resourceService.getDataTypesList(function (data) {
        $scope.dataTypeOperators = [];
        data.data.forEach(function (operator) {
          if (!(operator.dataType in $scope.dataTypeOperators)) {
            $scope.dataTypeOperators[operator.dataType] = [];
          }
          $scope.dataTypeOperators[operator.dataType].push(operator);
        });
        $scope.getDataTypes();
      });
    }
    $scope.userManualOption = {
      app: 'Console',
      section: 'Policy Studio',
      page: 'Create Policy Model',
    }
    $scope.pageOptionList = null;
    $scope.showUserManual = {};
    userManualTranslateService.pageOptionList($scope.userManualOption, function(pageOptionList) {
      $scope.pageOptionList = pageOptionList;
      $rootScope.hasUserManual = pageOptionList;
      for (var key in pageOptionList) {
        $scope.showUserManual[key] = false;
      }
      for (var key in $scope.showUserManual) {
        if (!pageOptionList[key])
          delete $scope.showUserManual[key];
      }
    });
    var showAllManual = function(show) {
      for (var key in $scope.showUserManual) {
        $scope.showUserManual[key] = show;
      }
    }
    $scope.$watch(function() {
      return $rootScope.showAboutPage;
    }, function(newValue, oldValue) {
      // console.log('showAboutPage', newValue, oldValue);
      if(newValue == oldValue) return;
      showAllManual(newValue);
    });
    $scope.$watch(function() {
      return $scope.showUserManual;
    }, function(newValue, oldValue) {
      // console.log('showUserManual', newValue, oldValue);
      if(newValue == oldValue) return;
      var showAboutPage = false;
      for (var key in $scope.showUserManual) {
        showAboutPage = showAboutPage || $scope.showUserManual[key];
      }
      $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
    }, true);
    var watchPolicyExt = function(){
      $scope.$watch(function() {
        return $scope.resource;
      }, function(newValue, oldValue) {
        if(newValue == oldValue) return;
        $scope.setDirty($scope.resourceTypeForm.val);
      }, true);
    }
    !$scope.isEditMode && watchPolicyExt();
    $scope.editItem = {};
    $scope.getActiveTab = function(){
      var activeTab = localStorage.getItem("activeResourceTab");
      return activeTab? parseInt(activeTab) : 1;
  };
    $scope.tabs = {
      activeTab: $scope.getActiveTab(),
      hasError: false,
      preTab:-1
    }
    var checkReference = function(item,tabIndex) {
      if(item.isReferenced){
        showReferecendMessage(tabIndex,item.name,false);
        return true;
      }
    }
    $scope.checkReferenceBeforeRemoving = function(item,tabIndex) {
      if(item.isReferenced){
        showReferecendMessage(tabIndex,item.name,true);
        return true;
      }
    }
    var itemBeforeEdit = null;
    $scope.setObliParamEdit = function(item,tabIndex, obligationIndex, paramIndex) {
      checkReference($scope.resource.obligations[obligationIndex],3);
      if($scope.setEdit(item,tabIndex)) {
        // $scope.editItem.$$hashKeyObliParam = 'obli_' + obligationIndex + '_para_' + paramIndex;
          itemBeforeEdit.src = 'OBLIGATION_PARAMETER';
          itemBeforeEdit.obligation = $scope.resource.obligations[obligationIndex];
      }
    }
    $scope.setEdit = function(item,tabIndex) {
      switch(tabIndex){
        case 1:
          // $scope.attributeTable.dirty = true;
          $scope.attributeTable.notify = false;
          // itemBeforeEdit.src = 'ATTRIBUTE'
          break;
        case 2:
          // $scope.actionTable.dirty = true;
          $scope.actionTable.notify = false;
          // itemBeforeEdit.src = 'ACTION'
          break;
        case 3:
          // $scope.obligationTable.dirty = true;
          $scope.obligationTable.notify = false;
          // itemBeforeEdit.src = 'OBLIGATION'
          break; 
      }
      if(checkReference(item,tabIndex)){
        // return;
      }
      if($scope.editItem.$$hashKey ){
         $scope.saveEdit(tabIndex, $scope.editItem);
         $scope.tabs.preTab = (tabIndex === 1) ? 0 : tabIndex;
         if($scope.tabs.hasError) return;
      }
      // angular.copy(item, $scope.editItem);
      itemBeforeEdit = JSON.parse(JSON.stringify(item));
      $scope.editItem = item;
      $scope.editItem.isEdit = true;
      switch(tabIndex){
        case 1:
          $scope.attributeTable.dirty = true;
          // $scope.attributeTable.notify = false;
          itemBeforeEdit.src = 'ATTRIBUTE'
          break;
        case 2:
          $scope.actionTable.dirty = true;
          // $scope.actionTable.notify = false;
          itemBeforeEdit.src = 'ACTION'
          break;
        case 3:
          $scope.obligationTable.dirty = true;
          // $scope.obligationTable.notify = false;
          itemBeforeEdit.src = 'OBLIGATION'
          break; 
      }
      return true;
    }
    var notificationPromise = null;
    var setNotification = function(table){
      table.notify = true;
      notificationPromise && $timeout.cancel(notificationPromise);
      notificationPromise = $timeout(function(){
           table.notify = false;
      },$scope.timer.notificationMessage);
    }
    var setNotificationError = function(table){
      table.notify = true;
      notificationPromise && $timeout.cancel(notificationPromise);
      notificationPromise = $timeout(function(){
           table.notify = false;
      },$scope.timer.errorAndWarning);
    }
    var referenceNotifyTimer = null;
    var showReferecendMessage = function(tabIndex,name,forRemoving){
      var obligation = tabIndex == 3;
      var msg = null;
      if(forRemoving) {
        msg = name +" is referenced in one or more " + (obligation ? 'policies' : 'components') + ". In order to delete it, \
        remove the reference from respective "+ (obligation ? 'policies' : 'components');
      } else {
        msg = name +" is referenced in one or more " + (obligation ? 'policies' : 'components') + ", so only name is editable.\
         In order to edit it, remove the reference from respective "+ (obligation ? 'policies' : 'components');
      }
      var table;
      switch(tabIndex){
        case 1:
          table = $scope.attributeTable;
          break;
        case 2:
         
          table = $scope.actionTable;
          break;
        case 3:
          
          table = $scope.obligationTable;
          break; 
      }
      table.notify = true;
      table.success = true;
      table.message = msg;
      referenceNotifyTimer && $timeout.cancel(referenceNotifyTimer);
      referenceNotifyTimer = $timeout(function(){
           table.notify = false;
      },$scope.timer.errorAndWarning);

    }
    var deepCopyWith$ = function(src, target) {
      angular.copy(src, target);
      for (var field in src) {
        // if(angular.isObject(itemBeforeEdit[field])) {
        // } else if(angular.isObject(itemBeforeEdit[field])) {
        // }
        target[field] = src[field];
      }
    }
    $scope.cancelEdit = function() {
      $scope.resetInvalidSname();
        if($scope.editItem.isEdit) {
          deepCopyWith$(itemBeforeEdit, $scope.editItem);
        } else {
          switch(itemBeforeEdit.src){
            case 'ATTRIBUTE':
              $scope.resource.attributes.splice($scope.resource.attributes.length - 1);
              break;
            case 'ACTION':
              $scope.resource.actions.splice($scope.resource.actions.length - 1);
              break;
            case 'OBLIGATION':
              $scope.resource.obligations.splice($scope.resource.obligations.length - 1);
              break;
            case 'OBLIGATION_PARAMETER':
              itemBeforeEdit.obligation.parameters.splice(itemBeforeEdit.obligation.parameters.length - 1);
              break;
          }
        }
        delete $scope.editItem.obligation;
        $scope.editItem = {};
    }
    $scope.saveEdit = function(tabIndex, item) {
      var errList = [];
      switch(tabIndex){
        case 1:
          errList = validateAttributeTable();
          if(errList.length){
            $scope.attributeTable.error = true;
            $scope.attributeTable.success = false;
            //$scope.attributeTable.notify = true;
            $scope.attributeTable.message = errList.join(', ');
            setNotificationError($scope.attributeTable);
            
          }else{
            $scope.attributeTable.success = true;
            $scope.attributeTable.error = false;
            $scope.attributeTable.message = 'Attribute added to the table successfully';
            setNotification($scope.attributeTable);
          }
          $scope.attributeTable.dirty = false;
          break;
        case 2:
          errList = validateAction(item);
          if(errList.length){
            $scope.actionTable.error = true;
            $scope.actionTable.success = false;
            setNotificationError($scope.actionTable);
            $scope.actionTable.message = errList.join(', ');
          }else{
            $scope.actionTable.success = true;
            $scope.actionTable.error = false;
            $scope.actionTable.message = 'Action added to the table successfully';
            setNotification($scope.actionTable);
          }
          $scope.actionTable.dirty = false;
          break;
        case 3:
          errList = validateObligationTable();
          if(errList.length){
            $scope.obligationTable.error = true;
            $scope.obligationTable.success = false;
            setNotificationError($scope.obligationTable);
            $scope.obligationTable.message = errList.join(', ');
          }else{
            $scope.obligationTable.success = true;
            $scope.obligationTable.error = false;
            $scope.obligationTable.message = 'Obligation added to the table successfully';
            setNotification($scope.obligationTable);
          }
          $scope.obligationTable.dirty = false;
          break;  
      }
      if(errList.length){
        $scope.tabs.hasError = true;
      }else{
        $scope.tabs.hasError = false;
        $scope.editItem = {};
      }
    }
    $scope.deselectTab = function(tabId,event){
      // console.log(arguments);
      var errList = [];
      tabId = (tabId === 1) ? 0 : tabId;
      if(tabId !==  $scope.tabs.preTab) return;
      switch(tabId){
        case 0:
            errList = validateAttributeTable();
            if(errList.length){
              $scope.tabs.hasError = true;
              $scope.attributeTable.error = true;
              $scope.attributeTable.success = false;
              $scope.attributeTable.message = errList.join(', ');
            }
            else{
              $scope.tabs.hasError = false;
              // $scope.attributeTable.error = false;
              // $scope.attributeTable.success = true;
              // $scope.attributeTable.message = errList.join(', ');
            }
          break;
        case 2:
            errList = validateActionTable();
            if(errList.length){
              $scope.tabs.hasError = true;
              $scope.actionTable.error = true;
              $scope.actionTable.success = false;
              $scope.actionTable.message = errList.join(', ');
            }
            else{
              $scope.tabs.hasError = false;
              // $scope.actionTable.error = false;
              // $scope.actionTable.success = true;
              // $scope.actionTable.message = errList.join(', ');
            }
          break; 
        case 3:
            errList = validateObligationTable();
            if(errList.length){
              $scope.tabs.hasError = true;
              $scope.obligationTable.error = true;
              $scope.obligationTable.success = false;
              $scope.obligationTable.message = errList.join(', ');
            }
            else{
              $scope.tabs.hasError = false;
              // $scope.obligationTable.error = false;
              // $scope.obligationTable.success = true;
              // $scope.obligationTable.message = errList.join(', ');
            }
          break;   
      }
      if($scope.editItem.$$hashKey && !$scope.tabs.hasError){
         $scope.saveEdit(tabId);
         $scope.tabs.preTab = (tabId === 1) ? 0 : tabId;
      }
    }
    $scope.selectTab = function(tabId){
      if($scope.tabs.hasError){
        if(tabId === 1) tabId=0; 
        if(tabId !== $scope.tabs.preTab){
          $timeout(function(){
            $scope.tabSelected.val = $scope.tabs.preTab;
          },20);
        }else{
          switch(tabId){
            case 0:
                  setNotificationError($scope.attributeTable);
                  //$scope.attributeTable.notify = false;
              break;
            case 2:
                  setNotificationError($scope.actionTable);
                  //$scope.actionTable.notify = false;
              break;  
             case 3:
                  setNotificationError($scope.obligationTable);
                  //$scope.obligationTable.notify = false;  
              break;
              case 4:
                   setNotificationError($scope.attributeTable);
          }
        }
      }else{
        $scope.tabs.preTab = (tabId === 1) ? 0:tabId;
         switch(tabId){
            case 1:
                
                  $scope.attributeTable.notify = false;
              break;
            case 2:
                  $scope.actionTable.notify = false;
              break;  
             case 3:
               
                  $scope.obligationTable.notify = false;  
              break;  
          }
    }
    localStorage.setItem("activeResourceTab", tabId);
    }
    var validateActionTable = function(option){
      var errMsgs = [];
      var error = {
        action: null,
        errMsgs : errMsgs
      }
      
       // action should have unique short names
      for(var i=0; i < $scope.resource.actions.length;i++){
        var action = $scope.resource.actions[i];
        for(var j=i+1; j<$scope.resource.actions.length;j++){
          var action1 = $scope.resource.actions[j];
          if(action1.shortName === action.shortName){
              errMsgs.push($filter('translate')('Duplicate action short name found',{sname: action.shortName}));
              break;
          }
        }   
      }
     angular.forEach($scope.resource.actions, function(action) {
      if(!action.name) {
        errMsgs.push($filter('translate')('createResource.action.name.validation.required'));
      }
      if(!action.shortName) {
        errMsgs.push($filter('translate')('createResource.action.sname.validation.required'));
        !error.action && (error.action = action)
      }
      if($scope.IsSnameValid(action.shortName)){
        errMsgs.push($filter('translate')('createResource.action.sname.validation.invalidSname'));  
        !error.action && (error.action = action)
      }
     })
      
       return option && option.returnInvalidAction ? error : errMsgs;
    }

    var validateAction = function(action) {
      var errMsgs = [];
      if(!action) return errMsgs;
      for(var j=0; j<$scope.resource.actions.length;j++){
        var action1 = $scope.resource.actions[j];
        if(action != action1 && action1.shortName === action.shortName){
            errMsgs.push($filter('translate')('Duplicate action short name found',{sname: action.shortName}));
            break;
        }
      }  
      if(!action.name) {
        errMsgs.push($filter('translate')('createResource.action.name.validation.required'));
      }
      if(!action.shortName) {
        errMsgs.push($filter('translate')('createResource.action.sname.validation.required'));
      }
      if($scope.IsSnameValid(action.shortName)){
        errMsgs.push($filter('translate')('createResource.action.sname.validation.invalidSname'));  
      }
      // if(!snRegExPattern.test(action.shortName)) {
        // errMsgs.push($filter('translate')('createResource.shortname.validation.pattern'));
      // }
      return errMsgs;
  }
    var validateAttributeTable = function(){
      var errMsgs = [];
      if ($scope.resource.type === 'SUBJECT')
        var preSeededAttrSns = $scope.enrollmentSubjectAttributes.map(function(att){
          return att.shortName.toLowerCase();
        })

       for(var i=0;i < $scope.resource.attributes.length; i++){
        var attr = $scope.resource.attributes[i];
        for(var j=i+1; j<$scope.resource.attributes.length;j++){
          var attr1 = $scope.resource.attributes[j];
          if(attr1.shortName === attr.shortName){
            errMsgs.push($filter('translate')('Duplicate attribute short name found',{sname: attr.shortName}));
            break;
          }
        }
        if ($scope.resource.type === 'SUBJECT'){
          if(preSeededAttrSns && preSeededAttrSns.indexOf(attr.shortName) > -1){
            errMsgs.push($filter('translate')('Duplicate attribute short name in preseeded found',{sname: attr.shortName}));
            break;
          }
        }

       }
       for(var i=0;i < $scope.resource.attributes.length; i++){
        var attr = $scope.resource.attributes[i];
        if(!attr.name)
          errMsgs.push($filter('translate')('createResource.attributeName.validation.required'));
        if(!attr.shortName)
          errMsgs.push($filter('translate')('createResource.attributeSName.validation.required'));
/*  Added for restricting keywords in attribute short name */
/*        if($scope.IsSnameValid(attr.shortName)){
          errMsgs.push($filter('translate')('createResource.attributeSName.validation.invalidSname')); 
         // $scope.resetInvalidSname();
        }*/
        // if(!snRegExPattern.test(attr.shortName))
          // errMsgs.push($filter('translate')('createResource.shortname.validation.pattern'));
        if(!attr.operatorConfigs.length)
          errMsgs.push($filter('translate')('createResource.attributeOperators.validation.required'));
       }
      
       return errMsgs;
    }
    var obligationSNameNotAllowed = ['notify', 'log'];
var validateObligationTable = function(){
      var errMsgs = [];
      var lowerObligationShortNameMap = {};
      for(var i=0;i < $scope.resource.obligations.length; i++){
        var obligation = $scope.resource.obligations[i];
        if (obligation.shortName) {
          if(obligation.shortName.toLowerCase() == "display") {
            errMsgs.push("\"" + obligation.shortName + "\" " + $filter('translate')('createResource.shortname.reservedKeyword'));
            break;
          }
      
          if(lowerObligationShortNameMap[obligation.shortName.toLowerCase()]) {
            errMsgs.push($filter('translate')('Duplicate obligation short name found',{sname: obligation.shortName}));
            break;
          }
          else lowerObligationShortNameMap[obligation.shortName.toLowerCase()] = true
        }
       }
       for(var i=0;i < $scope.resource.obligations.length; i++){
          var obligation = $scope.resource.obligations[i];
          if(!obligation.name)
            errMsgs.push($filter('translate')('createResource.obligation.name.validation.required'));
          if(!obligation.shortName)
            errMsgs.push($filter('translate')('createResource.obligation.sname.validation.required'));
          /*  Added for restricting keywords in obligation short name */
/*          if($scope.IsSnameValid(obligation.shortName)){
            errMsgs.push($filter('translate')('createResource.obligation.sname.validation.invalidSname'));
            //$scope.resetInvalidSname();
          }*/
          if(obligationSNameNotAllowed.indexOf(obligation.shortName) > -1)
            errMsgs.push($filter('translate')('createResource.obligation.sname.validation.reserved', {sname:obligation.shortName}));
          // if(!snRegExPattern.test(obligation.shortName))
            // errMsgs.push($filter('translate')('createResource.shortname.validation.pattern'));


          // obligation parameters should have unique short names
          var lowerParamShortNameMap = {}
          for(var i1=0; i1 < obligation.parameters.length; i1++){
            //$scope.resetInvalidSname();
            var param = obligation.parameters[i1];
            if(!param.name)
              errMsgs.push($filter('translate')('createResource.obligation.attr.name.validation.required'));
            if(!param.shortName)
              errMsgs.push($filter('translate')('createResource.obligation.attr.sname.validation.required'));
            if(lowerParamShortNameMap[param.shortName.toLowerCase()]) {
              errMsgs.push($filter('translate')('Duplicate parameter short name found in the obligation',{sname:param.shortName,obligation:obligation.name}))
              break;
            }
            else lowerParamShortNameMap[param.shortName.toLowerCase()] = true

            /*  Added for restricting keywords in obligation parameter short name */
/*            if($scope.IsSnameValid(param.shortName)){
              var found = errMsgs.indexOf($filter('translate')('createResource.obligation.sname.validation.invalidSname'));
              while(found !== -1){
                errMsgs.splice(found, 1);
                found = errMsgs.indexOf($filter('translate')('createResource.obligation.sname.validation.invalidSname'));
              }
              errMsgs.push($filter('translate')('createResource.obligation.attr.sname.validation.invalidSname'));
              //$scope.resetInvalidSname();
            }*/
            if(!paramSnRegExPattern.test(param.shortName))
              errMsgs.push($filter('translate')('createResource.shortname.validation.pattern'));
            if(param.type.val == 'LIST'){
              if(!param.listValues)
                errMsgs.push($filter('translate')('createResource.obligation.attr.listvalue.validation.required'));
              else if(param.defaultValue && param.defaultValue.length) {
                var valueList = param.listValues.split(',')
                valueList.forEach(function(value, index) {
                  valueList[index] = value.trim()
                })
                var invalidDefaultValue = true
                for(var index in valueList) {
                  if(valueList[index].trim() == param.defaultValue) {
                    invalidDefaultValue = false
                    break
                  }
                }
                if(invalidDefaultValue) errMsgs.push($filter('translate')('createResource.obligation.attr.listvalue.defaultvalue.invalid'));
              }
            }
            if(param.mandatory && (!param.editable || param.hidden) && (!param.defaultValue || !param.defaultValue.length)){
              errMsgs.push($filter('translate')('createResource.obligation.attr.defaultvalue.validation.required'));
            }

          }  
        }

       return errMsgs;
    }

    $scope.attributeTable = {
                              dirty :false,
                              success:true,
                              error:false,
                              notify:false,
                              message:''
                            };
    $scope.actionTable = {
                              dirty :false,
                              success:true,
                              error:false,
                              notify:false,
                              message:''
                            };
    $scope.obligationTable = {
                              dirty :false,
                              success:true,
                              error:false,
                              notify:false,
                              message:''
                            };
     $scope.parameterTable = {
                              dirty :false,
                              success:true,
                              error:false,
                              notify:false,
                              message:''
                            };                        
    $scope.getParameterNames = function(pList){
      var pNames = pList.map(function(o){ 
          return o.name
        })
     // console.log(pList,pNames);
      return pNames.join(', ');
    }                       
    $scope.sortableOptions = {
      handle: '.fa-arrows',
      helper: 'clone',
      placeholder: 'sortable-drop-area',
      forceHelperSize: true,
      opacity: 0.6,
      // update: function(e, ui) {
      //   // var logEntry = tmpList.map(function(i){
      //   //   return i.value;
      //   // }).join(', ');
      //   // $scope.sortingLog.push('Update: ' + logEntry);
      //   console.log(e, ui)
      // },
      // stop: function(e, ui) {
      //   // this callback has the changed model
      //   // var logEntry = tmpList.map(function(i){
      //   //   return i.value;
      //   // }).join(', ');
      //   // $scope.sortingLog.push('Stop: ' + logEntry);
      //   console.log(e, ui)
      // }
    };
    $scope.moveUp = function(list, index) {
      var temp = list[index]
      list[index] = list[index - 1];
      list[index - 1]  = temp;
    }
    $scope.moveDown = function(list, index) {
      var temp = list[index]
      list[index] = list[index + 1];
      list[index + 1]  = temp;
    }
    $scope.getPolicyModelTags = function(label, filterSelection, callback) {
      tagService.getAllMatchingTags('POLICY_MODEL_TAG', label).then(function(resp) {
        callback(resp)
      })
    }
  }
]);
