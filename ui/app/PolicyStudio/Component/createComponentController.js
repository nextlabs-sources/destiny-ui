policyStudio.controller('createComponentController', ['$scope', '$http', '$q', 'componentService', 'configService', 'loggerService', 'versionService', '$uibModal', '$location', '$anchorScroll', '$stateParams', 'dialogService',
  'resourceService', '$filter', '$state', 'autoCloseOptionService', '$window', 'userManualTranslateService', '$rootScope', 'userService','$timeout','tagService',  'constants',
  function($scope, $http, $q, componentService, configService, loggerService, versionService, $uibModal, $location, $anchorScroll, $stateParams, dialogService, resourceService, $filter,
   $state, autoCloseOptionService, $window, userManualTranslateService, $rootScope, userService,$timeout,tagService, constants) {
    //	$scope.ctrl=ctrl;
    'use strict';
    $scope.$parent.transition = "fade-in";
    // $rootScope.hasUserManual = true;
    $scope.$parent.$parent.isCreatePage = true;
    $scope.isEditMode = false;

    $stateParams.componentId && ($scope.isEditMode = true);
    var logger = loggerService.getLogger();
    logger.log('-------', $stateParams);
    $scope.type = $stateParams.type;
    $scope.parentComponent = $stateParams.parentComponent;
    userService.getPermissions('COMPONENT', function(permissions) {
      $scope.permissions = permissions;
    });
    !$scope.isEditMode && userService.goBackIfAccessDenied('CREATE_COMPONENT');
    $scope.userAccessMap = null;
    userService.getUserAccessMap(function(userAccessMap) {
      $scope.userAccessMap = userAccessMap;
    })
    $scope.tab = $stateParams.tab;
    $scope.tabSelected = 0;
    $stateParams.tab  == 'hierarchy'&& ($scope.tabSelected = 1);
    $stateParams.tab  == 'history'&& ($scope.tabSelected = 2);
    $stateParams.tab  == 'graph'&& ($scope.tabSelected = 3);
    $scope.componentForm = {
      val: null,
    }

    $scope.component = {
      id: null,
      name: null,
      description: null,
      tags: [],
      resourceType: null,
      conditions: [],
      actions: [],
      memberConditions: [],      
      subComponents: [],
      policyModel: {},
      countEmptySub: 0,
      version : null,
      folderId: null,
      folderPath: null
    };
    $scope.component.folderId = $stateParams.folderId;
    $scope.component.folderPath = $stateParams.folderPath;

    $scope.attributes = [{
      attr: "In",
      value: "IN"
    }, {
      attr: "Not In",
      value: "NOT"
    }];
    var attributeMap = {};
    angular.forEach($scope.attributes, function(attr) {
      attributeMap[attr.value] = attr;
    })
    
    $scope.disablePolicyModel = false;
    $scope.parentComponent && ($scope.disablePolicyModel = true);
    var allResourcePM = []
    var setResouceTypes = function(data) {
      $scope.ResourceTypes = $filter('orderBy')(data.data, 'name');
      // Uncomment to set 'User' as default..
      /* if(!$scope.isEditMode && $scope.type == 'Subject') {
        let index =$scope.ResourceTypes.findIndex( subjectType => subjectType.shortName === "user" );
        $scope.changeResourceType($scope.ResourceTypes[index],true);
      }*/
      // set to parent's component type if parent is specified
      $scope.parentComponent && angular.forEach($scope.ResourceTypes, function(rType) {
        if (rType.id == $scope.parentComponent.modelId) {
          $scope.component.policyModel = rType;
          $scope.changeResourceType(rType);
        }
      });
    }
    $scope.ResourceTypes = [];
    $scope.subjectEnrollmentAttrs = [];
    var setComponentPromises = [];
    $scope.extraAttrOptions = [];

    switch ($stateParams.type.toUpperCase()) {
      case 'RESOURCE': {
        $scope.componentType = 'RESOURCE';
        setComponentPromises.push(resourceService.getResourceLiteList('RESOURCE', function (data) {
          setResouceTypes(data);
          angular.forEach($filter('orderBy')(data.data, 'name'), function (pm) {
            allResourcePM[pm.id] = pm;
          });
        }));
        break;
      }
      case 'ACTION': {
        $scope.componentType = 'ACTION';
        setComponentPromises.push(resourceService.getResourceLiteList('RESOURCE', setResouceTypes));
        break;
      }
      case 'SUBJECT': {
        $scope.componentType = 'SUBJECT';
        setComponentPromises.push(resourceService.getResourceLiteList('RESOURCE', function (data) {
          angular.forEach($filter('orderBy')(data.data, 'name'), function (pm) {
            allResourcePM[pm.id] = pm;
          });
        }));
        break;
      }
    }

    var defaultSubjectPolicyModels = null;
    setComponentPromises.push(resourceService.getResourceLiteList('SUBJECT', function (data) {
      defaultSubjectPolicyModels = data.data;
      if ($stateParams.type.toUpperCase() === "SUBJECT") {
        setResouceTypes(data);
        $scope.subjectEnrollmentAttrs = data.data;
      }
    }).then(function () {
      var enrollmentAttributePromises = [];
      angular.forEach(defaultSubjectPolicyModels, function (policyModel, index) {
        enrollmentAttributePromises.push(resourceService.getEnrollmentSubjectAttributes(policyModel.shortName, function (data) {
          if (data.data && data.data.length) {
            defaultSubjectPolicyModels[index].enrollmentAttributes = data.data;
            if ($stateParams.type.toUpperCase() == "SUBJECT") {
              $scope.subjectEnrollmentAttrs[index].enrollmentAttributes = data.data;
            }
          }
        }));
      });
      return $q.all(enrollmentAttributePromises);
    }));
    
    // to be sent with create/edit request
    var componentPayLoad = {
      "id": null,
      "name": null,
      "description": null,
      "tags": [],
      "type": $scope.componentType,
      //"policyModel": {},
      "conditions": [],
      "memberConditions":[],
      "actions": [],
      "subComponents": [],
      "version" : null
    }
    var getTagPayLoad = function() {
      return {
        "id": null,
        "key": "",
        "label": "",
        "type": "COMPONENT_TAG",
        "status": "ACTIVE"
      }
    }
    $scope.attributeOptions = [];
    $scope.actionOptions = [];
    $scope.subComponentOptions = [];
    // $scope.attributes = [];


    var currentTarget = "componentName";
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
   
    var refreshSubComponentChecked = function() {
      angular.forEach($scope.subComponentOptions, function(option) {
        angular.forEach($scope.component.subComponents, function(subComponent) {
          if (subComponent.id == option.id) {
            option.$_checked = true;
          }
        })
      });
    }
    var refreshActionChecked = function() {
      angular.forEach($scope.actionOptions, function(option) {
        angular.forEach($scope.component.actions, function(actionSName) {
          if (option.shortName.toLowerCase() == actionSName.toLowerCase()) {
            option.$_checked = true;
          }
        });
      });
    }
    $scope.component_conditions = [];
    $scope.changeResourceType = function(resourceType, keepOptions) {
      $scope.editItem = {}
      !keepOptions && $scope.setDirty($scope.componentForm.val);
      var deferred = $q.defer();

      var changeResourceTypeImpl = function() {
        $scope.component.policyModel = resourceType;
        if (!keepOptions) {
          $scope.component_conditions = [];
          $scope.actionOptions = [];
          $scope.updateActionLabel();
          $scope.component.memberConditions = [];
          $scope.subComponentOptions = [];
          $scope.component.subComponents = [];
        }
        $scope.attributeOptions = [];
        $scope.component_conditions = [];
        function updatePM(pm) {
          if(!allResourcePM[resourceType.id]) {
            allResourcePM[resourceType.id] = pm
          }
          $scope.attributeOptions= $filter('orderBy')(pm.attributes, 'sortOrder');
          angular.forEach($scope.attributeOptions, function(attr) {
            attr.operatorConfigs = $filter('orderBy')(attr.operatorConfigs, 'label', false)  
           });

          if(resourceType.type.toUpperCase() === 'SUBJECT'){
            let index = -1;
            for(let j = 0; j < $scope.subjectEnrollmentAttrs.length; j++){
              if($scope.subjectEnrollmentAttrs[j].shortName.toLowerCase() === $scope.component.policyModel.shortName.toLowerCase()){
                index = j;
                break;
              }
            }
            //Getting the enrollment attributes..
            if(index !== -1) {
              $scope.extraAttrOptions = $scope.subjectEnrollmentAttrs[index].enrollmentAttributes;
              angular.forEach($scope.extraAttrOptions, function(attr) {
                attr.operatorConfigs = $filter('orderBy')(attr.operatorConfigs, 'label')  
              });
            }
          }

          angular.forEach($scope.component.conditions, function(condition,index) {
            // logger.log('condition', JSON.stringify(condition))
            var tempCondition = {$$hashKey:100+index};
            tempCondition.value = condition.value;
            $scope.component_conditions.push(tempCondition);
            // condition.attribute += '-1'; // test for removed attribute issue 
            angular.forEach($scope.allAttrOptions(), function(attrOption) {
              if (attrOption !== undefined && attrOption.shortName.toLowerCase() == condition.attribute.toLowerCase()) {
                // logger.log('match found')
                tempCondition.attribute = attrOption;
                angular.forEach(attrOption.operatorConfigs, function(operator) {
                  if (operator.key == condition.operator) {
                    tempCondition.operator = operator;
                  }
                })
              }
            });
            if(!tempCondition.attribute) {
              $scope.conditionTable.error = tempCondition.attributeRemoved = true;
              $scope.conditionTable.message = 'One or more attributes are removed, please fix the conditions.';
              $scope.conditionTable.notify = true;
            }
          });
          $scope.actionOptions = $filter('orderBy')(pm.actions, 'sortOrder');
          deferred.resolve();
        }

        if (!allResourcePM[resourceType.id]) {
          resourceService.getResourceLite(resourceType.id, function (response) {
            updatePM(response.data);
          });
        } else {
          updatePM(allResourcePM[resourceType.id]);
        }

        $scope.memberTypeFilters = constants.memberTypeFilters[$stateParams.type.toLowerCase()].slice();
        Array.prototype.push.apply($scope.memberTypeFilters, constants.memberTypeFilters[$scope.component.policyModel.shortName]);

        setComponentPromises.push(componentService.getComponentLiteList($scope.componentType, resourceType.name, function (data) {
          data.data.forEach(function (subComponentOption) {
            subComponentOption.typeId = 'COMPONENT_' + subComponentOption.id;
          });
          $scope.subComponentOptions = data.data;
          angular.forEach($scope.subComponentOptions, function (option) {
            option.$_checked = false;
          })
          refreshSubComponentChecked();
        }));
      };
      if (keepOptions || ($scope.shouldShowCondition() && $scope.component_conditions.length == 0 || $scope.shouldShowAction() && $scope.component.actions.length == 0) && $scope.component.subComponents.length == 0) changeResourceTypeImpl();
      else {
        dialogService.confirm({
          msg: $filter('translate')('createComponent.confirm.change.resourcetype.' + $scope.type),
          ok: changeResourceTypeImpl
        });
      }
      return deferred.promise;
    }
    $scope.shouldShowCondition = function() {
      return $scope.type == 'Resource' || $scope.type == 'Subject';
    }
    $scope.shouldShowAction = function() {
      return $scope.type == 'Action';
    }
    var prepareComponentPayload = function() {
      loggerService.getLogger().log('component:', $scope.component);
      componentPayLoad.id = $scope.component.id;
      componentPayLoad.folderId = $stateParams.folderId || $scope.component.folderId;
      componentPayLoad.name = $scope.component.name;
      componentPayLoad.description = $scope.component.description;
      if($scope.component.policyModel && $scope.component.policyModel.id){
        componentPayLoad.policyModel = {};
        componentPayLoad.policyModel.id = $scope.component.policyModel.id;
        componentPayLoad.policyModel.name = $scope.component.policyModel.name;
        componentPayLoad.policyModel.shortName = $scope.component.policyModel.shortName;
      }
      //version
      componentPayLoad.version = $scope.component.version;
      //tags
      componentPayLoad.tags = [];
      for (var i = 0; i < $scope.component.tags.length; i++) {
        var t = getTagPayLoad();
        t.id = $scope.component.tags[i].id;
        t.key = $scope.component.tags[i].key;
        t.label = $scope.component.tags[i].label;
        componentPayLoad.tags.push(t);
      }
      componentPayLoad.actions = [];
      for (var i = 0; i < $scope.component.actions.length; i++) {
        componentPayLoad.actions.push($scope.component.actions[i].shortName);
      }
      componentPayLoad.conditions = [];
      for (var i = 0; i < $scope.component_conditions.length; i++) {
        var t = {};
        t.attribute = $scope.component_conditions[i].attribute.shortName;
        t.operator = $scope.component_conditions[i].operator.key;
        if($scope.component_conditions[i].attribute.dataType === 'DATE'){
          t.value = angular.isDate($scope.component_conditions[i].value) ? new Date($scope.component_conditions[i].value).getTime() : new Date(parseInt($scope.component_conditions[i].value)).getTime();
        } else {
          t.value = $scope.component_conditions[i].value.trim();
        }
        componentPayLoad.conditions.push(t);
      }

      //member conditions:
      componentPayLoad.memberConditions = [];
      angular.forEach($scope.component.memberConditions, function(memberCondition){
       if(memberCondition.members.length){
         var m = {};
         m.operator = memberCondition.operator.value;
         m.members = memberCondition.members.map(function(item){
           return {
             id: item.id,
             type: item.type,
             memberType: item.memberType
           }
         });
         componentPayLoad.memberConditions.push(m);
       }
      });

      componentPayLoad.subComponents = [];
      for (var i = 0; i < $scope.component.subComponents.length; i++) {
        var t = {};
        t.id = $scope.component.subComponents[i].id;
        t.name = $scope.component.subComponents[i].name;
        componentPayLoad.subComponents.push(t);
      }
      componentPayLoad.status = 'DRAFT';
      if ($scope.parentComponent)
        componentPayLoad.parentId = $scope.parentComponent.id;
      loggerService.getLogger().log('component Payload:', componentPayLoad);
    }
    var buttonListForBackToList = [{
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        callback && callback();
      }
    }, {
      label: $filter('translate')('BACK TO COMPONENT LIST'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.componentForm.val.$setPristine();
        $state.go('PolicyStudio.Components', {
          type: $scope.type
        });
        callback && callback();
      }
    }];
    var buttonListForDiscarding = [{
      label: $filter('translate')('CANCEL'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        // $state.go('PolicyStudio.Policies');
        callback && callback();
      }
    }, {
      label: $filter('translate')('RESET'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.componentForm.val.$setPristine();
        $state.reload();
        callback && callback();
      }
    }];
    $scope.setDirty = function(frm) {
       frm.$setDirty();
    }
    $scope.saveAndDeployComponent = function (frm, save, deploy) {
      logger.log(frm);
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
      if ($filter('filter')($scope.component_conditions, { attributeRemoved: true }).length) {
        $scope.conditionTable.error = true;
        $scope.conditionTable.message = 'One or more attributes are removed, please fix the conditions.';
        $scope.conditionTable.notify = true;
        notifyOnConditionTimer && $timeout.cancel(notifyOnConditionTimer);
        $scope.$broadcast('scrollto');
        return;
      }

      prepareComponentPayload();
      componentPayLoad.skipValidate = true

      var saveAction = save ?
        $scope.isEditMode ?
          componentService.modifyComponent :
          (componentPayLoad.parentId ?
            componentService.saveSubComponent :
            componentService.saveComponent)
        : function (payload, callback) {
          callback({ data: payload.id,
            deployOnly: true  });
        };

      saveAction(componentPayLoad, function (response) {
        frm.$setPristine()
        $scope.component.id = response.data
        if(!response.deployOnly) {
          $scope.componentForm.val.$setPristine()
          $state.current.name == 'PolicyStudio.editComponent' ? $state.reload() : $scope.editComponent($scope.component);
        }
        if (deploy) {
          componentService.deploy([$scope.component.id], true, $scope.type, save, function () {
            if(response.deployOnly) {
              $scope.componentForm.val.$setPristine();
            }
            $state.current.name == 'PolicyStudio.editComponent' ? $state.reload() : $scope.editComponent($scope.component)
          })
        } else {
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createComponent.added.notify'),
            backLink: "PolicyStudio.Components({type:'" + $scope.type + "'})",
            backLabel: $filter('translate')('BACK TO COMPONENT LIST')
          })
        }
      })
    }

    $scope.discardComponent = function(frm) {
      if (frm.$pristine) {
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createComponent.reset.confirm'),
          buttonList: buttonListForDiscarding
        });
      }
    };
    $scope.componentPreview = null;
    $scope.compPreviewStartIndex = 0;
    var PAGE_SIZE_COMP_PREVIEW = configService.configObject.policyStudio['defaultComponentPreviewPageSize'];
    $scope.compPreviewPageNo = 0;
    $scope.compPreviewPageSize = PAGE_SIZE_COMP_PREVIEW;
    $scope.openComponentPreviewPanel = function(frm) {
      $scope.componentPreview = undefined;
      if($scope.component.policyModel && angular.equals({}, $scope.component.policyModel)) {
        dialogService.notify({
          msg: $filter('translate')('component.subject.type.not.selected'),
          ok: function() {
            return;
          }
        })
      } else {
        prepareComponentPayload();
        componentPayLoad.pageNo = 0;
        componentPayLoad.pageSize = PAGE_SIZE_COMP_PREVIEW;
        componentService.getComponentPreview(componentPayLoad, function(data){
            $scope.componentPreview = data.data;
            autoCloseOptionService.registerOpen($scope, $scope.closeComponentPreviewPanel);
        });
      }
    };

    $scope.closeComponentPreviewPanel = function(){
      $scope.componentPreview = undefined;
      $scope.compPreviewStartIndex = 0;
      $scope.compPreviewPageSize = PAGE_SIZE_COMP_PREVIEW;
    }

    $scope.previousCompPage = function(){
      if(!($scope.compPreviewStartIndex - $scope.compPreviewPageSize < 0)) {
        $scope.compPreviewStartIndex -= $scope.compPreviewPageSize;
        --$scope.compPreviewPageNo;
        prepareComponentPayload();
        componentPayLoad.pageNo = $scope.compPreviewPageNo;
        componentPayLoad.pageSize = PAGE_SIZE_COMP_PREVIEW;
        componentService.getComponentPreview(componentPayLoad, function(data){
          $scope.componentPreview = data.data;
          autoCloseOptionService.registerOpen($scope, $scope.closeComponentPreviewPanel);
        });
      }
    }

    $scope.nextCompPage = function(){
      if(!($scope.compPreviewStartIndex + $scope.compPreviewPageSize >= $scope.componentPreview.totalEnrolledSubjects)){
        $scope.compPreviewStartIndex += $scope.compPreviewPageSize;
        ++$scope.compPreviewPageNo;
        prepareComponentPayload();
        componentPayLoad.pageNo = $scope.compPreviewPageNo;
        componentPayLoad.pageSize = PAGE_SIZE_COMP_PREVIEW;
        componentService.getComponentPreview(componentPayLoad, function(data){
          $scope.componentPreview = data.data;
          autoCloseOptionService.registerOpen($scope, $scope.closeComponentPreviewPanel);
        });
      }
    }

    $scope.backToComponentList = function(frm) {
      if (($scope.isEditMode && !$scope.component.authoritiesParsed.EDIT_COMPONENT) || frm.$pristine) {
        $scope.componentForm.val.$setPristine();
        $state.go('PolicyStudio.Components', {
          type: $scope.type
        });
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createComponent.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };
    var getEmptyCondition = function() {
        return {
          id: null,
          key: '',
          attr: '',
          value: '',
        }
      }
      //$scope.component.conditions.push(getEmptyCondition()); 

    var getEmptyMemberCondition = function(){
      return {
        operator: attributeMap['IN'],
        members: []
      }
    }
    

    $scope.addTag = function(tag, callback) {
      loggerService.getLogger().log('add tag:' + tag);
      componentService.addTag(tag, function(data) {
        var tagId = data.data;
        componentService.getTagById(tagId, function(data) {
          $scope.component.tags.push(data.data);
          callback && callback();
        });
      })
    }
    $scope.addCondition = function() {
      if($scope.allAttrOptions().length){
        var c=getEmptyCondition();
        if(!c.$$hashKey) c.$$hashKey = 100 + $scope.component_conditions.length;
        $scope.component_conditions.push(c);
        $scope.editItem = c;
        $scope.editItem.isEdit = false;
        // $scope.conditionTable.notify = false;
      }
      else{
        
        if($scope.component.policyModel && !angular.equals({},$scope.component.policyModel)){
          // selected resource type doesn't have any attribute
          dialogService.notify({
            msg: $filter('translate')('The selected Resource Type does not have any attributes'),
            ok: function() {
              return;
            }
          })
          
        }else{
          // no subject/resource type selected
          var type = ($scope.componentType == 'SUBJECT') ? 'Subject' : 'Resource';
          dialogService.notify({
              msg: $filter('translate')('Please select a ' + type +' Type'),
              ok: function() {
                return;
              }
          })
        }
       
      }
     
    }
    $scope.removeCondition = function(index,fromViewTable) {
      $scope.setDirty($scope.componentForm.val);
      loggerService.getLogger().log('Remove condition index:', index);
      $scope.component_conditions.splice(index, 1);
      $scope.conditionTable.notify = false;
      angular.forEach($scope.component_conditions, function(condition, index) {
        condition.$$hashKey = 100 + index;
      })
    }

    $scope.addMemberCondition = function(){
      $scope.component.memberConditions.push(getEmptyMemberCondition());
    }

    $scope.removeMemberCondition = function(index){
      $scope.component.memberConditions.splice(index, 1);
    }

    var setComponent = function(component) {
      if(!component.data) {
        dialogService.notify({
          msg: $filter('translate')('createcomponent.component.unavailable'),
          ok: function() {
            $window.history.back();
            return;
          }
        })
        return;
      }
      loggerService.getLogger().log(component);
      $q.all(setComponentPromises).then(function() {
      // set/ populate policy object to correctly reflect in the UI
      // ensure the key names match exactly
        $scope.component = component.data;
        $scope.component.deploymentStatus = component.data.deployed ?
          (component.data.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
          : (component.data.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))

        
        $scope.newSubCompCopy = [];
        if($scope.component.subComponents){
          $scope.component.countEmptySub = 0;
          var subCompLength = $scope.component.subComponents.length;
          for(var ctr = 0; ctr < subCompLength; ctr++){
            if($scope.component.subComponents[ctr].name){
              $scope.newSubCompCopy.push($scope.component.subComponents[ctr]);
            }else{
              $scope.component.countEmptySub++;
            }
          }
        }
        if($scope.component.countEmptySub > 0 && $state.params.isReverted){
            dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createComponent.emptySubComp'),
            timeout:5000
          });
        }
        $scope.component.subComponents = $scope.newSubCompCopy;

        !$scope.component.memberConditions.length && $scope.component.memberConditions.push(getEmptyMemberCondition());

        $scope.component.authoritiesParsed = componentService.parseAuthorities($scope.component, $scope.permissions);
        !$scope.component.authoritiesParsed['VIEW_COMPONENT'] && userService.showWarningAndGoBack();
        $scope.component.id = $scope.currentComponentId;
        $state.current.pageTitle = $scope.component.name; 

        if ($scope.component.policyModel && $scope.component.policyModel.id) {
          $scope.disablePolicyModel = true;
          var policyModelId = $scope.component.policyModel.id;
          $scope.component.policyModel = null;
          angular.forEach($scope.component.memberConditions, function (condition) {
            condition.operator = attributeMap[(condition.operator) ? condition.operator : 'IN'];
          });
          angular.forEach($scope.ResourceTypes, function(resourceTypeOption) {
            if (resourceTypeOption.id == policyModelId) {
              $scope.changeResourceType(resourceTypeOption, true).then(function() {
                refreshActionChecked();
                $scope.updateActionLabel();
                refreshSubComponentChecked();
              })
            }
          });
        }
        $timeout(function() {
          $rootScope.$broadcast('windowResize');
        }, 10)
      });
    }

    $scope.componentHierarchy = null;
    $scope.getComponentHierarchy = function() {
      if ($scope.componentHierarchy) return;
      componentService.getComponentHierarchy($scope.currentComponentId, function(data) {
        $scope.componentHierarchy = data.data;
        $scope.componentHierarchy.externalStatus = $scope.componentStatus($scope.componentHierarchy);
        $scope.componentHierarchy.authoritiesParsed = componentService.parseAuthorities($scope.componentHierarchy, $scope.permissions);
        if ($scope.componentHierarchy.hasIncludedIn) {
          angular.forEach($scope.componentHierarchy.includedInComponents, function(hierarchy) {
            hierarchy.externalStatus = $scope.componentStatus(hierarchy);
            hierarchy.authoritiesParsed = componentService.parseAuthorities(hierarchy, $scope.permissions);
          })
        }
        if ($scope.componentHierarchy.hasSubComponents) {
          angular.forEach($scope.componentHierarchy.subComponents, function(hierarchy) {
            hierarchy.externalStatus = $scope.componentStatus(hierarchy);
            hierarchy.authoritiesParsed = componentService.parseAuthorities(hierarchy, $scope.permissions);
          })
        }
      })
    }
    if ($stateParams.componentId) {
      $scope.currentComponentId = $stateParams.componentId;
      componentService.getComponentById($scope.currentComponentId, setComponent);
    }else{

      $state.current.pageTitle = $filter('translate')("createComponent.title.CreateComponent");
    }

    $rootScope.immediateStateChange = function() {
      return $scope.componentForm.val.$pristine;
    }
    $rootScope.stateChangeHook = function(state) {
      dialogService.confirm({
        msg: $filter('translate')('common.discard.confirm'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function() {
          $scope.componentForm.val.$setPristine();
          $state.go(state.name, state.params)
        },
        cancel: function() {
          delete $state.current.params.$force;
        }
      })
    }

    $scope.editComponent = function(component, tab) {
        $state.go('PolicyStudio.editComponent', {
          componentId: component.id,
          type: $scope.type,
          tab: tab
      });
    };
    $scope.dropdownClicked = function($event) {
      if ($($event.target).attr('data-propagation') != 'true') $event.stopPropagation();
    };
    $scope.updateActionLabel = function() {
      $scope.component.actions = [];
      angular.forEach($scope.actionOptions, function(option) {
        option.$_checked && $scope.component.actions.push(option);
      });
      if ($scope.component.actions.length == 0)
        $scope.actionLabel = $filter('translate')('createComponent.label.NoActionSelected')
      else {
        $scope.actionLabel = '';
        for (var index in $scope.component.actions) {
          if (index > 0) $scope.actionLabel = $scope.actionLabel + ', ';
          $scope.actionLabel = $scope.actionLabel + $scope.component.actions[index].name
        }
      }
    }
    $scope.subcomponentQuery = {
      content: null
    };
    $scope.updateActionLabel();
    $scope.deleteSubComponent = function(index) {
      var deleted = $scope.component.subComponents.splice(index, 1)[0];
      angular.forEach($scope.subComponentOptions, function(option) {
        if (option.id == deleted.id) option.$_checked = false;
      });
    }
    $scope.componentNotSelected = function(notSelected) {
      return function(item) {
        if (item.id == $scope.currentComponentId) return false;
        for (var index in $scope.component.subComponents) {
          if ($scope.component.subComponents[index].id == item.id) return !notSelected;
        }
        return notSelected;
      };
    }
    $scope.createNewSubComponent = function(name, callback) {
      var newComponent = {
        "name": name,
        "type": $scope.componentType,
        "status": "DRAFT",
        "folderId": $scope.component.folderId,
        policyModel: {
          id : $scope.component.policyModel.id,
          name : $scope.component.policyModel.name
        }
      };
      componentService.saveComponent(newComponent, function(data) {
        var newID = data.data;
        componentService.getComponentById(newID, function(data) {
          var newComponent = data.data;
          newComponent.id = newID;
          newComponent.$_checked = true;
          newComponent.empty = true;
          $scope.subComponentOptions.push(newComponent);
          newComponent.typeId = 'COMPONENT_' + newComponent.id;
          callback && callback(newComponent);
        })
      })
    }
    $scope.delComponent = function($event) {
      dialogService.confirm({
        msg: $filter('translate')('componentlist.del.confirm'),
        confirmLabel: $filter('translate')('DELETE'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          componentService.delComponent($scope.component, function() {
            // dialogService.notify({
            //   msg: $filter('translate')('componentlist.deleted.notify'),
            //   ok: function() {
            //     $scope.componentForm.val.$setPristine();
            //     $state.go('PolicyStudio.Components', {
            //       type: $scope.type
            //     });
            //   }
            // });
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('componentlist.deleted.notify'),
              timeout:5000
            });
            $scope.componentForm.val.$setPristine();
            $state.go('PolicyStudio.Components', {
              type: $scope.type
            });
          });
        }
      })
      $event.stopPropagation();
    };

    $scope.componentHistory = null;
    $scope.getComponentHistory = function() {
      if ($scope.componentHistory == null) {
        componentService.getComponentHistory($scope.currentComponentId, function(data) {
          $scope.componentHistory = data.data;
        });
      }
    }
    $scope.componentRevision = null;
    $scope.openVersionPanel = function(revision, latest) {
      $scope.componentRevision = undefined;
      // !revision && ($scope.componentRevision = 'revision');
      componentService.getComponentRevision(revision.id, revision.revision, function(data) {
        $scope.componentRevision = data.data;
        $scope.componentRevision.latest = latest;
        $scope.componentRevision.actionType = revision.actionType;
        angular.forEach($scope.componentRevision.componentDetail.conditions, function(condition) {
          var datatype = $filter('filter')($scope.component.policyModel.attributes, {shortName: condition.attribute})[0].dataType;
          condition.value = (datatype === 'DATE') ? $filter('date')(new Date(parseInt(condition.value)), 'shortDate') : condition.value;
        })
        autoCloseOptionService.registerOpen($scope, $scope.closeVersionPanel);
      })
    }
    $scope.closeVersionPanel = function() {
      $scope.componentRevision = undefined;
    }
    $scope.revertToRevision = function(revision, $event) {
      dialogService.confirm({
        msg: $filter('translate')('createComponent.revert.confirm'),
        confirmLabel: $filter('translate')('REVERT'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function() {
          componentService.revertToRevision(revision.id, function() {
          //   dialogService.notify({
          //   msg: $filter('translate')('createComponent.reverted.notify'),
          //   ok: function() {
          //     $scope.componentForm.val.$setPristine();
          //     if($state.params.tab == 'history') $state.reload();
          //     else $state.go('PolicyStudio.editComponent', {
          //       componentId: $scope.component.id,
          //       tab: 'history'
          //     })
          //   }
          // })
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createComponent.reverted.notify'),
            timeout:5000
          });
          $scope.componentForm.val.$setPristine();
          if($state.params.tab == 'history') $state.reload();
          else $state.go('PolicyStudio.editComponent', {
              componentId: $scope.component.id,
              tab: 'history',
              isReverted : true
            })
          })
        }
      })
      $event.stopPropagation();
    }
    $scope.addSubComponent = function() {
      //    componentService.setComponentID(component.id);
      if(!$scope.component.policyModel || !$scope.component.policyModel.id) {
        dialogService.notify({
          msg: $filter('translate')('componentlist.notify.addingToEmptyComponent')
        });
        return;
      }
      $scope.component.modelId = $scope.component.policyModel.id;
      $state.go('PolicyStudio.createComponent', {
          parentComponent: $scope.component,
          folderId: $scope.component.folderId,
          folderPath: $scope.component.folderPath,
          type: $scope.type
      });
    }
    $scope.allAttrOptions = function() {
      return $scope.attributeOptions.concat($scope.extraAttrOptions);
    }
    $scope.componentStatus = function(component) {
      switch (component.status) {
        case 'ACTIVE':
        case 'SUBMITTED':
        case 'DEPLOYED':
        case 'APPROVED':
          return {
            
            deployed: true,
            active: true
          };
          
        case 'DE_ACTIVATED':
          return {
            deployed: true,
            active: false
          };
          
        default:
          return {
            deployed: false,
            active: false
          };
      }
    };
    $scope.showUserManual = {};
    $scope.userManualOption = {
      app: 'Console',
      section: 'Policy Studio',
      page: 'Create Component:' + $scope.type,
    }
    $scope.pageOptionList = null;
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
      if(newValue == oldValue) return;
      showAllManual(newValue);
    });
    $scope.$watch(function() {
      return $scope.showUserManual;
    }, function(newValue, oldValue) {
      if(newValue == oldValue) return;
      var showAboutPage = false;
      for (var key in $scope.showUserManual) {
        showAboutPage = showAboutPage || $scope.showUserManual[key];
      }
      $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
    }, true);
    var watchComponentExt = function(){
      $scope.$watch(function() {
        return $scope.component;
      }, function(newValue, oldValue) {
        if(newValue == oldValue) return;
        $scope.setDirty($scope.componentForm.val);
      }, true);
    }
    !$scope.isEditMode && watchComponentExt();
    $scope.editItem = {$$hashKey:0};
    var itemBeforeEdit = null;
    $scope.setEdit = function(item) {
      if($scope.editItem.$$hashKey){
         $scope.resetEdit();
         if($scope.conditionTable.error) return;
      }
      if(item.attribute.dataType === "DATE" && !angular.isDate(item.value)){
        item.value = new Date(parseInt(item.value));
      }
      itemBeforeEdit = angular.copy(item);
      $scope.editItem = item;
      $scope.editItem.$$hashKey = item.$$hashKey;
      // $scope.editItem = itemBeforeEdit;
      $scope.editItem.isEdit = true;
      $scope.conditionTable.dirty = true;
      // $scope.conditionTable.notify = false;
      
      
    }
    var notifyOnConditionTimer = null;
    var setNotification = function(table){
      table.notify = true;
      notifyOnConditionTimer && $timeout.cancel(notifyOnConditionTimer);
      notifyOnConditionTimer = $timeout(function(){
           table.notify = false;
      },3000);
    }
    $scope.saveCondition = function(condition) {
      $scope.conditionTable.error = false;
      $scope.conditionTable.notify = false;
      
      var conditionErrMsg = validateCondition(condition);
      if(conditionErrMsg){
        $scope.conditionTable.error = true;
        $scope.conditionTable.success = false;
        setNotification($scope.conditionTable);
        $scope.conditionTable.message = conditionErrMsg;
        
      }else{
          condition.attributeRemoved = false;
          if(!condition.attribute) {
            $scope.conditionTable.error = condition.attributeRemoved = true;
            $scope.conditionTable.message = 'One or more attributes are removed, please fix the conditions.';
            $timeout.cancel(notifyOnConditionTimer);
            $scope.conditionTable.notify = true;
          }

        if(!$scope.conditionTable.error) {
          $scope.editItem = {$$hashKey:0};
          $scope.conditionTable.success = true;
          $scope.conditionTable.error = false;
          $scope.conditionTable.message = 'Condition added to the table successfully';
          setNotification($scope.conditionTable); 
        }
      }
    }
    $scope.resetEdit = function() {
      if($scope.editItem.isEdit) {
        angular.copy(itemBeforeEdit, $scope.editItem);
      } else {
        $scope.component_conditions.splice($scope.component_conditions.length - 1, 1);
      }
      $scope.editItem = {$$hashKey:0};
      angular.forEach($scope.component_conditions, function(tempCondition) {
        tempCondition.attributeRemoved = false;
        if(!tempCondition.attribute) {
          $scope.conditionTable.error = tempCondition.attributeRemoved = true;
          $scope.conditionTable.message = 'One or more attributes are removed, please fix the conditions.';
          $timeout.cancel(notifyOnConditionTimer);
          $scope.conditionTable.notify = true;
        }
      });
    }
    var validateConditionTable = function(){
      var errMsgs = [];
      for(var i=0;i < $scope.component_conditions.length; i++){
        var condition = $scope.component_conditions[i];
        // if(!condition.attribute)
          // errMsgs = ['One or more attributes are removed, please fix the conditions.'];
        var conditionErrMsg = validateCondition(condition);
        conditionErrMsg && errMsgs.push(conditionErrMsg);
      }
      
      return errMsgs;
    }
    var validateCondition = function (condition) {
      if (!condition.value || (condition.attribute.dataType === 'MULTIVAL' && condition.value == '[]')) {
        return $filter('translate')('component.condition.value.validation.required');
      }
    }
    $scope.conditionTable = {
      dirty :false,
      success:true,
      error:false,
      notify:false,
      message:''
    };

    String.prototype.regexLastIndexOf = function(regex) {
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
        var startpos = this.length - 1
        var lastIndexOf = 0
        do {
          var stringToWorkWith = this.substring(startpos);
          var exec = regex.exec(stringToWorkWith)
          if(exec) {
            lastIndexOf = startpos + exec[0].length
            break
          }
          startpos--
        } while(startpos > -1)
        return lastIndexOf;
    }
    String.prototype.regexFirstIndexOf = function(regex) {
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
        var lastIndexOf = this.length
        var exec = regex.exec(this)
        if(exec) {
          var matchFound = exec[0]
          lastIndexOf = this.indexOf(matchFound)
          // logger.log(this, matchFound, lastIndexOf)
        }
        return lastIndexOf;
    }
    if(!String.prototype.trimLeft) String.prototype.trimLeft = function() {
      return this.replace(/^\s+/g, '');
    }
    // var lastPartPosRE = /[(){}\[\]$&*=!."']|([\^\s](AND|OR|NOT|and|or|not)\s+)/
    // var lastLogicPartPosRE = /[(){}\[\]$&*]|([\^\s](AND|OR|NOT|and|or|not)\s+)/
    // var getLastLogicPart = function(prefix) {
    //   return prefix.regexLastIndexOf(lastLogicPartPosRE, 0)
    // }

    var lastPartPosRE = /[(){}\[\]$&*!=><\s]|([\^\s](AND|OR|NOT|and|or|not)\s+)/
    var lastPartPosREPad$ = /[(){}\[\]&*!=><\s]|([\^\s](AND|OR|NOT|and|or|not)\s+)/
    var getLastPart = function(str, pad$) {
      var lastPartStartPos = 0, inQuote = false
      while(true) {
        lastPartStartPos = str.regexLastIndexOf(pad$ ? lastPartPosREPad$ : lastPartPosRE)
        var strBefore = str.substring(0, lastPartStartPos)
        if(strBefore.indexOf('"') > -1) {
          var firstQuote = strBefore.indexOf('"'), secondQuote = -1;
          for(var index = firstQuote + 1; index < strBefore.length; index++) {
            if(strBefore[index] == '"') {
              if(firstQuote > -1) {
                secondQuote = index
                try {
                  JSON.parse(strBefore.substring(firstQuote, secondQuote + 1))
                  firstQuote = -1
                } catch(err) {
                }
              } else {
                firstQuote = index
              }
            }
          }  
          if (firstQuote > -1) {
            // selection is in a quoted string
            str = strBefore.substring(0, firstQuote)
            inQuote = true
          } else {
            break
          }
        } else {
          break
        }
      }
      var strToCheck = str.substring(lastPartStartPos)
      var firstQuote = -1, secondQuote= -1
      for(var index = firstQuote + 1; index < strToCheck.length; index++) {
        if(strToCheck[index] == '"') {
          if(firstQuote > -1) {
            secondQuote = index
            try {
              JSON.parse(strToCheck.substring(firstQuote, secondQuote + 1))
              firstQuote = -1
            } catch(err) {
            }
          } else {
            firstQuote = index
          }
        }
      }  
      if (firstQuote > -1) {
        // selection is in a quoted string
        inQuote = true
      }
      return {
        index: lastPartStartPos,
        inQuote: inQuote
      }
    }
    var getLastPartEnd = function(str, pad$) {
      var lastPartEndPos = 0
      var strToCheck = str
      while(true) {
        var lastIndex = strToCheck.regexFirstIndexOf(pad$ ? lastPartPosREPad$ : lastPartPosRE)
        lastPartEndPos += lastIndex
        var strBefore = strToCheck.substring(0, lastIndex)
        if(strBefore.indexOf('"') > -1) {
          var firstQuote = strBefore.indexOf('"'), secondQuote = -1;
          for(var index = firstQuote + 1; index < lastPartEndPos; index++) {
            if(str[index] == '"') {
              if(firstQuote > -1) {
                secondQuote = index
                try {
                  JSON.parse(str.substring(firstQuote, secondQuote + 1))
                  firstQuote = -1
                } catch(err) {
                }
              } else {
                firstQuote = index
              }
            }
          }  
          if (firstQuote > -1) {
            if(str.substring(lastPartEndPos + 1) == '') break
            strToCheck = '"' + str.substring(lastPartEndPos + 1)
          } else {
            break
          }
        } else {
          break
        }
      }
      return lastPartEndPos
    }
    function wrapShortName(shortName) {
      if (shortName.indexOf(" ") > -1) {
        return JSON.stringify(shortName)
      } else {
        return shortName
      }
    }
    var showSuggestions = function(prefix, suffix) {
        var addPrefix = '${'
        var addSuffix = '}'
        if(!suffix) suffix = ""
        prefix = prefix.trimLeft()
        var lastPartPos = getLastPart(prefix, true)
        var lastPart = prefix.substring(lastPartPos.index)
        var suffixPadded = lastPartPos.inQuote ? '"' + suffix : suffix
        if(true && lastPart[0] == '$') lastPart = lastPart.substring(1)
        var lastPartToFilter = lastPart
        var forthDelLength = getLastPartEnd(suffixPadded, true) - (lastPartPos.inQuote? 1: 0)
        if(prefix.substring(prefix.length - lastPart.length - 2, 2) == '${') addPrefix = ''
        if(suffix[forthDelLength] == '}') addSuffix = ''
        var paddingSpace = (suffix && suffix[forthDelLength + 1] == ' ') ? '' : ' '
        var deferred = $q.defer();
        var suggestions = []
        var subjectAttributeGroup = {
          label: "Subject Attributes",
          suggestions: []
        }

        if(defaultSubjectPolicyModels){
          angular.forEach(defaultSubjectPolicyModels, function(subjectComp, index) {
            if(subjectComp.attributes){
              subjectComp.attributes.forEach(function(attr) {
                subjectAttributeGroup.suggestions.push({
                  value: addPrefix + subjectComp.shortName +'.' + wrapShortName(attr.shortName) + addSuffix + paddingSpace,
                  label: attr.shortName,
                  pm: subjectComp.name,
                  backDelete: lastPart.length,
                  forthDelete: forthDelLength
                })
              })
            }
          });
          angular.forEach(defaultSubjectPolicyModels, function(subjectComp, index) {
            if(subjectComp.enrollmentAttributes){
              subjectComp.enrollmentAttributes.forEach(function(attr) {
                subjectAttributeGroup.suggestions.push({
                  value: addPrefix + subjectComp.shortName + '.' + wrapShortName(attr.shortName) + addSuffix + paddingSpace,
                  label: attr.shortName,
                  pm: subjectComp.name,
                  backDelete: lastPart.length,
                  forthDelete: forthDelLength
                })
              })
            }
          });
        }
        
        subjectAttributeGroup.suggestions = $filter('filter')(subjectAttributeGroup.suggestions, lastPartToFilter)
        subjectAttributeGroup.suggestions = $filter('orderBy')(subjectAttributeGroup.suggestions, 'pm');
        if(subjectAttributeGroup.suggestions.length) suggestions.push(subjectAttributeGroup)

        var resourceAttributesGroup = {
          label: "Resource Attributes",
          suggestions: []
        }
        angular.forEach(allResourcePM, function(pm) {
          if(pm.type != "SUBJECT" && ($scope.componentType == 'SUBJECT' || ($scope.component.policyModel && $scope.component.policyModel.id == pm.id))) resourceAttributesGroup.suggestions = resourceAttributesGroup.suggestions.concat(pm.attributes.map(function(attr) {
            return {
              value: addPrefix + 'resource.' + pm.shortName + "." + wrapShortName(attr.shortName) + addSuffix + paddingSpace,
              label: attr.shortName,
              pm: pm.name,
              backDelete: lastPart.length,
              forthDelete: forthDelLength
            }
          }))
        })
        resourceAttributesGroup.suggestions = $filter('filter')(resourceAttributesGroup.suggestions, lastPartToFilter)
        if(resourceAttributesGroup.suggestions.length) suggestions.push(resourceAttributesGroup)
        deferred.resolve(suggestions)
        return deferred.promise;
    }
    $scope.conditionValueSuggestion = {
      showSuggestions : showSuggestions
    }

    $scope.getComponentTags = function(label, filterSelection, callback) {
      tagService.getAllMatchingTags('COMPONENT_TAG', label).then(function(resp) {
        callback(resp)
      })
    }

    $scope.showMemberOrCompInPanel = function (componentMember) {
      if (componentMember.id > -1) {
        if (componentMember.type === "MEMBER") {
          $scope.showMemberInPanel(componentMember);
        } else {
          $scope.showComponentInPanel(componentMember);
        }
      }
    }

    var PAGE_SIZE_MEMBER_PREVIEW = configService.configObject.policyStudio['defaultCompMemberPreviewPageSize'];
    $scope.memberOverview = null;
    $scope.startIndex = 0;
    $scope.showMemberInPanel = function(componentMember) {
      $scope.memberOverview = undefined;
      var member = {
        id : -1,
        name : "",
        type : "",
        domainName: "",
        uniqueName: "",
        isGroup: false,
        members : [],
        searchText : "",
        pageNo : 0,
        pageSize : PAGE_SIZE_MEMBER_PREVIEW
      };
      var type = componentMember.memberType.split('_').join(' ');

      if(type.match(" ")) {
        member.isGroup = true;
      } else {
        member.isGroup = false;
      }

      member.type = type;
      
      member.id = componentMember.id;
      member.name = componentMember.name != null ? componentMember.name : componentMember.uniqueName;
      member.domainName =componentMember.domainName;
      member.uniqueName = componentMember.name != null ? componentMember.uniqueName : null;
      member.searchText = null;
      $scope.memberOverview = member;
      if(member.isGroup){
        componentService.getGroupMembers(member, function(data) {
          $scope.memberOverview = data.data;
          $scope.memberOverview.isGroup = true;
        });
      }
    }

    $scope.previous = function(){
      if(!($scope.startIndex-$scope.memberOverview.pageSize < 0)) {
        $scope.startIndex-=$scope.memberOverview.pageSize;
        --$scope.memberOverview.pageNo;
        componentService.getGroupMembers($scope.memberOverview, function(data) {
          $scope.memberOverview = data.data;
          $scope.memberOverview.isGroup = true;
        });
      }
    }

    $scope.next = function(){
      if(!($scope.startIndex + $scope.memberOverview.pageSize >= $scope.memberOverview.totalMembers)){
        $scope.startIndex+=$scope.memberOverview.pageSize;
        ++$scope.memberOverview.pageNo;
        componentService.getGroupMembers($scope.memberOverview, function(data) {
          $scope.memberOverview = data.data;
          $scope.memberOverview.isGroup = true;
        });
      }
    }

    $scope.filterMembers = function(){
      if($scope.memberOverview.searchText){
        componentService.filterMembers($scope.memberOverview, function(data) {
          $scope.memberOverview = data.data;
          $scope.memberOverview.isGroup = true;
          $scope.memberOverview.searchResult = $scope.memberOverview.members.length !== 0 ? $filter('translate')('component.member.preview.find.searchResult',
            { count: $scope.memberOverview.members.length, searchText: $scope.memberOverview.searchText }) :
            $filter('translate')('component.member.preview.find.searchResult.no.data',
              { searchText: $scope.memberOverview.searchText });
        });
      }
    }

    $scope.clearSearchResultsForMember = function(){
      $scope.memberOverview.searchText = "";
      $scope.memberOverview.searchResult = "";
      $scope.startIndex = 0;
      $scope.memberOverview.pageSize = PAGE_SIZE_MEMBER_PREVIEW;
      $scope.memberOverview.pageNo = 0;
      componentService.getGroupMembers($scope.memberOverview, function(data) {
        $scope.memberOverview = data.data;
        $scope.memberOverview.isGroup = true;
      }); 
      return false;
    }

     $scope.closeMemberInPanel = function() {
       $scope.memberOverview = undefined;
       $scope.startIndex = 0;
     }

     $scope.componentOverview = null;

     $scope.showComponentInPanel = function(component) {
      if ($scope.userAccessMap && !$scope.userAccessMap['VIEW_COMPONENT']) {
        return;
      }
      $scope.componentOverview = undefined;
      $scope.closeMemberInPanel();
      componentService.getComponentById(component.id, function(data) {
        $scope.componentOverview = data.data;
        if($scope.componentOverview.policyModel.id) {
          var updatePM = function(policyModel) {
            if (policyModel) {
              $scope.componentOverview.policyModel.name = policyModel.name
              angular.forEach($scope.componentOverview.conditions, function(con) {
                angular.forEach(policyModel.attributes, function(attr) {
                  if (attr.shortName.toLowerCase() == con.attribute.toLowerCase()) {
                    con.attributeObj = attr;
                    angular.forEach(attr.operatorConfigs, function(operator) {
                      if (operator.key == con.operator) {
                        con.operatorObj = operator;
                      }
                    })
                  }
                });
              });
            }
          }
          if(!allResourcePM[$scope.componentOverview.policyModel.id]) {
            resourceService.getResourceLite($scope.componentOverview.policyModel.id, function(response) {
              updatePM(response.data)
            })
          } else updatePM(allResourcePM[$scope.componentOverview.policyModel.id])
        }
        autoCloseOptionService.registerOpen($scope, $scope.closeComponentInPanel);
      })
    }
    $scope.closeComponentInPanel = function() {
      $scope.componentOverview = undefined;
    }

    $scope.findMembers = function (value, filterSelection, callback) {
      let applicableMemberOptions = [];
      if (filterSelection.indexOf('COMPONENT') !== -1) {
        $scope.subComponentOptions.forEach(function (componentOption) {
          componentOption.typeId = 'COMPONENT_' + componentOption.id;
          applicableMemberOptions.push(componentOption);
        });
      }
      let filterSelectionWithoutComponent = filterSelection.filter(function (selection) {
        return selection != 'COMPONENT';
      });
      if (filterSelectionWithoutComponent.length > 0) {
        componentService.findMembers(filterSelectionWithoutComponent, value, function (data) {
          if (data && data.data) {
            data.data.forEach(function (memberOption) {
              if (memberOption.memberType && filterSelection.indexOf(memberOption.memberType) !== -1) {
                memberOption.typeId = memberOption.memberType + "_" + memberOption.id;
                applicableMemberOptions.push(memberOption);
              }
            });
          }
        });
      }
      callback && callback({ data: applicableMemberOptions });
    };
  }
]);