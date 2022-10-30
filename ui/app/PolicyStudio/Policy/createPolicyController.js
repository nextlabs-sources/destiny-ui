policyStudio.controller('createPolicyController', ['$timeout', '$scope', '$http', 'constants', 'policyService', 'componentService', 'resourceService', 'loggerService', '$uibModal', '$location', '$anchorScroll',
  '$stateParams', '$filter', 'dialogService', '$state', 'autoCloseOptionService', '$window', 'userManualTranslateService', '$rootScope', 'moment', '$q', 'userService', 'versionService', 'tagService', 'agentService',
  'configService',
  function($timeout, $scope, $http, constants, policyService, componentService, resourceService, loggerService, $uibModal, $location, $anchorScroll, $stateParams, $filter, dialogService, $state,
    autoCloseOptionService, $window, userManualTranslateService, $rootScope, moment, $q, userService, versionService, tagService, agentService, configService) {
    'use strict';
    var logger = loggerService.getLogger();
    // $rootScope.hasUserManual = true;
    $scope.$parent.transition = "fade-in";
    $scope.$parent.$parent.isCreatePage = true;
    $scope.isEditMode = false;
    $scope.defaultSubjectPolicyModels = [];
    $scope.policyModelIdUser = -1;
    $scope.policyModelNameUser = "User";
    $stateParams.policyId && ($scope.isEditMode = true);
    $scope.agentTypes = constants.agentTypes;
    $scope.getAgentTypeName = function (type) {
      for (var i = 0, length = $scope.agentTypes.length; i < length; i++) {
        var agentType = $scope.agentTypes[i];
        if (agentType.key == type) {
          return agentType.value;
        }
      }
      return "";
    }
    $scope.findAgentsCache = [];
    $scope.findAgentsPreviousValue = "";
    $scope.findAgentsPreviousTypes = [];

    $scope.timezoneList = angular.copy(getMinimalTimezoneSet());
    userService.getPermissions('POLICY', function(permissions) {
      $scope.permissions = permissions;
    });
    $scope.hideAllowParams = {};
    $scope.hideDenyParams = {};
    !$scope.isEditMode && userService.goBackIfAccessDenied('CREATE_POLICY');
    $scope.userAccessMap = null;
    userService.getUserAccessMap(function(userAccessMap) {
      $scope.userAccessMap = userAccessMap;
    })

    $scope.parentPolicy = $stateParams.parentPolicy;
    $scope.tab = $stateParams.tab;
    $scope.tabSelected = 0;
    $stateParams.tab  == 'hierarchy'&& ($scope.tabSelected = 1);
    $stateParams.tab  == 'history'&& ($scope.tabSelected = 2);
    $scope.policyForm = {
      val: null,
    }
    $scope.connectionTypeOptions = [
      { value: "", label: "Select Connection" },
      { value: "Local", label: "Local" },
      { value: "Remote", label: "Remote" }
    ];
    $scope.amPmOptions = ["AM", "PM"];
    $scope.recurByDaysOptions = [
      {label:"SUN", value:"sunday", checked:true},
      {label:"MON", value:"monday", checked:true}, 
      {label:"TUE", value:"tuesday", checked:true}, 
      {label:"WED", value:"wednesday", checked:true}, 
      {label:"THU", value:"thursday", checked:true}, 
      {label:"FRI", value:"friday", checked:true}, 
      {label:"SAT", value:"saturday", checked:true}, 
    ];
    $scope.recurrenceOptions = [{
      label: "Choose by days",
      value: "recurByDays",
    }, {
      label: "Choose by date",
      value: "recurByDates"
    }];
    $scope.policyRecur = {
      val: null, 
      always: true, 
      specificDays: false,
      recurBy: $scope.recurrenceOptions[0],
      from: null,
      to: null,
      timezone: $scope.timezoneList[0].tzCode,
      pdpPepTimezone: true,
    };
    $scope.policyRecur.from = new Date();
    $scope.policyRecur.from.setHours(0);
    $scope.policyRecur.from.setMinutes(0);
    $scope.policyRecur.from.setSeconds(0);
    $scope.policyRecur.to = new Date();
    $scope.policyRecur.to.setHours(23);
    $scope.policyRecur.to.setMinutes(59);
    $scope.policyRecur.to.setSeconds(0);

    $scope.policyValidity = {
      from: {
        val: 'today', 
        today: true, 
        specificDate: false,
        popupOpen: false,
        date: null
      },
      to: {
        val: 'neverExpire', 
        neverExpire: true, 
        specificDate: false,
        popupOpen: false,
        date: null
      }
    }
    $scope.obligationMap = {};
    $scope.policyModels = [];
    var notifyObligation = {
      name:'Notify',
      shortName:'notify',
      parameterDefault: [{
        name: 'To',
        shortName: 'to',
        type: 'TEXT_SINGLE_ROW',
        pattern: '^\\w(\\w|[.+#$!-])*@(\\w+\\.){1,3}\\w{2,6}$',
        mandatory: true,
        hidden: false,
        editable: true,
        suggestions: false
      }, {
        name: 'Message',
        shortName: 'message',
        type: 'TEXT_MULTIPLE_ROW',
        mandatory: true,
        hidden: false,
        editable: true,
        suggestions: true
      }]
    }
    var denyNotifyObligation = angular.copy(notifyObligation)

    $scope.policy = {
      id: null,
      name: null,
      description: null,
      tags: [],
      effects: true,
      toSubjectComponentsEnabled: false,
      subjectComponents: [],
      toSubjectComponents: [],
      actions: [],
      toResourceComponentsEnabled: false,
      resourceComptsContainer: [],
      toResourceComptsContainer: [],
      allowObligationMap: {
        '0': [{
          name:'Audit activity',
          shortName:'log',
        }]
      },
      denyObligationMap: {
        '0': [{
          name:'Audit activity',
          shortName:'log',
          enabled: true
        }]
      },
      expression: '',
      validFrom: {},
      validTo: {},
      connectionType: $scope.connectionTypeOptions[0].value,
      manualDeploy: false,
      deploymentTargets: [],
      folderId: null,
      folderPath: null
    };
    $scope.policy.folderPath = $stateParams.folderPath;
    $scope.policy.validFrom.date = new Date();
    $scope.policy.validFrom.date.setHours(0);
    $scope.policy.validFrom.date.setMinutes(0);
    $scope.policy.validFrom.date.setSeconds(0);
    $scope.lastDateOfThisCentury = new Date();
    $scope.lastDateOfThisCentury.setFullYear(2099);
    $scope.lastDateOfThisCentury.setMonth(11);
    $scope.lastDateOfThisCentury.setDate(31);
    $scope.lastDateOfThisCentury.setHours(23);
    $scope.lastDateOfThisCentury.setMinutes(59);
    $scope.lastDateOfThisCentury.setSeconds(59);
    $scope.policy.validTo.date = angular.copy($scope.lastDateOfThisCentury);
    var setPolicyPromiseList = [];
    var setObligationPromiseList = [];
    var policyPayload = {};
    var currentTarget = "policyName";
    $scope.attributes = [{
      attr: "In",
      value: "IN"
    }, {
      attr: "Not In",
      value: "NOT"
    }];
    var attributeMap = {};

    $scope.toResourceAttributes = [{
      attr: "Into",
      value: "IN"
    }, {
      attr: "Outside",
      value: "NOT"
    }];
    var toResourceAttributeMap = {};

    angular.forEach($scope.attributes, function(attr) {
      attributeMap[attr.value] = attr;
    })

    angular.forEach($scope.toResourceAttributes, function (attr) {
      toResourceAttributeMap[attr.value] = attr;
    });

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

    $scope.editPolicy = function(policy, tab) {
      $state.go('PolicyStudio.editPolicy', {
        policyId: policy.id,
        tab: tab
      });
    };
    $scope.getSubjectOptionsByPolicyModelId = function (policyModelId) {
      if (policyModelId && $scope.$subjectOptions) {
        return $scope.$subjectOptions.filter(function (subjectOption) {
          return subjectOption && subjectOption.data && subjectOption.data.policy_model_id == policyModelId;
        });
      }
      return $scope.$subjectOptions;
    }

    setPolicyPromiseList.push(resourceService.getResourceLiteList('SUBJECT', function (data) {
      $scope.defaultSubjectPolicyModels = data.data;
    }).then(function () {
      var enrollmentAttributePromises = [];
      angular.forEach($scope.defaultSubjectPolicyModels, function (policyModel, index) {
        if (policyModel.shortName == 'user') {
          $scope.policyModelIdUser = policyModel.id;
          $scope.policyModelNameUser = policyModel.name;
        }
        enrollmentAttributePromises.push(resourceService.getEnrollmentSubjectAttributes(policyModel.shortName, function (data) {
          if (data.data && data.data.length) {
            $scope.defaultSubjectPolicyModels[index].enrollmentAttributes = data.data;
          }
        }));
      });
      return $q.all(enrollmentAttributePromises);
    }));

    var preparePolicyPayload = function() {
      logger.log($scope.policy);
      policyPayload = {};
      policyPayload.id = $scope.policy.id;
      policyPayload.folderId = $stateParams.folderId || $scope.policy.folderId;
      policyPayload.folderPath = $stateParams.folderPath;
      policyPayload.name = $scope.policy.name;
      policyPayload.effectType = $scope.policy.effects ? 'allow' : 'deny';
      policyPayload.description = $scope.policy.description;
      policyPayload.expression = $scope.policy.expression && $scope.policy.expression.trim();
      policyPayload.tags = [];
      policyPayload.version = $scope.policy.version;
      angular.forEach($scope.policy.tags, function(tag) {
        var t = {};
        t.id = tag.id;
        // t.key = tag.key;
        // t.label = tag.label;
        // t.type = tag.type;
        // t.status = tag.status;
        policyPayload.tags.push(t);
      });
      policyPayload.subjectComponents = [];
      angular.forEach($scope.policy.subjectComponents, function (subject) {
        if (subject.subjects.length) {
          var s = {};
          s.operator = subject.$condition.value;
          s.components = subject.subjects.map(function (item) {
            return {
              id: item.id
            }
          });
          policyPayload.subjectComponents.push(s);
        }
      });
      if ($scope.policy.toSubjectComponentsEnabled) {
        policyPayload.hasToSubjectComponents = true;
        policyPayload.toSubjectComponents = [];
        angular.forEach($scope.policy.toSubjectComponents, function (subject) {
          if (subject.subjects.length) {
            var s = {};
            s.operator = subject.$condition.value;
            s.components = subject.subjects.map(function (item) {
              return {
                id: item.id
              }
            });
            policyPayload.toSubjectComponents.push(s);
          }
        });
      }
      var latesPolicyModels = [];
      policyPayload.actionComponents = [];
      if ($scope.policy.actions.length) {
        policyPayload.actionComponents.push({
          operator: 'IN',
          components: $scope.policy.actions.map(function(item) {
            return {
              id: item.id
            }
          })
        });
        angular.forEach($scope.policy.actions, function(action) {	
          if (!action.data || !action.data.policy_model_id) return;
          latesPolicyModels.indexOf(action.data.policy_model_id) == -1 && latesPolicyModels.push(action.data.policy_model_id);
        });
      }
      policyPayload.fromResourceComponents = [];
      angular.forEach($scope.policy.resourceComptsContainer, function(resource) {
        if (resource.resources.length) {
          var s = {};
          s.operator = resource.$condition.value;
          s.components = resource.resources.map(function(item) {
            return {
              id: item.id
            }
          });
          policyPayload.fromResourceComponents.push(s);
          angular.forEach(resource.resources, function(r) {
            if (!r.data || !r.data.policy_model_id) return;
            latesPolicyModels.indexOf(r.data.policy_model_id) == -1 && latesPolicyModels.push(r.data.policy_model_id);
          })
        }
      });
      if ($scope.policy.toResourceComponentsEnabled) {
        policyPayload.hasToResourceComponents = true;
        policyPayload.toResourceComponents = [];
        angular.forEach($scope.policy.toResourceComptsContainer, function (resource) {
          if (resource.resources.length) {
            var s = {};
            s.operator = resource.$condition.value;
            s.components = resource.resources.map(function (item) {
              return {
                id: item.id
              }
            });
            policyPayload.toResourceComponents.push(s);
            angular.forEach(resource.resources, function(r) {
              if (!r.data || !r.data.policy_model_id) return;
              latesPolicyModels.indexOf(r.data.policy_model_id) == -1 && latesPolicyModels.push(r.data.policy_model_id);
            })
          }
        });
      }
      policyPayload.environmentConfig = {};
      switch($scope.policy.connectionType) {
        case 'Remote':
          policyPayload.environmentConfig.remoteAccess = 1;
          break;
        case 'Local':
          policyPayload.environmentConfig.remoteAccess = 0;
          break;
        default:
          policyPayload.environmentConfig.remoteAccess = -1;
          break;
      }
      if($scope.policy.heartbeat) policyPayload.environmentConfig.timeSinceLastHBSecs = $scope.policy.heartbeat * 60;
      else policyPayload.environmentConfig.timeSinceLastHBSecs = -1;
      if ($scope.policyRecur.val == 'specificDays') {
        policyPayload.scheduleConfig = {
          timezone: null,
          startDateTime: null,
          endDateTime: null,
          recurrenceDateOfMonth: -1,
          recurrenceDayInMonth: -1,
          sunday: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false
        };
        if (!$scope.policyRecur.pdpPepTimezone) {
          policyPayload.scheduleConfig.timezone = $scope.policyRecur.timezone;
        }
        policyPayload.scheduleConfig.startDateTime = $filter('date')($scope.policy.validFrom.date, 'MMM d, yyyy h:mm:ss a');
        policyPayload.scheduleConfig.endDateTime = $filter('date')($scope.policy.validTo.date, 'MMM d, yyyy h:mm:ss a');
        policyPayload.scheduleConfig.recurrenceStartTime = $filter('date')($scope.policyRecur.from, 'hh:mm:ss a');
        policyPayload.scheduleConfig.recurrenceEndTime = $filter('date')($scope.policyRecur.to, 'hh:mm:ss a');
        if($scope.policyRecur.recurBy.value == 'recurByDays'){
          var recurOnDays = $filter('filter')($scope.recurByDaysOptions, {
            checked: true
          });
          angular.forEach(recurOnDays, function(day) {
            policyPayload.scheduleConfig[day.value] = true;
          })
        }
        else if($scope.policyRecur.recurBy.value == 'recurByDates') {
          policyPayload.scheduleConfig.recurrenceDateOfMonth = $scope.policyRecur.recurrenceDateOfMonth;
        }
      }
      
      // add default log obligation with all & deny
      policyPayload.allowObligations = [];
      angular.forEach($scope.policy.allowObligationMap, function(obligationGroup, policyModelId) {
        logger.log(obligationGroup, policyModelId);
        angular.forEach(obligationGroup, function(obligation) {
          if (obligation.enabled) {
            if (obligation.parameterSets && obligation.parameterSets.length) {
              angular.forEach(obligation.parameterSets, function(paramSet) {
                if (policyModelId && parseInt(policyModelId) !== 0
                  && latesPolicyModels.indexOf(obligation.policyModel.id) === -1) {
                  return;
                }
                var obli = {};
                obli.policyModelId = policyModelId;
                obli.name = obligation.shortName;
                obli.params = {};
                paramSet.length && paramSet.forEach(function(param) {
                  // remove all carriage on saving for single row parameter
                  if(param.type == 'TEXT_SINGLE_ROW' && param.value) param.value = param.value.replace(/\n/g, ' ')
                  if (param.value) param.value = param.value.trim()
                  obli.params[param.shortName] = param.value;
                });
                policyPayload.allowObligations.push(obli);
              });
            } else {
              var obli = {};
              obli.policyModelId = policyModelId;
              obli.name = obligation.shortName;
              obli.params = {};
              policyPayload.allowObligations.push(obli);
            }
          }
        })
      })
      // add default log obligation with all & deny
      policyPayload.denyObligations = [];
      angular.forEach($scope.policy.denyObligationMap, function(obligationGroup, policyModelId) {
        logger.log(obligationGroup, policyModelId);
        angular.forEach(obligationGroup, function(obligation) {
          if (obligation.enabled) {
            if (obligation.parameterSets && obligation.parameterSets.length) {
              angular.forEach(obligation.parameterSets, function(paramSet) {
                if (policyModelId && parseInt(policyModelId) !== 0
                  && latesPolicyModels.indexOf(obligation.policyModel.id) === -1) {
                  return;
                }
                var obli = {};
                obli.policyModelId = policyModelId;
                obli.name = obligation.shortName;
                obli.params = {};
                paramSet.length && paramSet.forEach(function(param) {
                  // remove all carriage on saving for single row parameter
                  if(param.type == 'TEXT_SINGLE_ROW' && param.value) param.value = param.value.replace(/\n/g, ' ')
                  if (param.value) param.value = param.value.trim()
                  obli.params[param.shortName] = param.value;
                });
                policyPayload.denyObligations.push(obli);
              });
            } else {
              var obli = {};
              obli.policyModelId = policyModelId;
              obli.name = obligation.shortName;
              obli.params = {};
              policyPayload.denyObligations.push(obli);
            }
          }
        })
      });
      policyPayload.manualDeploy = $scope.policy.manualDeploy;
      policyPayload.deploymentTargets = [];
      if ($scope.policy.manualDeploy) {
        policyPayload.deploymentTargets = $scope.policy.deploymentTargets;
      }

      policyPayload.status = 'DRAFT';
      policyPayload.parentId = $scope.parentPolicy ? $scope.parentPolicy.id : $scope.policy.parentId;
      logger.log(policyPayload);
    }
    var updateSubject = function(subject, s) {
      s.subjects = [];
      angular.forEach(subject.components, function(c) {
        angular.forEach(s.$subjectOptions, function(sub) {
          sub.id == c.id && s.subjects.push(sub)
        })
      })
    }
    var updateResource = function(resource, r) {
      r.resources = [];
      angular.forEach(resource.components, function(c) {
        angular.forEach(r.$resourceOptions, function(sub) {
          sub.id == c.id && r.resources.push(sub)
        })
      })
    }
    var updateAction = function() {
      $scope.policy.actions = [];
      if (!policyPayload.actionComponents || !policyPayload.actionComponents.length) return;
      angular.forEach(policyPayload.actionComponents[0].components, function(a) {
        angular.forEach($scope.$actionOptions, function(sub) {
          sub.id == a.id && (sub.$_checked = true) && $scope.policy.actions.push(sub)
        })
      });
    }
    var setPolicy = function(policy) {
      if (!policy.data) {
        dialogService.notify({
          msg: $filter('translate')('createpolicy.policy.unavailable'),
          ok: function() {
            $window.history.back();
            return;
          }
        })
      }
      // promise checking here, to make sure all depended components and component types are loaded.
      $q.all(setPolicyPromiseList).then(function() {
          loggerService.getLogger().log(policy);
          // set/ populate policy object to correctly reflect in the UI
          // ensure the key names match exactly
          policyPayload = policy.data; 
          $scope.policy.authoritiesParsed = policyService.parseAuthorities(policyPayload, $scope.permissions);
          !$scope.policy.authoritiesParsed['VIEW_POLICY'] && userService.showWarningAndGoBack();
          $scope.policy.id = policyPayload.id;
          $scope.policy.folderId = policyPayload.folderId;
          $scope.policy.folderPath = policyPayload.folderPath;
          $scope.policy.parentId = policyPayload.parentId;
          $scope.policy.name = policyPayload.name;
          $scope.policy.ownerDisplayName = policyPayload.ownerDisplayName;
          $state.current.pageTitle = $scope.policy.name;
          $scope.policy.effects = policyPayload.effectType == 'allow';
          $scope.policy.description = policyPayload.description;
          $scope.policy.status = policyPayload.status;
          $scope.policy.createdDate = policyPayload.createdDate;
          if(policyPayload.expression
            && policyPayload.expression.indexOf("AND ((") == 0
            && policyPayload.expression.endsWith("))")) {
            var endIndex = policyPayload.expression.length - 2;
            policyPayload.expression = policyPayload.expression.substring(6, endIndex);
          }
          $scope.policy.expression = policyPayload.expression || "";
          $scope.policy.tags = policyPayload.tags;
          $scope.policy.subjectComponents = [];
          $scope.policy.version = policyPayload.version;
          angular.forEach(policyPayload.subjectComponents, function(subject) {
            var s = {};
            s.$condition = attributeMap[subject.operator ? subject.operator : 'IN']
            s.$subjectOptions = angular.copy($scope.$subjectOptions);
            updateSubject(subject, s);
            $scope.policy.subjectComponents.push(s);
          });
          $scope.policy.toSubjectComponentsEnabled = policyPayload.hasToSubjectComponents;
          $scope.policy.toSubjectComponents = [];
          angular.forEach(policyPayload.toSubjectComponents, function(subject) {
            var s = {};
            s.$condition = attributeMap[subject.operator ? subject.operator : 'IN']
            s.$subjectOptions = angular.copy($scope.getSubjectOptionsByPolicyModelId($scope.policyModelIdUser));
            updateSubject(subject, s);
            $scope.policy.toSubjectComponents.push(s);
          });
          $scope.policy.resourceComptsContainer = [];
          angular.forEach(policyPayload.fromResourceComponents, function(resource) {
            var r = {};
            r.$condition = attributeMap[resource.operator ? resource.operator : 'IN']
            r.$resourceOptions = angular.copy($scope.$resourceOptions);
            updateResource(resource, r);
            $scope.policy.resourceComptsContainer.push(r);
          });
          $scope.policy.toResourceComponentsEnabled = policyPayload.hasToResourceComponents;
          $scope.policy.toResourceComptsContainer = [];
          angular.forEach(policyPayload.toResourceComponents, function(resource) {
            var r = {};
            r.$condition = toResourceAttributeMap[resource.operator ? resource.operator : 'IN']
            r.$resourceOptions = angular.copy($scope.$resourceOptions);
            updateResource(resource, r);
            $scope.policy.toResourceComptsContainer.push(r);
          });

          !policyPayload.subjectComponents.length && $scope.policy.subjectComponents.push(getEmptySubjectComponent(false));
          !policyPayload.toSubjectComponents.length && $scope.policy.toSubjectComponents.push(getEmptySubjectComponent(true));
          !policyPayload.fromResourceComponents.length && $scope.policy.resourceComptsContainer.push(getEmptyResourceComponent());
          !policyPayload.toResourceComponents.length && $scope.policy.toResourceComptsContainer.push(getEmptyResourceComponent());

          $scope.policy.manualDeploy = policyPayload.manualDeploy;
          $scope.policy.deploymentTargets = [];
          angular.forEach(policyPayload.deploymentTargets, function (deploymentTarget) {
            deploymentTarget["typeName"] = $scope.getAgentTypeName(deploymentTarget.type);
            deploymentTarget["agent"] = true;
            $scope.policy.deploymentTargets.push(deploymentTarget);
          });

          updateAction();
          $scope.updatePolicyModels(true);
          if(policyPayload.environmentConfig) {
            switch(policyPayload.environmentConfig.remoteAccess) {
              case 1:
                $scope.policy.connectionType = 'Remote'
                break;
              case 0:
                $scope.policy.connectionType = 'Local';
                break;
              default:
                $scope.policy.connectionType = '';
                break;
            }
            if(policyPayload.environmentConfig.timeSinceLastHBSecs > 0) $scope.policy.heartbeat = parseInt(policyPayload.environmentConfig.timeSinceLastHBSecs / 60);
          }
          $scope.policyValidity.from.val = 'today';
          $scope.policyValidity.to.val = 'neverExpire';
          if(policyPayload.scheduleConfig) {
            $scope.policyRecur.pdpPepTimezone = !policyPayload.scheduleConfig.timezone;
            if (!$scope.policyRecur.pdpPepTimezone) {
              $scope.policyRecur.timezone = policyPayload.scheduleConfig.timezone;
            }
            if(policyPayload.scheduleConfig.startDateTime){
              $scope.policyValidity.from.val = 'specificDate';
              $scope.policyValidity.from.specificDate = true;
              $scope.policyValidity.from.today = false;
              $scope.policyValidity.from.date = moment(policyPayload.scheduleConfig.startDateTime, 'MMM D, YYYY h:mm:ss a').toDate();
              $scope.policy.validFrom.date = moment(policyPayload.scheduleConfig.startDateTime, 'MMM D, YYYY h:mm:ss a').toDate();
            }
            if(policyPayload.scheduleConfig.endDateTime){
              $scope.policyValidity.to.val = 'specificDate';
              $scope.policyValidity.to.specificDate = true;
              $scope.policyValidity.to.neverExpire = false;
              $scope.policyValidity.to.date = moment(policyPayload.scheduleConfig.endDateTime, 'MMM D, YYYY h:mm:ss a').toDate();
              $scope.policy.validTo.date = moment(policyPayload.scheduleConfig.endDateTime, 'MMM D, YYYY h:mm:ss a').toDate();
            }
            if(policyPayload.scheduleConfig.recurrenceStartTime){
              $scope.policyRecur.from = moment(policyPayload.scheduleConfig.recurrenceStartTime, 'h:mm:ss a').toDate();
            }
            if(policyPayload.scheduleConfig.recurrenceEndTime){
              $scope.policyRecur.to = moment(policyPayload.scheduleConfig.recurrenceEndTime, 'h:mm:ss a').toDate();
            }
            var recurByDays = false, recurByDates = false;
            angular.forEach($scope.recurByDaysOptions, function(day) {
              day.checked = policyPayload.scheduleConfig[day.value];
              if(day.checked) recurByDays = true;
            });
            if(policyPayload.scheduleConfig.recurrenceDateOfMonth > 0) {
              $scope.policyRecur.recurrenceDateOfMonth = policyPayload.scheduleConfig.recurrenceDateOfMonth;
              recurByDays = false; 
              recurByDates = true;
            }
            if(recurByDays) {$scope.policyRecur.recurBy = $scope.recurrenceOptions[0]; }
            else if(recurByDates) {$scope.policyRecur.recurBy = $scope.recurrenceOptions[1]}
              $scope.policyRecur.val = 'specificDays';
              $scope.policyRecur.always = false;
              $scope.policyRecur.specificDays = true;
          }
          $timeout(function() {
            $rootScope.$broadcast('windowResize');
          }, 10)
          // obligation list should wait updatePolicyModels function finish, since obligation list for each component type is loaded there
          $q.all(setObligationPromiseList).then(function() {
            angular.forEach($scope.policy.allowObligationMap, function(obligationGroup, policyModelId) {
              angular.forEach(obligationGroup, function(obligation) {
                obligation.enabled = false;
              });
            });
            policyPayload.allowObligations.forEach(function(obligation) {
              logger.log(obligation);
              var obligationGroup = $scope.policy.allowObligationMap['' + obligation.policyModelId];
              obligationGroup && obligationGroup.forEach(function(obli) {
                if (obli.shortName == obligation.name) {
                  obli.enabled = true;
                  $scope.addObligationParameter(obli)
                  var paramSet = obli.parameterSets[obli.parameterSets.length - 1]
                  for (var index in paramSet) {
                    // var param = paramSet[index]
                    for (var param in obligation.params) {
                      paramSet[index].shortName == param && (paramSet[index].value = obligation.params[param]);
                    }
                  }
                }
              })
            })
            
            angular.forEach($scope.policy.denyObligationMap, function(obligationGroup, policyModelId) {
              angular.forEach(obligationGroup, function(obligation) {
                obligation.enabled = false;
              });
            });
            policyPayload.denyObligations.forEach(function(obligation) {
              logger.log(obligation);
              var obligationGroup = $scope.policy.denyObligationMap['' + obligation.policyModelId];
              obligationGroup && obligationGroup.forEach(function(obli) {
                if (obli.shortName == obligation.name) {
                  obli.enabled = true;
                  $scope.addObligationParameter(obli)
                  var paramSet = obli.parameterSets[obli.parameterSets.length - 1]
                  for (var index in paramSet) {
                    // var param = paramSet[index]
                    for (var param in obligation.params) {
                      paramSet[index].shortName == param && (paramSet[index].value = obligation.params[param]);
                    }
                  }
                }
              })
            })
            // setPolicyObligations()
            $scope.policy.externalStatus = policyService.policyStatus($scope.policy);
            $scope.policy.deployed = policyPayload.deployed;
            $scope.policy.deploymentStatus = policyPayload.deployed ?
              (policyPayload.deploymentPending ? $filter('translate')('deployment.status.deploymentPendingPriorDeployed') : $filter('translate')('deployment.status.deployed'))
              : (policyPayload.deploymentPending ? $filter('translate')('deployment.status.deploymentPending') : $filter('translate')('deployment.status.inactive'))
            $scope.policy.revisionCount = policyPayload.revisionCount;
            // logger.log(JSON.stringify($scope.policy.externalStatus))
            watchPolicyExt();
        })
      })
    }
    $scope.validateExpressionAndSave = function(frm, deploy) {
      $scope.validateExpression($scope.policy.expression, function(isValid) {
        if (isValid)
          $scope.saveAndDeployPolicy(frm, true, deploy);
      })
    }
    var buttonListForBackToList = [{
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        // logger.log('stay');
        callback && callback();
      }
    }, {
      label: $filter('translate')('BACK TO POLICY LIST'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        $scope.policyForm.val.$setPristine();
        $state.go('PolicyStudio.Policies');
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
        $scope.policyForm.val.$setPristine();
        $state.reload();
        callback && callback();
      }
    }];

    $scope.saveAndDeployPolicy = function (frm, save, deploy) {
      $scope.validateEffectiveTime(function(isValid) {
        frm.$invalid = !isValid;
        $scope.policyForm.val.policyValidityTo.$setValidity("effectivePeriod", isValid);
      });
      if (frm.$invalid) {
        frm.$setDirty()
        for (var field in frm) {
          if (field[0] == '$')
            continue
          frm[field].$touched = true
        }
        $scope.policy.showValidationMessages = true
        $scope.$broadcast('scrollto')
        return
      }
      preparePolicyPayload()
      policyPayload.skipValidate = true
      var saveAction = save ?
        $scope.isEditMode ?
          policyService.modifyPolicy :
          (policyPayload.parentId ?
            policyService.saveSubPolicy :
            policyService.savePolicy)
        : function (payload, callback) {
          callback({ 
            data: payload.id,
            deployOnly: true 
          });
        };
      saveAction(policyPayload, function (response) {
        frm.$setPristine()
        $scope.policy.id = response.data
        if (!response.deployOnly) {
          $state.current.name == 'PolicyStudio.editPolicy' ? $state.reload() : $scope.editPolicy($scope.policy);
        }
        if (deploy) {
          policyService.deploy([$scope.policy.id], true, save, null, function () {
            frm.$setPristine()
            $state.current.name == 'PolicyStudio.editPolicy' ? $state.reload() : $scope.editPolicy($scope.policy)
          })
        } else {
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')('createpolicy.saved.notify'),
            backLink: "PolicyStudio.Policies",
            backLabel: $filter('translate')('BACK TO POLICY LIST')
          })
        }
      })
    }

    $scope.discardPolicy = function(frm) {
      if (frm.$pristine) {
        // $state.go('PolicyStudio.Policies');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createpolicy.reset.confirm'),
          buttonList: buttonListForDiscarding
        });
      }
    };
    $scope.backToPolicyList = function(frm) {
      if (($scope.isEditMode && !$scope.policy.authoritiesParsed.EDIT_POLICY) || frm.$pristine) {
        $scope.policyForm.val.$setPristine();
        $state.go('PolicyStudio.Policies');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('createpolicy.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };
    $scope.setDirty = function(frm) {
      frm.$setDirty();
    }

    $scope.$watch("policy.toSubjectComponentsEnabled", function (newValue, oldValue) {
      if ($scope.policy.toSubjectComponentsEnabled && $scope.policy.toResourceComponentsEnabled) {
        dialogService.notify({
          msg: $filter('translate')('createpolicy.edit.subject.enableRecipientWhenTargetLocationEnabled'),
          timeout: 5000
        });
        $scope.policy.toSubjectComponentsEnabled = false;
      }
    });

    $scope.$watch("policy.toResourceComponentsEnabled", function (newValue, oldValue) {
      if ($scope.policy.toSubjectComponentsEnabled && $scope.policy.toResourceComponentsEnabled) {
        dialogService.notify({
          msg: $filter('translate')('createpolicy.edit.subject.enableTargetLocationWhenRecipientEnabled'),
          timeout: 5000
        });
        $scope.policy.toResourceComponentsEnabled = false;
      }
    });

    var getEmptySubjectComponent = function(to) {
      var subjectComponent = {}
      subjectComponent.subjects = [];
      subjectComponent.$subjectOptions = angular.copy(to ? $scope.getSubjectOptionsByPolicyModelId($scope.policyModelIdUser)
        : $scope.$subjectOptions);
      return subjectComponent;
    }
    var getEmptyResourceComponent = function() {
        var resourceComponent = {}
        resourceComponent.resources = [];
        resourceComponent.$resourceOptions = angular.copy($scope.$resourceOptions);
        return resourceComponent;
      }
    $scope.policy.subjectComponents.push(getEmptySubjectComponent(false));
    $scope.policy.toSubjectComponents.push(getEmptySubjectComponent(true));
    $scope.policy.resourceComptsContainer.push(getEmptyResourceComponent());
    $scope.policy.toResourceComptsContainer.push(getEmptyResourceComponent());
    $scope.addCondition = function (container, to) {
      var c = (container && container.toUpperCase) ? container.toUpperCase() : '';
      switch (c) {
        case 'SUBJECT': {
          if (to) {
            $scope.policy.toSubjectComponents.push(getEmptySubjectComponent(true));
          } else {
            $scope.policy.subjectComponents.push(getEmptySubjectComponent(false));
          }
          break;
        }
        case 'RESOURCE': {
          if (to) {
            $scope.policy.toResourceComptsContainer.push(getEmptyResourceComponent());
          } else {
            $scope.policy.resourceComptsContainer.push(getEmptyResourceComponent());
          }
          break;
        }
      }
    }
    $scope.removeCondition = function (index, container, to) {
      loggerService.getLogger().log(index, container);
      var c = (container && container.toUpperCase) ? container.toUpperCase() : '';
      switch (c) {
        case 'SUBJECT': {
          if (to) {
            $scope.policy.toSubjectComponents.splice(index, 1);
          } else {
            $scope.policy.subjectComponents.splice(index, 1);
          }
          break;
        }
        case 'RESOURCE': {
          if (to) {
            $scope.policy.toResourceComptsContainer.splice(index, 1);
          } else {
            $scope.policy.resourceComptsContainer.splice(index, 1);
          }
          break;
        }
      }
    }
    $scope.addTag = function(tag, callback) {
      loggerService.getLogger().log('add tag:' + tag);
      policyService.addTag(tag, function(data) {
        var tagId = data.data;
        policyService.getTagById(tagId, function(data) {
          $scope.policy.tags.push(data.data);
          callback && callback();
        });
      })
    }
    $scope.addComponent = function(index, component, container) {
      loggerService.getLogger().log('Add component:', container, index, component);
      var newComponent = {
        id: new Date().getTime(),
        // key: 'test',
        label: component,
      };
      var c = (container && container.toUpperCase) ? container.toUpperCase() : '';
      switch (c) {
        case 'SUBJECT':
          $scope.policy.subjectComponents[index].components.push(newComponent);
          break;
        case 'RESOURCE':
          $scope.policy.resourceComptsContainer[index].components.push(newComponent);
          break;
        case 'ACTION':
          $scope.policy.actionComptsContainer.push(newComponent);
          break;
      }
    };
    $scope.addObligationParameter = function(obligation) {
      obligation.parameterSets = obligation.parameterSets || []
      if(obligation.parameterDefault) {
        var paramSet = angular.copy(obligation.parameterDefault)
        paramSet.forEach(function(param) {
          param.suggestionOption = {
            showSuggestions : function(prefix) {
              logger.log(param)
              var deferred = $q.defer();
              if(!prefix || !prefix.length) 
                deferred.resolve(["resource", "env"]);
              deferred.resolve(["a", "b", "c", param.name])
              return deferred.promise;
            },
            updateExpression: function(newVal) {
              param.value = newVal;
              $scope.$digest();
            }
          }
        })
        obligation.parameterSets.push(paramSet)
      }
    }
    if (!$scope.isEditMode) {
      $scope.addObligationParameter(notifyObligation)
      $scope.addObligationParameter(denyNotifyObligation)
    }

    versionService.installMode(function(response) {
      var installMode = response.data && response.data;
      $scope.policy.allowObligationMap['0'].push(notifyObligation);
      $scope.policy.denyObligationMap['0'].push(denyNotifyObligation);
    });
    $scope.removeObligationParameter = function(obligation, index) {
      obligation.parameterSets.splice(index, 1)
    }
    if ($stateParams.policyId) {
      policyService.getPolicyById($stateParams.policyId, setPolicy);
    }else{
     $state.current.pageTitle = $filter('translate')("createpolicy.title.CreatePolicy");
    }
    $scope.policyHierarchy = null;
    var setExternalStatus = function(hierarchy) {
      hierarchy.externalStatus = policyService.policyStatus(hierarchy);
      hierarchy.authoritiesParsed = policyService.parseAuthorities(hierarchy, $scope.permissions);
      if (hierarchy.childNodes.length) {
        hierarchy.childNodes.forEach(function(hier) {
          setExternalStatus(hier);
        })
      }
    }
    $scope.getPolicyHierarchy = function() {
      if ($scope.policyHierarchy == null) {
        loggerService.getLogger().log('getPolicyHierarchy');
        policyService.getPolicyHierarchy($stateParams.policyId, function(data) {
          var rootHierarchy = data.data;
          rootHierarchy && rootHierarchy.childNodes && rootHierarchy.childNodes.length && ($scope.policyHierarchy = rootHierarchy.childNodes[0]) && setExternalStatus($scope.policyHierarchy);
        });
      }
    }
    $scope.policyHistory = null;
    $scope.getPolicyHistory = function() {
      if ($scope.policyHistory == null) {
        loggerService.getLogger().log('getPolicyHistory');
        policyService.getPolicyHistory($stateParams.policyId, function(data) {
          $scope.policyHistory = data.data;
        });
      }
    }
    $scope.$resourceOptions = [];
    $scope.$subjectOptions = [];
    setPolicyPromiseList.push(componentService.getComponentLiteList('RESOURCE', '', function (data) {
      $scope.$resourceOptions = data.data;
      angular.forEach($scope.$resourceOptions, function(option) {
        option.$_checked = false;
      })
      if (policyPayload.fromResourceComponents) {
        $scope.policy.resourceComptsContainer = [];
        angular.forEach(policyPayload.fromResourceComponents, function(resource) {
          var r = {};
          r.$resourceOptions = angular.copy($scope.$resourceOptions);
          $scope.policy.resourceComptsContainer.push(r);
        })
      } else {
        angular.forEach($scope.policy.resourceComptsContainer, function(resource) {
          resource.$resourceOptions = angular.copy($scope.$resourceOptions);
        });
      }
      if (policyPayload.toResourceComponents) {
        $scope.policy.toResourceComptsContainer = [];
        angular.forEach(policyPayload.toResourceComponents, function (resource) {
          var r = {};
          r.$resourceOptions = angular.copy($scope.$resourceOptions);
          $scope.policy.toResourceComptsContainer.push(r);
        })
      } else {
        angular.forEach($scope.policy.toResourceComptsContainer, function (resource) {
          resource.$resourceOptions = angular.copy($scope.$resourceOptions);
        });
      }
      // refreshSubComponentChecked();
    }));
    setPolicyPromiseList.push(componentService.getComponentLiteList('SUBJECT', '', function(data) {
      $scope.$subjectOptions = data.data;
      angular.forEach($scope.$subjectOptions, function(option) {
        option.$_checked = false;
      })
      if (policyPayload.subjectComponents) {
        $scope.policy.subjectComponents = [];
        angular.forEach(policyPayload.subjectComponents, function(subject) {
          var s = {};
          s.$condition = attributeMap[subject.operator ? subject.operator : 'IN'];
          s.$subjectOptions = angular.copy($scope.$subjectOptions);
          $scope.policy.subjectComponents.push(s);
        })
      } else {
        angular.forEach($scope.policy.subjectComponents, function(subject) {
          subject.$subjectOptions = angular.copy($scope.$subjectOptions);
        });
      }
      if (policyPayload.toSubjectComponents) {
        $scope.policy.toSubjectComponents = [];
        angular.forEach(policyPayload.toSubjectComponents, function (subject) {
          var s = {};
          s.$condition = attributeMap[subject.operator ? subject.operator : 'IN'];
          s.$subjectOptions = angular.copy($scope.getSubjectOptionsByPolicyModelId($scope.policyModelIdUser));
          $scope.policy.toSubjectComponents.push(s);
        })
      } else {
        angular.forEach($scope.policy.toSubjectComponents, function (subject) {
          subject.$subjectOptions = angular.copy($scope.getSubjectOptionsByPolicyModelId($scope.policyModelIdUser));
        });
      }
      // refreshSubComponentChecked();
    }));
    $scope.createNewResourceExt = function (index, to) {
      return function (resourceName, callback) {
        $scope.createNewResource(to ? $scope.policy.toResourceComptsContainer[index] : $scope.policy.resourceComptsContainer[index]
          , resourceName
          , callback);
      }
    }
    $scope.createNewResource = function(resourceComptTarget, resourceName, callback) {
      var newComponent = {
        "name": resourceName,
        "type": 'RESOURCE',
        "status": 'DRAFT'
      };
      componentService.saveComponent(newComponent, function(data) {
        var newID = data.data;
        componentService.getComponentById(newID, function(data) {
          var newComponent = data.data;
          newComponent.id = newID;
          newComponent.$_checked = false;
          newComponent.data = {
            policy_model_id: newComponent.policyModel.id
          };
          $scope.$resourceOptions.push(newComponent);
          angular.forEach($scope.policy.resourceComptsContainer, function(resourceCompt) {
            var newComponentCopy = angular.copy(newComponent);
            resourceCompt.$resourceOptions.push(newComponentCopy);
            resourceComptTarget == resourceCompt && callback && callback(newComponentCopy);
          });
          angular.forEach($scope.policy.toResourceComptsContainer, function (resourceCompt) {
            var newComponentCopy = angular.copy(newComponent);
            resourceCompt.$resourceOptions.push(newComponentCopy);
            resourceComptTarget == resourceCompt && callback && callback(newComponentCopy);
          });
        });
      });
    }
    var allResourcePM = []
    setPolicyPromiseList.push(resourceService.getResourceLiteList('RESOURCE', function(data) {
      angular.forEach($filter('orderBy')(data.data, 'name'), function(pm) {
        allResourcePM[pm.id] = pm
      })
    }));
    $scope.updatePolicyModels = function(asPromise) {
      var latesPolicyModels = [];
      angular.forEach($scope.policy.resourceComptsContainer, function(resourceCompt) {
        angular.forEach(resourceCompt.resources, function(resource) {
          if (!resource.data || !resource.data.policy_model_id) return;
          latesPolicyModels.indexOf(resource.data.policy_model_id) == -1 && latesPolicyModels.push(resource.data.policy_model_id);
        })
      });

      // change of action does not influence resource
      angular.forEach($scope.policy.actions, function(action) {
          if (!action.data || !action.data.policy_model_id) return;
        latesPolicyModels.indexOf(action.data.policy_model_id) == -1 && latesPolicyModels.push(action.data.policy_model_id);
      })
      logger.log('latesPolicyModels', latesPolicyModels)
      logger.log('$scope.policyModels', $scope.policyModels)
      var indexToRemove = [];
      $scope.policyModels.forEach(function(modelId, index) {
        latesPolicyModels.indexOf(modelId) == -1 && indexToRemove.push(index);
      });
      indexToRemove.reverse();
      indexToRemove.forEach(function(originalIndex) {
        logger.log($scope.policyModels[originalIndex]);
        // delete obligation here
        var deletedModel = $scope.policyModels.splice(originalIndex, 1);
        delete $scope.obligationMap[deletedModel[0]];
        delete $scope.policy.allowObligationMap[deletedModel[0]];
        delete $scope.policy.denyObligationMap[deletedModel[0]];
      });
      var newPolicyModels = [];
      latesPolicyModels.forEach(function(modelId, index) {
        // add obligation here
        $scope.policyModels.indexOf(modelId) == -1 && newPolicyModels.push(modelId);
      });
      angular.forEach(newPolicyModels, function(modelId) {
        if(modelId == 0) return;
        $scope.policyModels.push(modelId);
        function updatePMs(policyModel) {
          if (policyModel) {
            var sortedObligations = $filter('orderBy')(policyModel.obligations, 'sortOrder');
            sortedObligations.forEach(function(obligation) {
              obligation.policyModel = {
                id: policyModel.id,
                name: policyModel.name,
                lastUpdatedDate: policyModel.lastUpdatedDate,
              }
              obligation.parameterDefault = $filter('orderBy')(obligation.parameters, 'sortOrder')
              angular.forEach(obligation.parameterDefault, function(param) {
                param.value = param.value || param.defaultValue;
              });
            })
            $scope.obligationMap[modelId] = policyModel.obligations;
            $scope.policy.allowObligationMap[modelId] = angular.copy(sortedObligations);
            $scope.policy.denyObligationMap[modelId] = angular.copy(sortedObligations);
          }
        }
        if(!allResourcePM[modelId]) {
          var promise = resourceService.getResourceLite(modelId, function(response) {
            allResourcePM[modelId] = response.data
            updatePMs(response.data)
          })
          asPromise && setObligationPromiseList.push(promise);
        } else {
          updatePMs(allResourcePM[modelId])
        }
      })
      logger.log('$scope.policyModels', $scope.policyModels)

    }
    $scope.allEnabledAllowObligation = function() {
      var obligations = [];
      angular.forEach($scope.policy.allowObligationMap, function(obligationGroup) {
        angular.forEach(obligationGroup, function(obligation) {
          if(obligation.enabled) obligations.push(obligation)
        })
      })
      return obligations;
    }
    $scope.allEnabledDenyObligation = function() {
      var obligations = [];
      angular.forEach($scope.policy.denyObligationMap, function(obligationGroup) {
        angular.forEach(obligationGroup, function(obligation) {
          if(obligation.enabled) obligations.push(obligation)
        })
      })
      return obligations;
    }
    $scope.createNewSubjectExt = function (index, to) {
      return function (subjectName, callback) {
        $scope.createNewSubject(to ? $scope.policy.toSubjectComponents[index] : $scope.policy.subjectComponents[index]
          , subjectName
          , callback
          , to);
      }
    }
    $scope.createNewSubject = function (subjectComptTarget, subjectName, callback, to) {
      var newComponent = {
        "name": subjectName,
        "type": 'SUBJECT',
        "status": 'DRAFT',
        "policyModel": to ? { "id": $scope.policyModelIdUser } : undefined
      };
      componentService.saveComponent(newComponent, function (data) {
        var newID = data.data;
        componentService.getComponentById(newID, function (data) {
          var newComponent = data.data;
          newComponent.id = newID;
          newComponent.$_checked = false;
          newComponent.data = {
            policy_model_id: newComponent.policyModel.id,
            policy_model_name: to ? $scope.policyModelNameUser : undefined
          };
          $scope.$subjectOptions.push(newComponent);
          angular.forEach($scope.policy.subjectComponents, function (subjectCompt) {
            var newComponentCopy = angular.copy(newComponent);
            subjectCompt.$subjectOptions.push(newComponentCopy);
            subjectComptTarget == subjectCompt && callback && callback(newComponentCopy);
          });
          if (newComponent.data.policy_model_id && newComponent.data.policy_model_id == $scope.policyModelIdUser) {
            angular.forEach($scope.policy.toSubjectComponents, function (subjectCompt) {
              var newComponentCopy = angular.copy(newComponent);
              subjectCompt.$subjectOptions.push(newComponentCopy);
              subjectComptTarget == subjectCompt && callback && callback(newComponentCopy);
            });
          }
        })
      });
    }
      // $scope.policy.subjects = [];
    $scope.deleteSubject = function(subjectCompt, index) {
      var deleted = subjectCompt.subjects.splice(index, 1)[0];
      angular.forEach(subjectCompt.$subjectOptions, function(option) {
        if (option.id == deleted.id) option.$_checked = false;
      });
    }
    $scope.$actionOptions = [];
    setPolicyPromiseList.push(componentService.getComponentLiteList('ACTION', '', function(data) {
      $scope.$actionOptions = data.data;
      angular.forEach($scope.$actionOptions, function(option) {
          option.$_checked = false;
        })
        // refreshSubComponentChecked();
    }))
    $scope.policyModelAvailableForResource = function() {
      return function(item) {
        if(!item.data || angular.isUndefined(item.data.policy_model_id)) return false;
        if ($scope.policyModels.length == 0 || $scope.policyModels.indexOf(item.data.policy_model_id) > -1) return true;
        return $scope.policy.actions.length == 0;
      }
    }
    $scope.policyModelAvailableForAction = function() {
      return function(item) {
        if(!item.data || angular.isUndefined(item.data.policy_model_id)) return false;
        if ($scope.policyModels.length == 0 || $scope.policyModels.indexOf(item.data.policy_model_id) > -1) return true;
        var result = true;
        angular.forEach($scope.policy.resourceComptsContainer, function(resourceCompt) {
          if (resourceCompt.resources.length > 0) result = false;
        });
        return result;
      }
    }
    $scope.createNewAction = function(actionName, callback) {
        var newComponent = {
          "name": actionName,
          "type": 'ACTION',
          "status": 'DRAFT'
        };
        componentService.saveComponent(newComponent, function(data) {
          var newID = data.data;
          componentService.getComponentById(newID, function(data) {
            var newComponent = data.data;
            newComponent.id = newID;
            newComponent.$_checked = true;
            newComponent.data = {
              policy_model_id: newComponent.policyModel.id
            };
            $scope.$actionOptions.push(newComponent);
            callback && callback(newComponent);
          })
        })
      }
    $scope.noSubjectSelected = function() {
      var result = true;
      $scope.policy.subjectComponents.forEach(function(subjectCompt) {
        subjectCompt.subjects.length > 0 && (result = false);
      });
      return result;
    }
    $scope.showParameters = function(obligation) {
      !obligation.parameterSets && $scope.addObligationParameter(obligation)
    }
    var commonPristineCheck = function(callback) {
      if ($scope.policyForm.val.$pristine) callback && callback();
      else {
        dialogService.confirm({
          msg: $filter('translate')('common.discard.confirm'),
          confirmLabel: $filter('translate')('Proceed'),
          cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
          ok: function() {
            callback && callback();
          }
        })
      }
    }

    $rootScope.immediateStateChange = function() {
      return $scope.policyForm.val.$pristine;
    }
    $rootScope.stateChangeHook = function(state) {
      dialogService.confirm({
        msg: $filter('translate')('common.discard.confirm'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function() {
          $scope.policyForm.val.$setPristine();
          $state.go(state.name, state.params)
        },
        cancel: function() {
        }
      })
    }
    $scope.delPolicy = function(policyHierarchy, $event) {
      dialogService.confirm({
        msg: $filter('translate')('policylist.del.confirm'),
        confirmLabel: $filter('translate')('Delete'),
        ok: function() {
          policyService.delPolicy(policyHierarchy, function() {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('policylist.deleted.notify', {length : 1}),
              timeout:5000
            });
            $scope.policyForm.val.$setPristine();
            $state.go('PolicyStudio.Policies');
          });
        }
      })
      $event.stopPropagation();
    };
    $scope.addSubPolicy = function(policyHierarchy) {
      loggerService.getLogger().log('add sub policy:', policyHierarchy);
      //    policyService.setPolicyID(policy.id);
      $state.go('PolicyStudio.createPolicy', {
        folderId: $scope.policy.folderId,
        folderPath: $scope.policy.folderPath,
        parentPolicy: policyHierarchy
      });
    }
    $scope.policyRevision = null;
    $scope.hasDays = false;
    $scope.connectionType = "";
    $scope.heartbeat = -1;
    $scope.openVersionPanel = function(revision, latest) {
      $scope.policyRevision = undefined;
      $scope.hasDays = false;
      $scope.connectionType = "";
      $scope.heartbeat = -1;
      // !revision && ($scope.policyRevision = 'revision');
      policyService.getPolicyRevision(revision.id, revision.revision, function(data) {
        $scope.policyRevision = data.data;
        $scope.policyRevision.latest = latest;
        $scope.policyRevision.actionType = revision.actionType;
        if($scope.policyRevision.policyDetail.scheduleConfig != null){
          $scope.policyRevision.policyDetail.scheduleConfig.startDateTime = new Date($scope.policyRevision.policyDetail.scheduleConfig.startDateTime);
          $scope.policyRevision.policyDetail.scheduleConfig.endDateTime = new Date($scope.policyRevision.policyDetail.scheduleConfig.endDateTime);
          if ($scope.policyRevision.policyDetail.scheduleConfig.sunday 
            || $scope.policyRevision.policyDetail.scheduleConfig.monday
            || $scope.policyRevision.policyDetail.scheduleConfig.tuesday 
            || $scope.policyRevision.policyDetail.scheduleConfig.wednesday
            || $scope.policyRevision.policyDetail.scheduleConfig.thursday
            || $scope.policyRevision.policyDetail.scheduleConfig.friday
            || $scope.policyRevision.policyDetail.scheduleConfig.saturday) {
            $scope.hasDays = true;
          }
        }
        if($scope.policyRevision.policyDetail.environmentConfig != null) {
          $scope.connectionType = $scope.connectionTypeOptions[$scope.policyRevision.policyDetail.environmentConfig.remoteAccess + 1].value;
          $scope.heartbeat = $scope.policyRevision.policyDetail.environmentConfig.timeSinceLastHBSecs;
          $scope.heartbeat = $scope.heartbeat == -1 ? $scope.heartbeat : $scope.heartbeat / 60; 
        }
        
        if($scope.policyRevision.policyDetail.allowObligations != null) {
          angular.forEach($scope.policyRevision.policyDetail.allowObligations, function(allowObli){
            angular.forEach($scope.policy.allowObligationMap, function(obligationGroup, policyModelId) {
              angular.forEach(obligationGroup, function(obligation) {
                if(allowObli.name === obligation.shortName){
                  allowObli.name = obligation.name;
                }
              });
            });
          });
        }

        if($scope.policyRevision.policyDetail.denyObligations != null) {
          angular.forEach($scope.policyRevision.policyDetail.denyObligations, function(deyObli){
            angular.forEach($scope.policy.denyObligationMap, function(obligationGroup, policyModelId) {
              angular.forEach(obligationGroup, function(obligation) {
                if(deyObli.name === obligation.shortName){
                  deyObli.name = obligation.name;
                }
              });
            });
          });
        }

        autoCloseOptionService.registerOpen($scope, $scope.closeVersionPanel);
      })
    }
    $scope.closeVersionPanel = function() {
      $scope.policyRevision = undefined;
      $scope.hasDays = false;
      $scope.connectionType = "";
      $scope.heartbeat = -1;
    }
    $scope.showValidExp = false;
    $scope.showInValidExp = false;
    $scope.validateExpression = function(exp, callback) {
      if (!(exp && exp.trim())) {
        callback && callback(true);
        return;
      }
      policyService.validateExpression(exp, function(response) {
        //data = false;
        $scope.showValidExp = response.data;
        $scope.showInValidExp = !response.data;
        callback && callback(response.data);
      })
    };
    $scope.validateEffectiveTime = function(callback) {
      callback && callback($scope.policyRecur.to > $scope.policyRecur.from);
    };
    $scope.clearValidation = function() {
      $scope.showValidExp = false;
      $scope.showInValidExp = false;
    };
    $scope.revertToRevision = function(revision, $event) {
      dialogService.confirm({
        msg: $filter('translate')('createpolicy.revert.confirm'),
        ok: function() {
          policyService.revertToRevision(revision.id, function() {
            $scope.policyForm.val.$setPristine();
            if($state.params.tab == 'history') $state.reload();
            else $state.go('PolicyStudio.editPolicy', {
              policyId: $scope.policy.id,
              tab: 'history'
            })
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('createpolicy.reverted.notify'),
              timeout:5000
            });
          })
        },
        confirmLabel : $filter('translate')('REVERT'),
        cancelLabel : $filter('translate')('CANCEL')
      })
      $event.stopPropagation();
    }
    $scope.dropdownClicked = function($event) {
      if ($($event.target).attr('data-propagation') != 'true') $event.stopPropagation();
    };
    $scope.showUserManual = {};
    $scope.userManualOption = {
      app: 'Console',
      section: 'Policy Studio',
      page: 'Create Policy',
    }
    $scope.pageOptionList = null;
    userManualTranslateService.pageOptionList($scope.userManualOption, function(pageOptionList) {
      $scope.pageOptionList = pageOptionList;
      $rootScope.hasUserManual = pageOptionList;
      for (var key in $scope.pageOptionList) {
        $scope.showUserManual[key] = false;
      }
      for (var key in $scope.showUserManual) {
        if (!$scope.pageOptionList[key])
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
      // logger.log('showAboutPage', newValue, oldValue);
      if(newValue == oldValue) return;
      showAllManual(newValue);
    });
    $scope.$watch(function() {
      return $scope.showUserManual;
    }, function(newValue, oldValue) {
      // logger.log('showUserManual', newValue, oldValue);
      if(newValue == oldValue) return;
      var showAboutPage = false;
      for (var key in $scope.showUserManual) {
        showAboutPage = showAboutPage || $scope.showUserManual[key];
      }
      $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
    }, true);
    var watchPolicyExt = function(){
      $scope.$watch(function() {
        return $scope.policy;
      }, function(newValue, oldValue) {
        if(newValue == oldValue) return;
        $scope.setDirty($scope.policyForm.val);
      }, true);
    }
    !$scope.isEditMode && watchPolicyExt();
    $scope.componentOverview = null;
    $scope.showComponentInPanel = function(component) {
      if ($scope.userAccessMap && !$scope.userAccessMap['VIEW_COMPONENT']) {
        return;
      }
      $scope.componentOverview = undefined;
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
    $scope.editComponent = function(component) {
      logger.log(component);
      if(!$rootScope.immediateStateChange()) {
        var buttonListForEditComponent = [{
          label: $filter('translate')('CANCEL'),
          class: 'cc-btn-discard',
          onClick: function(callback) {
            callback && callback();
          }
        }, {
          label: $filter('translate')('Proceed to edit component'),
          class: 'cc-btn-primary',
          onClick: function(callback) {
            $scope.policyForm.val.$setPristine();
            $state.go('PolicyStudio.editComponent', {
              componentId: component.id,
              type: component.type.charAt(0) + component.type.slice(1).toLowerCase()
            });
            callback && callback();
          }
        }];
        dialogService.confirm({
          msg: $filter('translate')('createpolicy.edit.component.confirm'),
          buttonList: buttonListForEditComponent
        });     
      } else {
        $state.go('PolicyStudio.editComponent', {
          componentId: component.id,
          type: component.type.charAt(0) + component.type.slice(1).toLowerCase()
        });
      }
    }

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
            console.log('selection is in a quoted string')
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

    function getSuggestionForValue() {
      var suggestions = []
      var subject = {
        value: 'user',
        label: 'user(subject)',
        backDelete: 0
      }
      var host = {
        value: 'host',
        backDelete: 0
      }
      var env = {
        value: 'environment.',
        label: 'environment',
        backDelete: 0
      }

      suggestions.push(subject, host, env)
      var policyModelIds = {}, policyModels = []
      angular.forEach($scope.policy.resourceComptsContainer, function(resourceContainer) {
        angular.forEach(resourceContainer.resources, function(resource) {
          var pmID = resource.data.policy_model_id
          if(policyModelIds[pmID]) return;
          policyModelIds[pmID] = true
          if(policyModelCache[pmID]) suggestions.push({
            label: 'resource.' + policyModelCache[pmID].data.shortName,
            value: 'resource.' + policyModelCache[pmID].data.shortName + '.',
            backDelete: 0
          })
        });
      });
      return suggestions
    }
    var nonAlphaNumericRE = /[^a-zA-Z0-9_]+/
    function wrapShortName(shortName) {
      if (nonAlphaNumericRE.test(shortName)) {
        return JSON.stringify(shortName)
      } else {
        return shortName
      }
    }
    var showSuggestions = function(quoteShortname, includeResourceModelSN, pad$, suggestOnlyOnce, policyModelId) {
      return function(prefix, suffix) {
        var deferred = $q.defer();
        var addPrefix = pad$ ? '$' : ''
        // logger.log(suffix)
        if(!suffix) suffix = ""
        prefix = prefix.trimLeft()
        // var lastLogicPart = prefix.substring(getLastLogicPart(prefix, pad$))
        var lastPartPos = getLastPart(prefix, pad$)
        var lastPart = prefix.substring(lastPartPos.index)
        if(suggestOnlyOnce && lastPartPos.index != 0) {
          deferred.resolve([])
          return deferred.promise;
        }
        // logger.log("lastPart:", lastPart)
        var suffixPadded = lastPartPos.inQuote ? '"' + suffix : suffix
        if(pad$ && lastPart[0] == '$') lastPart = lastPart.substring(1)
        var lastPartToFilter = lastPart
        var forthDelLength = suggestOnlyOnce ? 99999999 : getLastPartEnd(suffixPadded, pad$) - (lastPartPos.inQuote? 1: 0)
        if(prefix[prefix.length - lastPart.length - 1] == '$') addPrefix = ''
        // logger.log('suffix to del', suffix.substr(lastPartPos.inQuote? 1: 0, forthDelLength))
        var paddingSpace = (suffix && suffix[forthDelLength] == ' ') ? '' : ' '
        var suggestions = []
        var subjectAttributeGroup = {
          label: "Subject Attributes",
          suggestions: []
        }
        if ($scope.defaultSubjectPolicyModels) {
          angular.forEach($scope.defaultSubjectPolicyModels, function (subjectComp, index) {
            if(subjectComp.attributes){
              subjectComp.attributes.forEach(function(attr) {
                subjectAttributeGroup.suggestions.push({
                  value: addPrefix + subjectComp.shortName +'.' + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
                  label: attr.shortName,
                  pm: subjectComp.name,
                  backDelete: lastPart.length,
                  forthDelete: forthDelLength
                })
              })
            }
          });

          angular.forEach($scope.defaultSubjectPolicyModels, function (subjectComp, index) {
            if(subjectComp.enrollmentAttributes){
              subjectComp.enrollmentAttributes.forEach(function(attr) {
                subjectAttributeGroup.suggestions.push({
                  value: addPrefix + subjectComp.shortName + '.' + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
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
        if(angular.isUndefined(policyModelId)) angular.forEach(allResourcePM, function(pm) {
          if(pm.type != "SUBJECT") resourceAttributesGroup.suggestions = resourceAttributesGroup.suggestions.concat(pm.attributes.map(function(attr) {
            return {
              value: addPrefix + 'resource.' + (includeResourceModelSN ? pm.shortName + "." : "") + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
              valueForFiltering: addPrefix + 'resource.' + pm.shortName + "." + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
              label: attr.shortName,
              pm: pm.name,
              backDelete: lastPart.length,
              forthDelete: forthDelLength
            }
          }))
        })
        else {
          var pm = allResourcePM[policyModelId]
          if(pm) resourceAttributesGroup.suggestions = pm.attributes.map(function(attr) {
            return {
              value: addPrefix + 'resource.' + (includeResourceModelSN ? pm.shortName + "." : "") + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
              valueForFiltering: addPrefix + 'resource.' + pm.shortName + "." + (quoteShortname ? wrapShortName(attr.shortName) : attr.shortName) + paddingSpace,
              label: attr.shortName,
              pm: pm.name,
              backDelete: lastPart.length,
              forthDelete: forthDelLength
            }
          })
        }
        resourceAttributesGroup.suggestions = $filter('filter')(resourceAttributesGroup.suggestions, lastPartToFilter)
        if(resourceAttributesGroup.suggestions.length) suggestions.push(resourceAttributesGroup)
        deferred.resolve(suggestions)
        return deferred.promise;
      }
    }
    $scope.obligationParamSuggestion = function(policyModelId) {
      return {
        showSuggestions : showSuggestions(false, false, true, true, policyModelId)
      }
    }
    $scope.expressionSuggestion = {
      showSuggestions : showSuggestions(true, true, false)
    }
        // if(!lastLogicPart.length) {
        //   suggestions = getSuggestionForValue()
        //   deferred.resolve(suggestions);
        // } else if (lastPart.length && lastPart[lastPart.length - 1] != ' '){
        //   if('host.'.indexOf(lastPart) == 0) {
        //     suggestions.push({
        //       value: 'host.name ',
        //       backDelete: lastPart.length
        //     }, {
        //       value: 'host.inet_address ',
        //       backDelete: lastPart.length
        //     })
        //   // } else if('environment.'.indexOf(lastPart) == 0) {
        //   //   suggestions.push({
        //   //     value: 'environment.',
        //   //     backDelete: lastPart.length
        //   //   })
        //   } else if('user.'.indexOf(lastPart) == 0 || 'subject.'.indexOf(lastPart) == 0) {
        //     defaultSubjectPolicyModel.attributes.forEach(function(attr) {
        //       suggestions.push({
        //         value: 'user.' + attr.shortName + ' ',
        //         backDelete: lastPart.length
        //       })
        //     })
        //   } else if('resource.'.indexOf(lastPart) == 0) {
        //     var policyModelIds = {}, policyModels = []
        //     angular.forEach($scope.policy.resourceComptsContainer, function(resourceContainer) {
        //       angular.forEach(resourceContainer.resources, function(resource) {
        //         var pmID = resource.data.policy_model_id
        //         if(policyModelIds[pmID]) return;
        //         policyModelIds[pmID] = true
        //         if(policyModelCache[pmID]) suggestions.push({
        //           label: 'resource.' + policyModelCache[pmID].data.shortName,
        //           value: 'resource.' + policyModelCache[pmID].data.shortName + ".",
        //           backDelete: lastPart.length
        //         })
        //       });
        //     });
        //   } else if(lastPart.indexOf('resource.') == 0 ){
        //     angular.forEach(policyModelCache, function(pm) {
        //       var pmSN = 'resource.' + pm.shortName
        //       if(pmSN.indexOf(lastPart) == 0) {
        //         suggestions.push({
        //           value: pmSN + '.',
        //           backDelete: lastPart.length
        //         })
        //       } else {
        //         var pmSNDot = pmSN + '.';
        //         if(pmSNDot == lastPart) {
        //           angular.forEach(pm.attributes,function(attr) {
        //             suggestions.push({
        //               value: attr.shortName + ' ',
        //               backDelete: 0
        //             })
        //           })
        //         } else if (lastPart.indexOf(pmSNDot) == 0) {
        //           var attrSN = lastPart.substring(pmSNDot.length)
        //           angular.forEach(pm.attributes,function(attr) {
        //             if(attr.shortName.indexOf(attrSN) == 0) suggestions.push({
        //               value: attr.shortName + ' ',
        //               backDelete: attrSN.length
        //             })
        //           })
        //         }
        //       }
        //     })
        //   }
        //   deferred.resolve(suggestions)
        // } else {
        //   var operatorFound = false, spaceFound = 0, lastSpacePos = 0, valueFound = false, quoted = false;
        //   var lastLogicPartTrimmed = lastLogicPart;//.trim()
        //   for(var index = 0; index < lastLogicPartTrimmed.length; index++) {
        //     var char = lastLogicPartTrimmed[index]
        //     switch(char) {
        //       case '"':
        //         quoted = !quoted
        //         break;
        //       case ' ':
        //       case '\t':
        //         if(quoted) continue
        //         var oldValueLastSpaceIndex = lastSpacePos
        //         lastSpacePos = index
        //         if(oldValueLastSpaceIndex == index - 1) continue // skip consequent space
        //         spaceFound++;
        //         if(spaceFound > 1) operatorFound = true
        //         break;
        //       case '=':
        //       case '!':
        //       case '<':
        //       case '>':
        //         if(quoted) continue
        //         operatorFound = true
        //         break;
        //       default:
        //         valueFound = operatorFound
        //     }
        //   }
        //   if(valueFound) {
        //     suggestions.push({
        //       value: 'AND '
        //     }, {
        //       value: 'OR '
        //     })
        //     deferred.resolve(suggestions)
        //   } else if(!operatorFound){
        //     logger.log('should have operator here')
        //     var lastLogicPartTrimmed = lastLogicPartTrimmed.trim()
        //     if(lastLogicPartTrimmed.startsWith('user.')) {
        //       var attrSN = lastLogicPartTrimmed.substring('user.'.length)
        //       defaultSubjectPolicyModel.attributes.forEach(function(attr) {
        //         if(attr.shortName == attrSN) angular.forEach(attr.operatorConfigs, function(operator) {
        //           suggestions.push({
        //             value: operator.key.trim() + ' ',
        //           })
        //         })
        //       })
        //     }
        //     else if(lastLogicPartTrimmed.startsWith('resource.')) {
        //       var pmAttrSN = lastLogicPartTrimmed.substring('resource.'.length)
        //       var parts = pmAttrSN.split('.')
        //       if(parts.length == 2) {
        //         var pmSN = parts[0]
        //         var attrSN = parts[1]
        //         angular.forEach(policyModelCache, function(pm) {
        //           if(pmSN != pm.shortName) return
        //           angular.forEach(pm.attributes,function(attr) {
        //             if(attr.shortName != attrSN) return
        //             angular.forEach(attr.operatorConfigs, function(operator) {
        //               suggestions.push({
        //                 value: operator.key.trim() + ' ',
        //               })
        //             })
        //           })
        //         })
        //       }
        //     } else {
        //       suggestions.push({
        //         value: '= ',
        //       }, {
        //         value: '!= ',
        //       })
        //     }
        //   } else {
        //     logger.log("should have value here")
        //     suggestions = getSuggestionForValue()
        //   }
        //   deferred.resolve(suggestions)
        // }

    $scope.getPolicyTags = function(label, filterSelection, callback) {
      tagService.getAllMatchingTags('POLICY_TAG', label).then(function(resp) {
        callback(resp)
      })
    }

    $scope.isSubArray = function (mainArray, subArray) {
      for (var i = 0, length = subArray.length; subArray.length < length; i++) {
        if (!mainArray.includes(subArray[i])) {
          return false;
        }
      }
      return true;
    }

    $scope.findAgents = function (value, filterSelection, callback) {
      if (filterSelection.length > 0) {
        if ($scope.findAgentsCache.length == 0
          || (!$scope.findAgentsPreviousValue || !value.includes($scope.findAgentsPreviousValue))
          || ($scope.findAgentsPreviousTypes.length == 0 || !$scope.isSubArray($scope.findAgentsPreviousTypes, filterSelection))
        ) {
          agentService.findAgents(filterSelection, value).then(function (response) {
            angular.forEach(response.data, function (agent) {
              agent["typeName"] = $scope.getAgentTypeName(agent.type);
              agent["agent"] = true;
            });
            $scope.findAgentsPreviousValue = value;
            $scope.findAgentsPreviousTypes = angular.copy(filterSelection);
            $scope.findAgentsCache = angular.copy(response.data);
            callback(response);
          });
        } else {
          var matchingAgents = { data: [] };
          angular.forEach($scope.findAgentsCache, function (agent) {
            if (agent.host.includes(value) && filterSelection.includes(agent.type)) {
              matchingAgents.data.push(agent);
              callback(matchingAgents);
            }
          });
        }
      } else {
        callback({ data: [] });
      }
    }

    
    $scope.user = 'author'
    $scope.currentRole = 'author'
   
    isWorkflowEnabled()
    $scope.isWorkFlowActive = false
    function isWorkflowEnabled() {
      let isWorkflowEnabled
      configService.getUIConfigs().then(function (uiConfig) {
        isWorkflowEnabled = uiConfig['policy.workflow.enable'];

        if (isWorkflowEnabled === "true") {
          $scope.isWorkFlowActive = true
        } else {
          $scope.isWorkFlowActive = false
        }
      });
    }
    $scope.policyData = null
    $scope.workflowStatus = {}
    $scope.environmentState = {}

    $scope.getPolicyState = function () {
      if ($stateParams.policyId) {
        let deferred = $q.defer();
          policyService.getPolicyWorkflowById($stateParams.policyId, function (policy) {
            deferred.resolve(policy.data);
          })
          return deferred.promise;
      }
  }
    $scope.getWorkFlowState = function () {
      if ($scope.isEditMode) {
        $scope.getPolicyState().then(function (policy) {
          $scope.policyData = policy
          $scope.getPolicyWorkflowStatus(policy)
          $scope.getUser(policy)
          $scope.getPolicyWorkflowEnvironment()
        })
      } else {
        $scope.getPolicyWorkflowEnvironment()
      }
    }

    $scope.getPolicyWorkflowStatus = function (policy) {
      let status = null
      let statusLabel = null

      if (policy.activeWorkflowRequest === null) {
        status = null
        statusLabel = null
      } else if (policy.activeWorkflowRequest.activeWorkflowRequestLevel.status === "PENDING") {
        status = "In Review"
        statusLabel = 'The policy is currently in review.'
      } else if (policy.activeWorkflowRequest.status === "APPROVED") {
        status = "Approved"
        statusLabel = 'The policy has been approved and ready to deploy.'
      } else if (policy.activeWorkflowRequest.activeWorkflowRequestLevel.status === "REQUESTED_AMENDMENT") {
        status = "Amendment"
        statusLabel = 'The policy has been pushed back for changes or amendments.'
      }

      $scope.workflowStatus = {
        status: status,
        statusLabel: statusLabel
      }
    }

    $scope.getUser = function (policy) {
      if (policy.activeWorkflowRequest === null) {
        $scope.user = 'author'
      } else if (policy.activeWorkflowRequest.activeWorkflowRequestLevel && policy.activeWorkflowRequest.activeWorkflowRequestLevel.status === 'PENDING') {
        $scope.user = 'reviewer'
      } else if (policy.activeWorkflowRequest && policy.activeWorkflowRequest.status === 'APPROVED') {
        $scope.user = 'deployer'
      }
    }
    $scope.functionStore = function () {
      return "validateExpressionAndSave(policyForm.val,false)"
    }
    $scope.getPolicyWorkflowEnvironment = function () {
      switch ($scope.user) {
        case 'author':
          $scope.environmentState = {
            role: 'author',
            permission: $scope.permissions.EDIT_POLICY.pageLevel.result,
            buttonLabels: {
              toNext: 'SAVE AND SUBMIT FOR REVIEW',
              save: 'SAVE'
            }
          }
          break;
        case 'reviewer':
          $scope.environmentState = {
            role: 'reviewer',
            permission: $scope.permissions.MANAGE_POLICY_WORKFLOW_LEVEL_1.pageLevel.result,
            buttonLabels: {
              toNext: 'APPROVE',
              toPrevious: 'PUSH BACK TO AUTHOR'
            }
          }
          break;
        case 'deployer':
          $scope.environmentState = {
            role: 'deployer',
            permission: $scope.permissions.DEPLOY_POLICY.pageLevel.result,
            buttonLabels: {
              toNext: 'DEPLOY',
            }
          }
          break;
        default:
          break;
      }
    }

    $scope.getDynamicAttribute = function (permissions) {
      if (permissions.CREATE_POLICY.pageLevel.result) {
        return permissions.CREATE_POLICY.pageLevel.action.ALLOW
      } else if (permissions.EDIT_POLICY.pageLevel.result) {
        return permissions.EDIT_POLICY.pageLevel.action.ALLOW
      } else if (!permissions.CREATE_POLICY.pageLevel.result) {
        return permissions.CREATE_POLICY.pageLevel.action.DENY
      } else if (!permissions.EDIT_POLICY.pageLevel.result) {
        return permissions.EDIT_POLICY.pageLevel.action.DENY
      }
    }

    $scope.validateExpressionAndPerformAction = function (frm, approve) {
      if ($scope.environmentState.role === "reviewer") {
        if (approve) {
          $scope.approvePolicy()
        } else {
          $scope.returnPolicy()
        }
        return null
      } 
      $scope.validateExpression($scope.policy.expression, function (isValid) {
      if (isValid) {
          if ($scope.environmentState.role === "deployer") {
            if ($scope.policyData.status) {
              $scope.saveAndDeployPolicyWorkflow(frm, false, true);
            } else if (!$scope.policyData.status) {
              dialogService.notifyWithoutBlocking({
              msg:  $filter('translate')('policy.workflow.need.approve'),
                timeout: 5000
              })
            }
          }
          if ($scope.environmentState.role !== "deployer") {
            $scope.saveAndDeployPolicyWorkflow(frm, true, false);
          }
        }
      })
    }

    $scope.approvePolicy = function () {
      dialogService.confirm({
        msg: $filter('translate')('policy.workflow.confirm.approve'),
        confirmLabel: $filter('translate')('Approve'),
        ok: function () {
          policyService.approvePolicyWorkflow($scope.policy.id).then(function () {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('policy.workflow.approved'),
              timeout: 5000
            })
            $state.reload()
          })
        }
      })
    };

    $scope.returnPolicy = function () {
      dialogService.confirm({
        msg: $filter('translate')('policy.workflow.confirm.return'),
        confirmLabel: $filter('translate')('PS.OK'),
        ok: function () {
          policyService.returnPolicyWorkflow($scope.policy.id).then(function () {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('policy.workflow.amendment'),
              timeout: 5000
            })
            $state.reload()
          })
        }
      })
    };

    $scope.saveAndDeployPolicyWorkflow = function (frm, save, deploy) {
      $scope.validateEffectiveTime(function (isValid) {
        frm.$invalid = !isValid;
        $scope.policyForm.val.policyValidityTo.$setValidity("effectivePeriod", isValid);
      });
      if (frm.$invalid) {
        frm.$setDirty()
        for (var field in frm) {
          if (field[0] == '$')
            continue
          frm[field].$touched = true
        }
        $scope.policy.showValidationMessages = true
        $scope.$broadcast('scrollto')
        return
      }
      preparePolicyPayload()
      policyPayload.skipValidate = true
      var saveAction = save ?
        $scope.isEditMode ?
          policyService.modifyPolicy : 
          (policyPayload.parentId ?
            policyService.saveSubPolicy :
            policyService.savePolicy)
        : function (payload, callback) {
          callback({
            data: payload.id,
            deployOnly: true
          });
        };
      saveAction(policyPayload, function (response) {
        frm.$setPristine()
        $scope.policy.id = response.data
        if (!response.deployOnly) {
          $state.current.name == 'PolicyStudio.editPolicy' ? $state.reload() : $scope.editPolicy($scope.policy);
        }
        if (!$scope.policyData || !$scope.policyData.activeWorkflowRequest || $scope.policyData.activeWorkflowRequest && $scope.policyData.activeWorkflowRequest.activeWorkflowRequestLevel.status === "REQUESTED_AMENDMENT") {
          policyService.submitPolicy($scope.policy.id).then(function () {
            $state.reload()
          })
        } else {
          if (deploy) {
            policyService.deploy([$scope.policy.id], true, save, null, function () {
              frm.$setPristine()
              $state.current.name == 'PolicyStudio.editPolicy' ? $state.reload() : $scope.editPolicy($scope.policy)
            })
          } else {
            dialogService.notifyWithoutBlocking({
              msg: $filter('translate')('createpolicy.saved.notify'),
              backLink: "PolicyStudio.Policies",
              backLabel: $filter('translate')('BACK TO POLICY LIST')
            })
          }
        }
      })
    }

    //comments
    $scope.isPanelActive = false
    $scope.isPanelVisible = false

    $scope.closeCommentPanel = function () {
      
      $scope.isPanelActive = false
      setTimeout(function () {
        $scope.isPanelVisible = false;
        $scope.$digest()
      }, 1000);
    }

    $scope.showCommentPanel = function () {
    searchComments()
      $scope.isPanelActive = true
      $scope.isPanelVisible = true
    }

    $scope.isSelectViewActive = false
    $scope.commentViews = ['All', 'Generic', 'Amendment']
    $scope.showViews = function () {
      $scope.isSelectViewActive = !$scope.isSelectViewActive
    }


    $scope.selectedCommentType = {}
    $scope.selectedCommentType.value = "generic"

    // $scope.filterComments = function () {
    //   let radioVal = document.querySelector('input[name="commentTypeRadio"]:checked').value;
    //   console.log(radioVal)
    // }

    let commentPayload = {
      workflowRequestId: null,
      content: null,
      createdDate: null,
      ownerDisplayName: null
    }

    $scope.currentUser = null
    userService.getCurrentUserProfile(function(res){
      $scope.currentUser = res.data
    });
    
    $scope.sendComment = function (comment) {
      let workflowRequestId = $scope.policyData.activeWorkflowRequest.id
      commentPayload.workflowRequestId = workflowRequestId
      commentPayload.content = comment
    
      if(comment){
        policyService.addComment(commentPayload).then( function(resp){
          let date = new Date();
          let currentTime = date.getTime();
          let newComment = angular.copy(commentPayload = {
            content: comment,
            createdDate: currentTime,
            ownerDisplayName: $scope.currentUser.displayName
          })
          $scope.comments.splice(0, 0, newComment)
        })

        document.getElementById("ta-comment-content").value = "";

        let pristineCounter = 0
        angular.forEach($scope.policyForm.val.$$controls, function (control) {
          if (!control.$pristine) {
            pristineCounter++
          }
        })
        if (pristineCounter === 1) $scope.policyForm.val.$setPristine()
      }
    }

    let searchCommentBody = {
      criteria: {
        fields: [{
          field: "workflowRequestId",
          type: "SINGLE_EXACT_MATCH",
          value: {
            type: "String",
            value: null
          }
        }
        ],
        sortFields: [{
          field: "createdDate",
          order: "DESC"
        }
        ],
        pageNo: 0,
        pageSize: 20
      }
    }

    $scope.comments = []
    function searchComments (){
      let workflowRequestId = $scope.policyData.activeWorkflowRequest.id
      angular.forEach(searchCommentBody.criteria.fields, function(field){
        field.value.value = workflowRequestId
      })
      policyService.getComments(searchCommentBody).then(function(comments){
        $scope.comments = comments.data
      })
    }

    $scope.getFirstLetter = function (displayName) {
      return displayName ? displayName.charAt(0) : 'U'
    }

    $scope.isSubPolicyNotApproved = false
    getRootHierachy()
    function getRootHierachy(){
      if($stateParams.policyId){
        policyService.getPolicyHierarchy($stateParams.policyId, function (data) {
          let rootHierarchy = data.data;
          getNestedDraftSubPolicies(rootHierarchy)
        });
      }
    }
    let totalPendingHierachy = []
    function getNestedDraftSubPolicies(policyTree) {
      let childs = policyTree.childNodes.filter(function (child) {
        return child.activeEntityWorkflowRequestStatus === "PENDING" 
      })
      totalPendingHierachy = totalPendingHierachy.concat(childs)
      if (policyTree.childNodes.length) {
        angular.forEach(policyTree.childNodes, function (child) {
          getNestedDraftSubPolicies(child)
        })
      }
    }
 
    $scope.childIsNotApproved = false
    $scope.childToBeApproved = []
    $scope.isPolicyReadyForDeployment = function () {
      let currentPolicyIndex
      let currentPolicy 
      if (!$scope.childIsNotApproved) {
          for (let index = 0; index < totalPendingHierachy.length; index++) {
            let policy = totalPendingHierachy[index];
            if ($scope.policy.id === policy.id) {
              currentPolicyIndex = index
              currentPolicy = policy
            }
            if (index > currentPolicyIndex) {
              if (currentPolicy.childNodes.length) {
                if ($scope.environmentState.role === "reviewer" && policy.activeEntityWorkflowRequestStatus === "PENDING") {
                  angular.forEach(currentPolicy.childNodes, function(child){
                    if(child.id === policy.id){
                      $scope.childIsNotApproved = true
                      $scope.childToBeApproved.push(policy)
                    }
                  })
                }
              }
            }
          }
      }
      return $scope.childIsNotApproved
    }
  }
]);
