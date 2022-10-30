delegationApp.controller('createDelegationPolicyController',
  ['$scope', 'dialogService', 'networkService', 'configService', 'loggerService', '$location', '$anchorScroll', '$state',
    '$stateParams', '$rootScope', '$filter', 'delegationService', '$q', '$window', 'userManualTranslateService', 'userService', '$timeout', 'tagService', 
    'folderService',
    function ($scope, dialogService, networkService, configService, loggerService, $location, $anchorScroll, $state, $stateParams, $rootScope,
      $filter, delegationService, $q, $window, userManualTranslateService, userService, $timeout, tagService, folderService) {
      var logger = loggerService.getLogger();
      $scope.isEditMode = false;
      $stateParams.delegationId && ($scope.isEditMode = true);
      userService.goBackIfAccessDenied('MANAGE_DELEGATION_POLICIES');
      $scope.userAccessMap = null;
      userService.getUserAccessMap(function (userAccessMap) {
        $scope.userAccessMap = userAccessMap;
      })
      $scope.$parent.$parent.isCreatePage = true;
      $scope.delegationForm = {
        val: null
      }
      $scope.attributes = [{
        attr: "In",
        value: "IN"
      }, {
        attr: "Not In",
        value: "NOT"
      }];
      $scope.tabs = {
        activeTab: 0,
        hasError: false,
        hasTagError: false,
        hasFolderError: false,
        previousTab: -1
      };
      $scope.actionNotification = {
        show: false,
        message: ""
      }
      $scope.multivalNotification = {
        show: false,
        message: ""
      }
      var getDelegationPolicyTags = function (label, filterSelection, callback) {
        tagService.getAllMatchingTags('POLICY_TAG', label).then(function (resp) {
          callback(resp)
        })
      }

      var getDelegationComponentTags = function (label, filterSelection, callback) {
        tagService.getAllMatchingTags('COMPONENT_TAG', label).then(function (resp) {
          callback(resp)
        })
      }

      var getDelegationPolicyModelTags = function (label, filterSelection, callback) {
        tagService.getAllMatchingTags('POLICY_MODEL_TAG', label).then(function (resp) {
          callback(resp)
        })
      }

      var addPolicyTag = function (tag, callback) {
        delegationService.addTag(tag, 'POLICY_TAG', function (data) {
          var tagId = data.data;
          delegationService.getTagById(tagId, function (data) {
            updateUIForNewTag('PS_POLICY', 0, data)
            updateNewUIForNewTag(1, 0, data)
            callback && callback(data.data);
          });
        })
      }

      var addComponentTag = function (tag, callback) {
        delegationService.addTag(tag, 'COMPONENT_TAG', function (data) {
          var tagId = data.data;
          delegationService.getTagById(tagId, function (data) {
            updateUIForNewTag('PS_COMPONENT', 1, data)
            updateNewUIForNewTag(2, 0, data)
            callback && callback(data.data);
          });
        })
      }

      var addPolicyModelTag = function (tag, callback) {
        delegationService.addTag(tag, 'POLICY_MODEL_TAG', function (data) {
          var tagId = data.data;
          delegationService.getTagById(tagId, function (data) {
            updateUIForNewTag('PS_POLICY_MODEL', 2, data);
            updateNewUIForNewTag(3, 0, data)
            callback && callback(data.data);
          });
        })
      }

      $scope.tabConfig = [
        {
          tabIndex: 0,
          tabName: 'Folder',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        },
        {
          tabIndex: 1,
          tabName: 'Policy',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "Policy Tags",
          tagsUrl: 'policysearch.tags',
          addTagFunction: addPolicyTag,
          getDelegationTags: getDelegationPolicyTags,
          createTagPermissionKey: 'CREATE_POLICY_TAG',
          tagsConfig: [
            {
              condition: $scope.attributes[0],
              tags: [],
              selectedTags: []
            }
          ],
          foldersConfig: [{
            condition: $scope.attributes[0],
            folders: [],
            selectedFolders: []
          }]
        },
        {
          tabIndex: 2,
          tabName: 'Component',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "Component Tags",
          tagsUrl: 'componentsearch.tags',
          addTagFunction: addComponentTag,
          getDelegationTags: getDelegationComponentTags,
          createTagPermissionKey: 'CREATE_COMPONENT_TAG',
          tagsConfig: [
            {
              condition: $scope.attributes[0],
              tags: [],
              selectedTags: []
            }
          ],
          foldersConfig: [{
            condition: $scope.attributes[0],
            folders: [],
            selectedFolders: []
          }]
        },
        {
          tabIndex: 3,
          tabName: 'Component Type',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "Component Type Tags",
          tagsUrl: 'resourcesearch.tags',
          addTagFunction: addPolicyModelTag,
          getDelegationTags: getDelegationPolicyModelTags,
          createTagPermissionKey: 'CREATE_POLICY_MODEL_TAG',
          tagsConfig: [
            {
              condition: $scope.attributes[0],
              tags: [],
              selectedTags: []
            }
          ],
          foldersConfig: []
        },
        {
          tabIndex: 4,
          tabName: 'Reports',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        },
        {
          tabIndex: 5,
          tabName: 'Administrator',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        },
        {
          tabIndex: 6,
          tabName: 'Tools',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        },
        {
          tabIndex: 7,
          tabName: 'Tag',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        },
        {
          tabIndex: 8,
          tabName: 'Configuration',
          policyModels: [],
          resourceComponents: [],
          actionComponents: [],
          allActionsSelected: false,
          tagsLabel: "",
          tagsConfig: []
        }
      ]

      var currentTarget = 'ruleinfo';
      $scope.scrollTo = function (target) {
        $anchorScroll(target);
        currentTarget = target;
      }

      $scope.isActive = function (newTarget) {
        return currentTarget == newTarget;
      }

      $scope.highlightGrammar = function (target) {
        currentTarget = target;
      }

      $scope.resourceOptions = [];
      $scope.actionOptions = [];
      $scope.policyFolderOptions = [];
      $scope.compFolderOptions = [];

      $scope.delegation = {
        user_conditions: [],
        user_names: [],
        resources: [],
        actions: [],
        allow: true,
        subjectComponent: null,
        version: null
      }

      var actionObligationParamsMap = {
        "POLICY_ACCESS_TAGS": {
          "INSERT_TAG_FILTERS": "Create Policy",
          "DELETE_TAG_FILTERS": "Delete Policy",
          "VIEW_TAG_FILTERS": "View Policy",
          "EDIT_TAG_FILTERS": "Edit Policy",
          "DEPLOY_TAG_FILTERS": "Deploy Policy",
          "MOVE_TAG_FILTERS": "Move Policy"
        },
        "COMPONENT_ACCESS_TAGS": {
          "INSERT_TAG_FILTERS": "Create Component",
          "DELETE_TAG_FILTERS": "Delete Component",
          "VIEW_TAG_FILTERS": "View Component",
          "EDIT_TAG_FILTERS": "Edit Component",
          "DEPLOY_TAG_FILTERS": "Deploy Component",
          "MOVE_TAG_FILTERS": "Move Component"
        },
        "POLICY_MODEL_ACCESS_TAGS": {
          "INSERT_TAG_FILTERS": "Create Policy Model",
          "DELETE_TAG_FILTERS": "Delete Policy Model",
          "VIEW_TAG_FILTERS": "View Policy Model",
          "EDIT_TAG_FILTERS": "Edit Policy Model",
          "DEPLOY_TAG_FILTERS": "Deploy Policy Model"
        },
        "POLICY_FOLDER_ACCESS_TAGS": {
          "INSERT_TAG_FILTERS": "Create Policy Folder/Sub-folders",
          "DELETE_TAG_FILTERS": "Delete Policy Folder",
          "VIEW_TAG_FILTERS": "View Policy Folder",
          "EDIT_TAG_FILTERS": "Rename Policy Folder",
          "MOVE_TAG_FILTERS": "Move Policy Folder"
        },
        "COMPONENT_FOLDER_ACCESS_TAGS": {
          "INSERT_TAG_FILTERS": "Create Component Folder/Sub-folders",
          "DELETE_TAG_FILTERS": "Delete Component Folder",
          "VIEW_TAG_FILTERS": "View Component Folder",
          "EDIT_TAG_FILTERS": "Rename Component Folder",
          "MOVE_TAG_FILTERS": "Move Component Folder"
        }
      };

      var resourceImplictActions = {
        "Policy Studio - Policy Model": ["View Policy Model"],
        "Policy Studio - Policy": ["View Policy"],
        "Policy Studio - Component": ["View Component"],
        "Delegated Administration": ["View Delegated Administration"],
        "Reporter": ["View Reporter"],
        "Monitor": ["View Monitor"],
        "Administrator": ["View Administrator"],
        "Policy Folder": ["View Policy Folder"],
        "Component Folder": ["View Component Folder"]
      }

      var policyModelRequiredComponentNames = ["Policy Folder", "Component Folder", "Policy Studio - Policy Model", "Policy Studio - Policy", "Policy Workflow", "Policy Studio - Component"]

      var dependentActionsMap = {}
      angular.forEach(implicitActionsMap, function (implicitActions, dependentActionName) {
        angular.forEach(implicitActions, function (implicitAction) {
          if (implicitAction.mandatory) {
            var dependentActions = dependentActionsMap[implicitAction.name]
            if (!dependentActions) {
              dependentActions = []
              dependentActionsMap[implicitAction.name] = dependentActions
            }
            dependentActions.push(dependentActionName)
          }
        })
      })

      var isDependentActionsFound = function (actionName, ignoreActions) {
        ignoreActions = ignoreActions || []
        var selectedActionNames = $scope.actionOptions.filter(function (action) {
          return action.checked
        }).map(function (action) {
          return action.name
        })
        var dependentActions = dependentActionsMap[actionName]
        if (dependentActions) {
          for (var i = dependentActions.length - 1; i >= 0; i--) {
            var dependentAction = dependentActions[i]
            if (selectedActionNames.indexOf(dependentAction) > -1 && ignoreActions.indexOf(dependentAction) == -1) {
              return true
            }
          }
        }
        return false
      }

      var isOptionalActionSelectionValid = function () {
        return !$scope.actionOptions.some(function (action) {
          if (action.checked) {
            var iActions = implicitActionsMap[action.name]
            if (iActions) {
              var orActionNames = iActions.filter(function (iAction) {
                return iAction.or
              }).map(function (orAction) {
                return orAction.name
              })
              if (orActionNames.length > 0) {
                var orActionsNotSelected = $scope.actionOptions.filter(function (otherAction) {
                  return orActionNames.indexOf(otherAction.name) > -1
                }).every(function (orAction) {
                  return !orAction.checked
                })
                if (orActionsNotSelected) {
                  orActionNames = orActionNames.map(function (orActionName) { return "\"" + orActionName + "\"" })
                  dialogService.notify({
                    msg: $filter('translate')('delegation.create.validation.invalid.or.actions')
                      .replace("{0}", orActionNames.slice(0, -1).join(', '))
                      .replace("{1}", orActionNames.length > 1 ? orActionNames[orActionNames.length - 1] : "")
                      .replace("{2}", "\"" + action.name + "\"")
                  })
                }
                return orActionsNotSelected
              }
              return false
            }
            return false
          }
          return false
        })
      }

      var fetchPolicyModel = function (policyModelId, callback, obj) {
        delegationService.getDelegationModel(policyModelId, function (delegationModel) {
          if (delegationModel.data) {
            if (delegationModel && delegationModel.data && delegationModel.data.obligations)
              callback && callback(delegationModel.data, obj);
          }
        });
      }

      $scope.selectAction = function (resourceComponent, actionComponent, add) {
        if (!resourceComponent.policyModel && policyModelRequiredComponentNames.indexOf(resourceComponent.name) > -1) {
          fetchPolicyModel(resourceComponent.data.policy_model_id, function (resp) {
            resourceComponent.policyModel = resp
          })
        }
        if (add) {
          resourceComponent.selectedActions = resourceComponent.selectedActions || []
          if ($scope.delegation.resources.every(function (resource) { return resource.id != resourceComponent.id })) {
            $scope.delegation.resources.push(resourceComponent)
          }
          if (resourceComponent.selectedActions.every(function (selectedAction) { return selectedAction.id != actionComponent.id })) {
            resourceComponent.selectedActions.push(actionComponent)
            $scope.delegation.actions.push(actionComponent)
          }
        } else {
          if (resourceComponent.selectedActions) {
            for (var i = resourceComponent.selectedActions.length - 1; i >= 0; i--) {
              var selectedAction = resourceComponent.selectedActions[i]
              if (selectedAction.id == actionComponent.id) {
                resourceComponent.selectedActions.splice(i, 1)
                break
              }
            }
          }
          if ($scope.delegation.actions) {
            for (var j = $scope.delegation.actions.length - 1; j >= 0; j--) {
              var action = $scope.delegation.actions[j]
              if (action.id == actionComponent.id) {
                $scope.delegation.actions.splice(j, 1)
                break
              }
            }
          }
          if (resourceComponent.selectedActions && resourceComponent.selectedActions.length === 0 && $scope.delegation.resources) {
            for (var k = $scope.delegation.resources.length - 1; k >= 0; k--) {
              var resource = $scope.delegation.resources[k]
              if (resource.id == resourceComponent.id) {
                $scope.delegation.resources.splice(k, 1)
                break
              }
            }
          }
        }
      }

      $scope.selectActionByName = function (actionName, add) {
        for (var i = $scope.tabConfig.length - 1; i >= 0; i--) {
          var resourceComponents = $scope.tabConfig[i].resourceComponents
          if (resourceComponents) {
            for (var j = resourceComponents.length - 1; j >= 0; j--) {
              var actionComponents = resourceComponents[j].actionComponents
              if (actionComponents) {
                for (var k = actionComponents.length - 1; k >= 0; k--) {
                  var actionComponent = actionComponents[k]
                  if (actionComponent.name == actionName) {
                    $scope.selectAction(resourceComponents[j], actionComponent, add)
                    return
                  }
                }
              }
            }
          }
        }
      }

      var checkForSelectAllActions = function (resComp) {
        if (resComp && resComp.actionComponents && resComp.actionComponents.length) {
          for (var i = 0; i < resComp.actionComponents.length; i++) {
            if (!resComp.actionComponents[i].checked) {
              return;
            }
          }
          resComp.allActionsSelected = true;
        }
      }

      $scope.onCheckAction = function (resComp, actionComp, add) {
        if (!add) {
          resComp.allActionsSelected = false;
        }
        $scope.selectAction(resComp, actionComp, add)
        var iActionList = implicitActionsMap[actionComp.name]
        actionComp.manual = add
        if (iActionList && !actionComp.implicit) {
          var iActionsMap = iActionList.reduce(function (map, action) {
            map[action.name] = action
            return map
          }, {})
          $scope.actionOptions.filter(function (action) {
            return iActionList.filter(function (iAction) { return iAction.name == action.name }).length > 0
          }).forEach(function (action) {
            if (add) {
              action.checked = true
              action.disabled = action.disabled ? action.disabled : iActionsMap[action.name].mandatory
              action.implicit = true
              $scope.selectActionByName(action.name, true)
            } else {
              if (!isDependentActionsFound(action.name, iActionList.map(function (action) { return action.name }))) {
                action.disabled = false
                if (!action.manual) {
                  action.checked = false
                  $scope.selectActionByName(action.name, false)
                }
                action.implicit = false
              }
            }
          })
        }
        if (add) {
          // skip redundant check when user clicks on select all
          if (!resComp.allActionsSelected) {
            checkForSelectAllActions(resComp);
          }
          $scope.actionNotification.message = $filter('translate')('delegation.create.action.change.notification');
          $scope.actionNotification.show = true
          $timeout(function () {
            $scope.actionNotification.show = false
            $scope.actionNotification.message = ''
          }, 20000)
        }
      }

      $scope.notifyMultival = function (condition) {
        if(condition != null
            && condition.attribute.dataType == 'MULTIVAL') {
              $scope.multivalNotification.message = $filter('translate')('delegation.create.multival.attribute.change.notification');
              $scope.multivalNotification.show = true
              $timeout(function () {
                $scope.multivalNotification.show = false
                $scope.multivalNotification.message = ''
              }, 20000)
            }
      };

      $scope.onCheckActionAll = function (resComp) {
        if (!resComp.policyModel && policyModelRequiredComponentNames.indexOf(resComp.name) > -1) {
          fetchPolicyModel(resComp.data.policy_model_id, function (resp) {
            resComp.policyModel = resp
            $scope.checkAllActions(resComp);
          })
        } else {
          $scope.checkAllActions(resComp);
        }
      }

      $scope.checkAllActions = function (resComp) {
        angular.forEach(resComp.actionComponents, function (actionComp) {
          if(!actionComp.disabled) {
            actionComp.checked = resComp.allActionsSelected;
            $scope.onCheckAction(resComp, actionComp, actionComp.checked);
          }
        });
      }

      $scope.editDelegation = function (delegation) {
        $state.go('Delegations.edit', {
          delegationId: delegation.id
        });
      };
      var buttonListForBackToList = [{
        label: $filter('translate')('BACK TO DELEGATION LIST'),
        class: 'cc-btn-discard',
        onClick: function (callback) {
          $scope.delegationForm.val.$setPristine();
          $state.go('Delegations.list');
          callback && callback();
        }
      }, {
        label: $filter('translate')('STAY ON THIS PAGE'),
        class: 'cc-btn-primary',
        onClick: function (callback) {
          callback && callback();
        }
      }];
      var buttonListForDiscarding = [{
        label: $filter('translate')('RESET'),
        class: 'cc-btn-discard',
        onClick: function (callback) {
          $state.reload();
          callback && callback();
        }
      }, {
        label: $filter('translate')('CANCEL'),
        class: 'cc-btn-primary',
        onClick: function (callback) {
          callback && callback();
        }
      }];
      var prepareRequestPayload = function () {
        var payload = {};
        payload.id = $scope.delegation.id;
        payload.name = $scope.delegation.name;
        payload.description = $scope.delegation.description;
        payload.status = 'DRAFT';
        payload.effectType = $scope.delegation.allow ? 'allow' : 'deny';
        payload.subjectComponent = {};
        payload.version = $scope.delegation.version;
        $scope.delegation.subjectComponent && (payload.subjectComponent.id = $scope.delegation.subjectComponent.id);
        payload.subjectComponent.conditions = $scope.delegation.user_conditions.map(function (condition) {
          return {
            attribute: condition.attribute.name,
            operator: condition.operator.key,
            value: condition.value
          }
        });
        var actions = [];
        var resources = [];
        payload.obligations = [];
        for (var i = 0; i < $scope.tabConfig.length; i++) {
          var tab = $scope.tabConfig[i];
          for (j = 0; j < tab.resourceComponents.length; j++) {
            var resCom = tab.resourceComponents[j];
            var isResourceAdded = false; // flag to track only 1 resource per action comp
            var isObligationAdded = false; // flag to track only 1 obligation per resource comp
            if(!resCom.actionComponents) {
              continue;
            }
            for (var k = 0; k < resCom.actionComponents.length; k++) {
              var aCom = resCom.actionComponents[k];
              var selectedActions = resCom.selectedActions && resCom.selectedActions.map(function (a) {
                return a.name;
              })
              if (aCom.checked) {
                actions.push(aCom);
                if (!isResourceAdded) {
                  resources.push(resCom);
                  isResourceAdded = true;
                }

                // add obligation
                if (tab.tabIndex < 4 && !isObligationAdded) {
                  var policyModel = resCom.policyModel;
                  if (!policyModel) {
                    policyModel = { obligations: [] }
                  }
                  let isFolderAdded = false;
                  angular.forEach(policyModel.obligations, function (o) {
                    var obligation = {};
                    obligation.name = o.shortName;
                    obligation.policyModelId = policyModel.id;
                    obligation.params = {};
                    angular.forEach(o.parameters, function (param) {
                      var p = {};
                      var tagFilters = tab.tagsConfig.map(function (tagsObj) {
                        if (!tagsObj.selectedTags.length) {
                          return {
                            operator: tagsObj.condition.value,
                            tags: [{
                              id: null,
                              key: "all_tags",
                              label: "All Tags"
                            }]
                          }

                        } else {
                          return {
                            operator: tagsObj.condition.value,
                            tags: tagsObj.selectedTags.map(function (tags) {
                              return {
                                id: tags.id,
                                key: tags.key,
                                label: tags.label
                              }
                            })
                          }
                        }
                      });
                      let tabObj = tab.tabIndex === 0 ? tab.resourceComponents[j] : tab
                      let folderFilters = tabObj.foldersConfig.map(function (foldersObj) {
                        if (!foldersObj.selectedFolders.length) {
                          return {
                            operator: foldersObj.condition.value,
                            tags: [{
                              id: null,
                              key: "all_folders",
                              label: "All Folders",
                              type: "FOLDER_TAG"
                            }]
                          }

                        } else {
                          return {
                            operator: foldersObj.condition.value,
                            tags: foldersObj.selectedFolders.map(function (folders) {
                              return {
                                id: null,
                                key: folders.includeSubFolders ? folders.id + "/**" : folders.id,
                                label: folders.includeSubFolders ? folders.id + "/**" : folders.id,
                                type: "FOLDER_TAG"
                              }
                            })
                          }
                        }
                      });
                      tagFilters = tagFilters.concat(folderFilters);
                      isFolderAdded = true;

                      var tags = { tagsFilters: [] };
                      if (aCom.checked) {
                        if (selectedActions && selectedActions.indexOf(actionObligationParamsMap[o.shortName][param.shortName]) > -1) {
                          tags.tagsFilters = tagFilters;
                        } else {
                          tags.tagsFilters = [{
                            "operator": "IN",
                            "tags": []
                          }]
                        }
                      } else {
                        tags.tagsFilters = [{
                          "operator": "IN",
                          "tags": []
                        }]
                      }
                      obligation.params[param.shortName] = JSON.stringify(tags);
                    });
                    payload.obligations.push(obligation);
                    isObligationAdded = true;
                  })
                }
              }
            }
          }
        }
        payload.resourceComponents = [{
          operator: 'IN',
          components: resources.map(function (res) {
            return {
              id: res.id
            }
          })
        }]
        payload.actionComponents = [{
          operator: 'IN',
          components: actions.map(function (act) {
            return {
              id: act.id
            }
          })
        }]
        return payload;
      }

      $scope.saveDelegation = function () {
        var frm = $scope.delegationForm.val;
        if (frm.$invalid) {
          frm.$setDirty();
          for (var field in frm) {
            if (field[0] == '$') continue;
            logger.log(field);
            frm[field].$touched = true;
          }
          $scope.$broadcast('scrollto');
          return;
        }
        if (hasTabError($scope.tabs.activeTab)) {
          $scope.tabs.hasError = true;
          $scope.scrollTo('rules');
          return;
        } else {
          $scope.tabs.hasError = false;
          $scope.tabs.hasTagError = false;
          $scope.tabs.hasFolderError = false;
          setFolderError(false);
        }
        if (!isOptionalActionSelectionValid()) {
          return
        }
        var payload = prepareRequestPayload();
        var action = $scope.isEditMode ? delegationService.modifyDelegation : delegationService.adddElegation;
        action(payload, function (response) {
          frm.$setPristine();
          $scope.delegation.id = response.data;
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')($scope.isEditMode ? 'delegation.create.modified.confirm' : 'delegation.create.added.confirm'),
            backLink: 'Delegations.list',
            backLabel: $filter('translate')('BACK TO DELEGATION LIST')
          });
          $scope.isEditMode ? $state.reload() : $scope.editDelegation($scope.delegation)
        })
      }
      $scope.discardDelegation = function () {
        if ($scope.delegationForm.val.$pristine) {
          $state.reload();
        } else {
          dialogService.confirm({
            msg: $filter('translate')('delegation.create.reset.confirm'),
            buttonList: buttonListForDiscarding
          });
        }
      };
      $scope.backToDelegationList = function () {
        if ($scope.delegationForm.val.$pristine) {
          $state.go('Delegations.list');
        } else {
          dialogService.confirm({
            msg: $filter('translate')('delegation.create.discard.confirm'),
            buttonList: buttonListForBackToList
          });
        }
      };
      $scope.addUserAttrCondition = function (key) {
        var c = {};
        c.$$hashKey = key;
        $scope.delegation.user_conditions.push(c);
        $scope.editItem = c;
        $scope.editItem.isEdit = false;
        $scope.conditionTable.notify = false;
      }
      $scope.removeAttrCondition = function (index, fromViewTable) {

        if (fromViewTable) {
          $scope.delegation.user_conditions.splice(index, 1);
          $scope.conditionTable.notify = false;
          return;
        }
        var errorList = [];
        if (!$scope.editItem.isEdit) {
          $scope.delegation.user_conditions.splice(index, 1);

        } else {
          errorList = validateConditionTable();
        }

        if (!errorList.length) {
          $scope.conditionTable.dirty = false;
          $scope.conditionTable.notify = false;
          $scope.editItem = {};
        } else {
          $scope.conditionTable.error = true;
          $scope.conditionTable.success = false;
          $scope.conditionTable.notify = true;
          $scope.conditionTable.message = errorList.join(', ');
        }
      }
      $scope.removeFrom = function (array, index) {
        array.splice(index, 1);
      }
      $scope.userConditionsOptions = [];
      var setDelegationPromiseList = [];
      setDelegationPromiseList.push(delegationService.getDelegationSubject(function (response) {
        var subject = response.data && response.data[0];
        angular.forEach(subject.attributes, function (attr, index) {
          var attrItem = {};
          $scope.userConditionsOptions.push(attrItem);
          attrItem.name = attr.name;
          attrItem.operator = [];
          attrItem.dataType = attr.dataType;
          attrItem.$$hashKey = 'attr:' + (1000 * (index + 1));
          angular.forEach($filter('orderBy')(attr.operatorConfigs, 'label'), function (operatorConfig, attrIndex) {
            var operator = {
              label: operatorConfig.label,
              key: operatorConfig.key,
            }
            operator.$$hashKey = 'operator:' + (1000000 * (index + 1) + attrIndex + 1);
            attrItem.operator.push(operator)
          })
        });
      }));

      setDelegationPromiseList.push(folderService.getFolders("POLICY", function (response) {
        $scope.policyFolderOptions = response;
      }));

      setDelegationPromiseList.push(folderService.getFolders("COMPONENT", function (response) {
        $scope.compFolderOptions = response;
      }));

      setDelegationPromiseList.push(delegationService.listAllDelegationResources(function (response) {
        $scope.resourceOptions = response.data;
      }));

      setDelegationPromiseList.push(delegationService.listAllDelegationActions(function (response) {
        $scope.actionOptions = response.data;
      }));

      $scope.policyFolderMap = {};
      $scope.compFolderMap = {};

      var createFoldersMap = function(foldersList, type) {
        var stack = [];
        angular.forEach(foldersList, function (rootFolder) {
          stack.push(rootFolder);
          while (stack.length !== 0) {
            var folder = stack.pop();
            if (folder.children.length === 0) {
              visitFolderNode(folder, type);
            } else {
              visitFolderNode(folder, type);
              for (var i = folder.children.length - 1; i >= 0; i--) {
                stack.push(folder.children[i]);
              }
            }
          }
        });
      }

      var visitFolderNode = function(node, type) {
          if(type === "POLICY") {
            $scope.policyFolderMap[node.id] = node;
          } else {
            $scope.compFolderMap[node.id] = node;
          }
      }

      $q.all(setDelegationPromiseList).
        then(function () {
          angular.forEach($scope.resourceOptions, function (resOpt) {
            addComponentsToTabsConfig(resOpt, 'RESOURCE');
          });
          angular.forEach($scope.actionOptions, function (actOpt) {
            actOpt.name = ((actOpt.name.indexOf('Create') !== -1) && actOpt.name.indexOf('Folder') !== -1) ? actOpt.name + "/Sub-folders" : actOpt.name;
            addComponentsToTabsConfig(actOpt, 'ACTION');
          });
          createFoldersMap($scope.policyFolderOptions, "POLICY");
          createFoldersMap($scope.compFolderOptions, "COMPONENT");
        });
      var delegationModels = [];
      $scope.obligationList = [];

      var getTagUrl = function (shortName) {
        var tagsUrl = '';
        switch (shortName.toUpperCase()) {
          case 'PS_POLICY':
            tagsUrl = 'policysearch.tags';
            break;
          case 'PS_COMPONENT':
            tagsUrl = 'componentsearch.tags';
            break;
          case 'PS_POLICY_MODEL':
            tagsUrl = 'resourcesearch.tags';
            break;
        }
        return tagsUrl;
      }
      var getAddTagFunction = function (shortName) {
        var tagFunction = '';
        switch (shortName.toUpperCase()) {
          case 'PS_POLICY':
            tagFunction = 'addPolicyTag';
            break;
          case 'PS_COMPONENT':
            tagFunction = 'addComponentTag';
            break;
          case 'PS_POLICY_MODEL':
            tagFunction = 'addPolicyModelTag';
            break;
        }
        return tagFunction;
      }
      var updateUIForNewTag = function (policyModelShortName, index, tag) {
        angular.forEach($scope.obligationList, function (obligation) {
          if (obligation.modelShortName.toUpperCase() === policyModelShortName) {
            obligation.operationList[index] && tag && tag.data && obligation.operationList[index].selectedTags.push(tag.data);
          }
        })
      }
      var updateNewUIForNewTag = function (tabIndex, index, tag) {
        var tab = $scope.tabConfig[tabIndex];
        tab && tab.tagsConfig && tab.tagsConfig[index] && tag && tag.data && tab.tagsConfig[index].selectedTags.push(tag.data);

      }


      $scope.addOperation = function (obligation, parameter) {
        parameter.operationList.push({
          tags: [],
          condition: $scope.attributes[0],
          tagsUrl: getTagUrl(obligation.modelShortName),
          selectedTags: [],
          addTagFunction: getAddTagFunction(obligation.modelShortName)
        });

      }
      $scope.addTagCondition = function (tagList) {
        tagList.push({
          condition: $scope.attributes[0],
          tags: [],
          selectedTags: []
        });
      }
      $scope.removeCondition = function (obligation, index) {
        obligation.operationList.splice(index, 1);
      }
      $scope.removeTagCondition = function (tagList, index) {
        tagList && tagList.splice(index, 1);
      }

      $scope.addFolderCondition = function (tab, type) {
        if (type.indexOf('Policy') > -1) {
          tab.foldersConfig.push({
            condition: $scope.attributes[0],
            folders: JSON.parse(JSON.stringify($scope.policyFolderOptions)),
            selectedFolders: []
          });
        } else {
          tab.foldersConfig.push({
            condition: $scope.attributes[0],
            folders: JSON.parse(JSON.stringify($scope.compFolderOptions)),
            selectedFolders: []
          });
        }
      }

      $scope.removeFolderCondition = function (folderList, index) {
        folderList && folderList.splice(index, 1);
      }

      $scope.showResourceComponents = function (resComp) {
        return resComp.actionComponents && resComp.actionComponents.length && !($scope.installMode == 'SAAS' && resComp.name == 'Server & Enforcer');
      }

      var addComponentsToTabsConfig = function (comp, type) {
        if (type == 'RESOURCE') {
          var tabIndex = -1;
          var folders = [];
          switch (comp.name) {
            case 'Policy Folder':
              comp.foldersConfig = [{
                condition: $scope.attributes[0],
                folders: JSON.parse(JSON.stringify($scope.policyFolderOptions)),
                selectedFolders: []
              }];
              comp.hasFolderError = false;
              tabIndex = 0;
              break;
            case 'Component Folder':
              comp.foldersConfig = [{
                condition: $scope.attributes[0],
                folders: JSON.parse(JSON.stringify($scope.compFolderOptions)),
                selectedFolders: []
              }];
              comp.hasFolderError = false;
              tabIndex = 0;
              break;
            case 'Policy Studio - Policy':
            case 'Policy Workflow':
            case 'XACML Policy':
              folders = $scope.policyFolderOptions;
              tabIndex = 1;
              break;
            case 'Policy Studio - Component':
              folders = $scope.compFolderOptions;
              tabIndex = 2;
              break;
            case 'Policy Studio - Policy Model':
              tabIndex = 3;
              break;
            case 'Reporter':
            case 'Reports':
              tabIndex = 4;
              break;
            case 'Administrator':
            case 'Delegated Administration':
            case 'Server & Enforcer':
            case 'ICENet Management':
            case 'Policy Controller Management':
            case 'Monitor':
              tabIndex = 5;
              break;
            case 'Policy Validator':
            case 'Enrollment Management':
            case 'Certificate Management':
            case 'PDP Plugin Management':
              tabIndex = 6;
              break;
            case 'Tag Management':
              tabIndex = 7;
              break;
            case 'System Configuration':
            case 'Server Log Configuration':
            case 'Environment Configuration':
              tabIndex = 8;
              break;
          }
          if (tabIndex === -1) return;
          $scope.tabConfig[tabIndex].resourceComponents.push(comp);
          if (folders.length > 0) {
            $scope.tabConfig[tabIndex].foldersConfig[0].folders = JSON.parse(JSON.stringify(folders));
          }
        } else {
          var actionIds = $scope.delegation.actions.map(function (a) {
            return a.id;
          })
          var resIds = $scope.delegation.resources.map(function (a) {
            return a.id;
          })
          for (var i = 0; i < $scope.tabConfig.length; i++) {
            var tab = $scope.tabConfig[i];
            for (var j = 0; j < tab.resourceComponents.length; j++) {
              var r = tab.resourceComponents[j];
              if (r.data.policy_model_id == comp.data.policy_model_id) {
                if (!r.actionComponents) {
                  r.actionComponents = [];
                }
                r.actionComponents.push(comp);
                if (comp.checked) {
                  if (!r.selectedActions) {
                    r.selectedActions = [];
                  }
                  r.selectedActions.push(comp);
                  if (actionIds.indexOf(comp.id) === -1)
                    $scope.delegation.actions.push(comp);
                  if (resIds.indexOf(r.id) === -1)
                    $scope.delegation.resources.push(r);
                }
                return
              }
            }
          }
        }
      }

      var setDelegation = function (response) {
        if (!response.data) {
          dialogService.notify({
            msg: $filter('translate')('delegation.create.unavailable'),
            ok: function () {
              $window.history.back();
            }
          })
          return;
        }
        $q.all(setDelegationPromiseList).
          then(function () {
            var payload = response.data;
            $scope.delegation.id = payload.id;
            $state.current.pageTitle = $scope.delegation.name = payload.name;
            $scope.delegation.description = payload.description;
            $scope.delegation.subjectComponent = payload.subjectComponent;
            $scope.delegation.allow = payload.effectType == 'allow';
            $scope.delegation.user_conditions = [];
            $scope.delegation.version = payload.version;
            angular.forEach(payload.subjectComponent.conditions, function (condition) {
              var con = {};
              $scope.delegation.user_conditions.push(con);
              angular.forEach($scope.userConditionsOptions, function (conditionOpt) {
                if (conditionOpt.name.toLowerCase() == condition.attribute.toLowerCase()) {
                  con.attribute = conditionOpt;
                  con.attribute.dataType = conditionOpt.dataType;
                  angular.forEach(conditionOpt.operator, function (operator) {
                    if (operator.key == condition.operator) con.operator = operator
                  })
                }
              })
              con.value = condition.value;
            })
            $scope.delegation.resources = [];
            payload.resourceComponents && payload.resourceComponents[0] && angular.forEach(payload.resourceComponents[0].components, function (res) {
              angular.forEach($scope.resourceOptions, function (resOpt) {
                if (res.id == resOpt.id) {
                  $scope.delegation.resources.push(resOpt);
                }
              });
            });
            $scope.delegation.actions = [];
            payload.actionComponents && payload.actionComponents[0] && angular.forEach(payload.actionComponents[0].components, function (act) {
              angular.forEach($scope.actionOptions, function (actOpt) {
                if (act.id == actOpt.id) {
                  $scope.delegation.actions.push(actOpt)
                }
              });
            });
            $scope.delegation.obligations = payload.obligations;

            // set new UI
            var aComs = payload.actionComponents &&
              payload.actionComponents[0] &&
              payload.actionComponents[0].components &&
              payload.actionComponents[0].components.map(function (a) {
                return a.id
              });

            for (var i = 0; i < $scope.tabConfig.length; i++) {
              var tab = $scope.tabConfig[i];
              for (var j = 0; j < tab.resourceComponents.length; j++) {
                var r = tab.resourceComponents[j];
                var reqSent = false;
                if(!r.actionComponents) {
                  continue;
                }
                for (var k = 0; k < r.actionComponents.length; k++) {
                  var a = r.actionComponents[k];
                  if (aComs && aComs.indexOf(a.id) > -1) {
                    a.checked = true;
                    checkForSelectAllActions(r);
                    if (!r.selectedActions) r.selectedActions = [];
                    r.selectedActions.push(a);
                    if (i < 4) {
                      if (!r.policyModel && !reqSent) {
                        fetchPolicyModel(a.data.policy_model_id, function (policyModel, r) {
                          r.policyModel = policyModel;
                        }, r);
                        reqSent = true;
                      }
                      for (oId = 0; oId < payload.obligations.length; oId++) {
                        var ob = payload.obligations[oId];
                        if (ob.policyModelId == a.data.policy_model_id) {
                          var tagsSet = false;
                          angular.forEach(ob.params, function (value, key) {
                            if (a.checked && !tagsSet) {
                              if (actionObligationParamsMap[ob.name][key] == a.name) {
                                setTagsInUI(key, i, j, ob.params);
                                tagsSet = true;
                              }
                            }
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
            $scope.actionOptions.filter(function (action) {
              return action.checked
            }).forEach(function (action) {
              action.disabled = isDependentActionsFound(action.name)
            })
          }).then(function(){
              $scope.saveEnabled = true;
          })
      }
      var setTagsInUI = function (parameterShortName, tabIndex, resourceIndex, params) {
        if (tabIndex === 0) {
          setFoldersInUI(parameterShortName, tabIndex, resourceIndex, params);
          return;
        }
        var tagsObj = params && params[parameterShortName] && JSON.parse(params[parameterShortName]);
        if (tagsObj && tagsObj.tagsFilters) {
          var tab = $scope.tabConfig[tabIndex];
          tab.tagsConfig = [];
          angular.forEach(tagsObj.tagsFilters, function (obj) {
            var t = {};
            t.tags = [];
            t.condition = (obj.operator == "NOT") ? $scope.attributes[1] : $scope.attributes[0];
            t.selectedTags = obj.tags;
            // remove "all_tags" if present
            for (var i = t.selectedTags.length - 1; i >= 0; i--) {
              var tag = t.selectedTags[i];
              if (tag.key === "all_tags") {
                t.selectedTags.splice(i, 1);
              } else if (tag.key === "all_folders") {
                t.selectedTags.splice(i, 1);
                return;
              } else if (tag.type === "FOLDER_TAG") {
                return;
              }
            }
            tab.tagsConfig.push(t);
          });
          setFoldersInUI(parameterShortName, tabIndex, resourceIndex, params);
        }
      }

      var setFoldersInUI = function (parameterShortName, tabIndex, resourceIndex, params) {
        if (tabIndex === 3) {// Not needed for Component Type
          return;
        }
        var foldersObj = params && params[parameterShortName] && JSON.parse(params[parameterShortName]);
        if (foldersObj && foldersObj.tagsFilters) {
          var tab = tabIndex === 0 ? $scope.tabConfig[tabIndex].resourceComponents[resourceIndex] : $scope.tabConfig[tabIndex];
          var resourceName = tabIndex === 0 ? tab.name : tab.tabName;
          tab.foldersConfig = [];
          angular.forEach(foldersObj.tagsFilters, function (obj) {
            var f = {};
            f.folders = resourceName.indexOf('Policy') > -1 ?
              JSON.parse(JSON.stringify($scope.policyFolderOptions))
              : JSON.parse(JSON.stringify($scope.compFolderOptions));
            f.condition = (obj.operator === "NOT") ? $scope.attributes[1] : $scope.attributes[0];
            f.selectedFolders = [];
            // not adding tags.
            for (var i = obj.tags.length - 1; i >= 0; i--) {
              var folder = obj.tags[i];
              if (folder.type !== "FOLDER_TAG") {
                return;
              }
              var id = parseInt(folder.key);
              if(resourceName.indexOf('Policy') > -1 && $scope.policyFolderMap[id]) {
                let selectedFolder = JSON.parse(JSON.stringify($scope.policyFolderMap[id]));
                selectedFolder.selected = true;
                selectedFolder.includeSubFolders = folder.key.indexOf('/**') > -1;
                selectedFolder.folderPath = selectedFolder.includeSubFolders ? selectedFolder.folderPath + "/**" : selectedFolder.folderPath;
                f.selectedFolders.push(selectedFolder);
              } else if($scope.compFolderMap[id]){
                let selectedFolder = JSON.parse(JSON.stringify($scope.compFolderMap[id]));
                selectedFolder.selected = true;
                selectedFolder.includeSubFolders = folder.key.indexOf('/**') > -1;
                selectedFolder.folderPath = selectedFolder.includeSubFolders ? selectedFolder.folderPath + "/**" : selectedFolder.folderPath;
                f.selectedFolders.push(selectedFolder);
              }
            }
            tab.foldersConfig.push(f);
          });
        }
      }

      if ($stateParams.delegationId) {
        delegationService.getDelegationById($stateParams.delegationId, setDelegation);
      } else {
        $state.current.pageTitle = $filter('translate')("delegation.list.btn.createDelegation");
        $scope.saveEnabled = true;
      }

      $scope.policyModelAvailableForResource = function () {
        return function (item) {
          if (!item.data || !item.data.policy_model_id) return false;
          if (delegationModels && delegationModels[item.data.policy_model_id]) return true;
          return false;
        }
      }

      $scope.policyModelAvailableForAction = function () {
        return function (item) {
          if (!item.data || !item.data.policy_model_id) {
            return false;
          }
          for (var i = 0; i < $scope.delegation.resources.length; i++) {
            if ($scope.delegation.resources[i].data.policy_model_id == item.data.policy_model_id) {
              return true
            }
          }
          return false
        }
      }

      $scope.userManualOption = {
        app: 'Delegated Administration',
        section: 'Delegation Rules',
        page: 'Create Rule',
      }
      $scope.pageOptionList = null;
      $scope.showUserManual = {};
      userManualTranslateService.pageOptionList($scope.userManualOption, function (pageOptionList) {
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
      var showAllManual = function (show) {
        for (var key in $scope.showUserManual) {
          $scope.showUserManual[key] = show;
        }
      }
      $scope.$watch(function () {
        return $rootScope.showAboutPage;
      }, function (newValue, oldValue) {
        if (newValue == oldValue) return;
        showAllManual(newValue);
      });
      $scope.$watch(function () {
        return $scope.showUserManual;
      }, function (newValue, oldValue) {
        if (newValue == oldValue) return;
        var showAboutPage = false;
        for (var key in $scope.showUserManual) {
          showAboutPage = showAboutPage || $scope.showUserManual[key];
        }
        $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
      }, true);

      var itemBeforeEdit = null;
      $scope.editItem = {};
      $scope.setEdit = function (item) {
        if ($scope.editItem.$$hashKey) {
          $scope.saveEdit();
          if ($scope.conditionTable.error) return;
        }
        itemBeforeEdit = JSON.parse(JSON.stringify(item));
        $scope.editItem = item;
        $scope.editItem.isEdit = true;
        $scope.conditionTable.dirty = true;
        $scope.conditionTable.notify = false;
      }
      var setNotification = function (table) {
        table.notify = true;
        $timeout(function () {
          table.notify = false;
        }, 3000);
      }
      $scope.saveEdit = function () {
        var errList = [];
        errList = validateConditionTable();
        if (errList.length) {
          $scope.conditionTable.error = true;
          $scope.conditionTable.success = false;
          $scope.conditionTable.message = errList.join(', ');
        } else {
          $scope.conditionTable.success = true;
          $scope.conditionTable.error = false;
          $scope.conditionTable.message = 'Condition added to the table successfully';
          $scope.editItem = {};
        }
        setNotification($scope.conditionTable);
      }
      var deepCopyWith$ = function (src, target) {
        angular.copy(src, target);
        for (var field in src) {
          target[field] = src[field];
        }
      }
      $scope.cancelEdit = function () {
        if ($scope.editItem.isEdit) {
          deepCopyWith$(itemBeforeEdit, $scope.editItem);
        } else {
          $scope.delegation.user_conditions.splice($scope.delegation.user_conditions.length - 1);
        }
        $scope.editItem = {};
      }
      var validateConditionTable = function () {
        var errMsgs = [];
        for (var i = 0; i < $scope.delegation.user_conditions.length; i++) {
          var condition = $scope.delegation.user_conditions[i];
          if (!condition.value)
            errMsgs.push($filter('translate')('component.condition.value.validation.required'));
        }
        return errMsgs;
      }
      $scope.conditionTable = {
        dirty: false,
        success: true,
        error: false,
        notify: false,
        message: ''
      };

      $scope.selectTab = function (id) {
       if (id === $scope.tabs.previousTab) {
          if (hasTabError(id)) {
            $scope.tabs.hasError = true;
            $timeout(function () {
              $scope.tabs.hasError = false;
              $scope.tabs.hasTagError = false;
              $scope.tabs.hasFolderError = false;
              setFolderError(false);
            }, 5000);
          }
          return;
        }

        if ($scope.tabs.hasError && $scope.tabs.previousTab > -1) {
          $timeout(function () {
            $scope.tabs.activeTab = $scope.tabs.previousTab;
          }, 20);
        }
      }
      var hasTabError = function (tabId) {
        var tab = $scope.tabConfig[tabId];
        var tagSelected = false;
        if (tabId === 0) {
          for(var i = 0; i < tab.resourceComponents.length; i++) {
            if (hasFoldersSelected(tab.resourceComponents[i].foldersConfig)) {
              tab.resourceComponents[i].hasFolderError = (!tab.resourceComponents[i].selectedActions) ? true : tab.resourceComponents[i].selectedActions.length ? false : true;
            }
          }
        } else {
          for (var i = 0; i < tab.tagsConfig.length; i++) {
            if (tab.tagsConfig[i].selectedTags.length) {
              tagSelected = true;
              break;
            }
          }
          if (tagSelected) {
            $scope.tabs.hasTagError = (!tab.resourceComponents[0].selectedActions) ? true : tab.resourceComponents[0].selectedActions.length ? false : true;
          }

          if (hasFoldersSelected(tab.foldersConfig)) {
            $scope.tabs.hasFolderError = (!tab.resourceComponents[0].selectedActions) ? true : tab.resourceComponents[0].selectedActions.length ? false : true;
          }
        }

        return ($scope.tabs.hasTagError || $scope.tabs.hasFolderError || $scope.tabConfig[0].resourceComponents[0].hasFolderError || $scope.tabConfig[0].resourceComponents[1].hasFolderError);
      }

      var hasFoldersSelected = function(foldersConfig) {
        var folderSelected = false;
        if(foldersConfig) {
          for (var i = 0; i < foldersConfig.length; i++) {
            if (foldersConfig[i].selectedFolders.length) {
              folderSelected = true;
              break;
            }
          }
        }
        return folderSelected;
      }

      $scope.deselectTab = function (id) {
        if (id < 4 && !$scope.tabs.hasError) {
          if (hasTabError(id)) {
            $scope.tabs.previousTab = id;
            $scope.tabs.hasError = true;
            $timeout(function () {
              $scope.tabs.hasError = false;
              $scope.tabs.hasTagError = false;
              $scope.tabs.hasFolderError = false;
              setFolderError(false);
            }, 5000)
          } else {
            $scope.tabs.hasError = false;
            $scope.tabs.hasTagError = false;
            $scope.tabs.hasFolderError = false;
            setFolderError(false);
          }
        }
      }

      var setFolderError = function (flag) {
        for (var i = 0; i < $scope.tabConfig[0].resourceComponents.length; i++) {
          $scope.tabConfig[0].resourceComponents[i].hasFolderError = flag;
        }
      }

      $rootScope.immediateStateChange = function () {
        return $scope.delegationForm.val.$pristine;
      }
      $rootScope.stateChangeHook = function (state) {
        dialogService.confirm({
          msg: $filter('translate')('common.discard.confirm'),
          confirmLabel: $filter('translate')('Proceed'),
          cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
          ok: function () {
            $scope.delegationForm.val.$setPristine();
            $state.go(state.name, state.params)
          },
          cancel: function () {
          }
        })
      }

      $scope.sortActions = function(action) {
        if(action.name.indexOf('View') !== -1) {
          return 1;
        } else if(action.name.indexOf('Create') !== -1) {
          return 2;
        } else if(action.name.indexOf('Rename') !== -1 || action.name.indexOf('Edit') !== -1) {
          return 3;
        } else if(action.name.indexOf('Move') !== -1) {
          return 4;
        } else if(action.name.indexOf('Delete') !== -1) {
          return 5;
        }
        return 6;
      }
      $scope.actionsFound = function (resource) {
        return $scope.delegation.actions.some(function (action) {
          return action.data.policy_model_id == resource.data.policy_model_id;
        });
      }
    }
  ]);
