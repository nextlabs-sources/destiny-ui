policyStudio.controller('createEnrollmentController', ['$scope', '$q', 'toolEnrollmentService', 'loggerService', '$anchorScroll', '$stateParams', 'dialogService',
  '$filter', '$state', '$rootScope', 'propertyManagerService', 'userManualTranslateService',
  function ($scope, $q, toolEnrollmentService, loggerService, $anchorScroll, $stateParams, dialogService, $filter,
    $state, $rootScope, propertyManagerService, userManualTranslateService) {
    'use strict';
    
    $scope.$parent.transition = "fade-in";
    $scope.$parent.$parent.isCreatePage = true;

    $scope.showUserManual = {};
    $scope.userManualOption = {
      app: 'Enrollment Management',
      section: 'Enrollment Manager',
      page: 'Create Enrollment'
    }
    $scope.pageOptionList = null;
    userManualTranslateService.pageOptionList($scope.userManualOption, function (pageOptionList) {
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

    $scope.closeAllUserManual = function () {
      angular.forEach($scope.showUserManual, function (value, key) {
        $scope.showUserManual[key] = false
      });
    }

    $scope.connectionTestSuccessful = false;

    $scope.currentDataSource = null
    $scope.dataSources = [
      { name: 'Active Directory', value: 'ACTIVE_DIRECTORY' },
      { name: 'Azure', value: 'AZURE_ACTIVE_DIRECTORY' },
      { name: 'LDIF', value: 'LDIF' },
      { name: 'Portal', value: 'SHAREPOINT' }
    ]
    $scope.currentDataSource = $scope.dataSources[0]

    $scope.currentPortalType = null
    $scope.portalTypes = [
      { name: 'SharePoint', value: 'SHAREPOINT' },
    ]
    $scope.currentPortalType = $scope.portalTypes[0]

    $scope.adProperties = {};
    $scope.ldifProperties = {};
    $scope.portalProperties = {};
    $scope.azureProperties = {};

    $scope.otherRequirementsCheckbox = {
      $checked: false
    }
    $scope.structuralGroupCheckbox = {
      $checked: false
    }


    var getPropertiesGroup = function () {
      let propertiesGroup = null
      switch ($scope.currentDataSource.value) {
        case 'ACTIVE_DIRECTORY':
          propertiesGroup = $scope.adProperties
          break;
        case 'LDIF':
          propertiesGroup = $scope.ldifProperties
          break;
        case 'AZURE_ACTIVE_DIRECTORY':
          propertiesGroup = $scope.azureProperties
          break;
        default:
          break;
      }
      return propertiesGroup
    }
    $scope.initialiseEnrollmentProperties = function () {
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        $scope.initialiseProperties("server", "ST", "");
        $scope.initialiseProperties("port", "NM", "389");
        $scope.initialiseProperties("login", "ST", "");
        $scope.initialiseProperties("password", "ST", "");
        $scope.initialiseProperties("roots", "SA", "");
        $scope.initialiseProperties("user.requirements", "ST", "(&(objectClass=user)(!(objectClass=computer)))");
        $scope.initialiseProperties("computer.requirements", "ST", "objectClass=computer");
        $scope.initialiseProperties("structure.requirements", "ST", "");
        $scope.initialiseProperties("always.trust.ad", "ST", false);
        $scope.initialiseProperties("filter", "ST", "objectclass=*");
        $scope.initialiseProperties("scheduledsyncinterv", "NM", "0");
        $scope.initialiseProperties("enroll.users", "ST", true);
        $scope.initialiseProperties("enroll.contacts", "ST", false);
        $scope.initialiseProperties("contact.requirements", "ST", "objectClass=contact");
        $scope.initialiseProperties("enroll.computers", "ST", false);
        $scope.initialiseProperties("enroll.groups", "ST", false);
        $scope.initialiseProperties("group.requirements", "ST", "objectClass=Group");
        $scope.initialiseProperties("group.attributefor.enumeration", "ST", "member");
        $scope.initialiseProperties("ispagingenabled", "ST", true);
	    	$scope.initialiseProperties("enableaddirchgreplication", "ST", false);
        $scope.initialiseProperties("other.requirements", "ST", "(|(objectClass=serviceConnectionPoint)(objectClass=connectionPoint))");
        $scope.initialiseProperties("delete.inactive.group.members", "ST", false);
        $scope.initialiseProperties("entry.attributefor.staticid", "ST", "objectGUID");
        $scope.initialiseProperties("store.missing.attributes", "ST", true);
        $scope.initialiseProperties("scheduledsynctime", "NM", "");
        $scope.initialiseProperties("secure.transport.mode", "ST", false);
      } else if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        $scope.initialiseProperties("azure-oauth-authority", "ST", "");
        $scope.initialiseProperties("tenant", "ST", "");
        $scope.initialiseProperties("application-id", "ST", "");
        $scope.initialiseProperties("application-key", "ST", "");
        $scope.initialiseProperties("enroll.users", "ST", true);
        $scope.initialiseProperties("enroll.groups", "ST", false);
        $scope.initialiseProperties("scheduledsyncinterv", "NM", "0");
        $scope.initialiseProperties("store.missing.attributes", "ST", false);
      } else if ($scope.currentDataSource.value === 'SHAREPOINT') {
        $scope.initialiseProperties("domain", "ST", "");
        $scope.initialiseProperties("login", "ST", "");
        $scope.initialiseProperties("password", "ST", "");
        $scope.initialiseProperties("portals", "SA", "");
        $scope.initialiseProperties("scheduledsynctime", "NM", "");
        $scope.initialiseProperties("scheduledsyncinterv", "NM", "0");

        // $scope.initialiseProperties("PortalType", "SA", "SharePoint");
      } else if ($scope.currentDataSource.value === 'LDIF') {
        $scope.initialiseProperties("ldif.remove.ldif.when.deleting.enrollment", "ST", true);
        $scope.initialiseProperties("scheduledsyncinterv", "NM", "0");
        $scope.initialiseProperties("scheduledsynctime", "NM", "");
        $scope.initialiseProperties("ldif.filename", "ST", "");
        $scope.initialiseProperties("enroll.users", "ST", true);
        $scope.initialiseProperties("user.requirements", "ST", "objectClass=User");
        $scope.initialiseProperties("enroll.contacts", "ST", false);
        $scope.initialiseProperties("contact.requirements", "ST", "objectClass=contact");
        $scope.initialiseProperties("enroll.groups", "ST", false);
        $scope.initialiseProperties("group.requirements", "ST", "objectClass=Group");
        $scope.initialiseProperties("enroll.computers", "ST", false);
        $scope.initialiseProperties("computer.requirements", "ST", "(dnsHostName=*)");
        $scope.initialiseProperties("enroll.applications", "ST", false);
        $scope.initialiseProperties("application.requirements", "ST", "objectClass=Application");
        $scope.initialiseProperties("structure.requirements", "ST", "");
        $scope.initialiseProperties("entry.attributefor.staticid", "ST", "objectGUID");
        $scope.initialiseProperties("delete.inactive.group.members", "ST", false);
        $scope.initialiseProperties("store.missing.attributes", "ST", false);
        $scope.initialiseProperties("group.ismemberfromallenrollment", "ST", false);
        $scope.initialiseProperties("group.memberattributekey", "ST", "");
        $scope.initialiseProperties("other.requirements", "ST", "(|(objectClass=serviceConnectionPoint)(objectClass=connectionPoint))");
        $scope.initialiseProperties("group.attributefor.enumeration", "ST", "member");
      }
    }

    $scope.initialiseProperties = function (name, type, value) {
      let property
      switch ($scope.currentDataSource.value) {
        case 'ACTIVE_DIRECTORY':
          property = $scope.adProperties
          break;
        case 'LDIF':
          property = $scope.ldifProperties
          break;
        case 'SHAREPOINT':
          property = $scope.portalProperties
          break;
        case 'AZURE_ACTIVE_DIRECTORY':
          property = $scope.azureProperties
          break;
        default:
          break;
      }

      property[name] = $scope.getEmptyProperty();
      property[name].name = name;
      property[name].type = type;
      property[name].value = value;
    }

    $scope.getEmptyProperty = function () {
      return {
        id: null,
        version: null,
        name: '',
        shortName: '',
        label: '',
        type: '',
        value: null
      }
    }
    $scope.initialiseEnrollmentProperties();

    $scope.portals = ['']
    $scope.addEmptyPortal = function () {
      $scope.portals.push('')
    }

    $scope.deletePortal = function (index) {
      $scope.portals.splice(index, 1)
    }

    $scope.roots = ['']
    $scope.addEmptyRoot = function () {
      $scope.roots.push('')
    }

    $scope.deleteRoot = function (index) {
      $scope.roots.splice(index, 1)
    }

    $scope.enrollment = {
      id: null,
      name: '',
      description: '',
      values: $scope.values,
      version: null,
      status: null,
      created: false
    }

    $scope.isEditMode = angular.isDefined($stateParams.taskId);
    $scope.enrollment.id = $stateParams.taskId;
    $scope.enrollment.toolId = $stateParams.toolId;
    $scope.toolName = $stateParams.toolName;

    $scope.fieldMap = {
      STR: "text",
      PSW: "password",
      FIL: "textarea",
      DPD: "select"
    }

    $scope.currentValue = '';

    var logger = loggerService.getLogger();

    $scope.enrollmentForm = {
      val: null,
    }

    var buttonListForBackToList = [{
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-discard',
      onClick: function (callback) {
        callback && callback();
      }
    }, {
      label: $filter('translate')('BACK TO ENROLLMENT LIST'),
      class: 'cc-btn-primary',
      onClick: function (callback) {
        $scope.enrollmentForm.val.$setPristine();
        $state.go('PolicyStudio.Task', {
          toolId: $scope.enrollment.toolId
        });
        callback && callback();
      }
    }];

    $scope.backToEnrollmentList = function (frm) {
      if (frm.$pristine) {
        $scope.enrollmentForm.val.$setPristine();
        $state.go("PolicyStudio.Task", {
          toolId: $scope.enrollment.toolId,
          toolName: $scope.toolName
        });
      } else {
        dialogService.confirm({
          msg: $filter('translate')('toolManagement.createTask.discardConfirmation'),
          buttonList: buttonListForBackToList
        });
      }
    };

    $scope.setDirty = function (frm) {
      frm.$setDirty();
    }

    $rootScope.immediateStateChange = function () {
      return $scope.enrollmentForm.val.$pristine;
    }

    $rootScope.stateChangeHook = function (state) {
      dialogService.confirm({
        msg: $filter('translate')('common.discard.confirm'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function () {
          $scope.enrollmentForm.val.$setPristine();
          $state.go(state.name, state.params)
        },
        cancel: function () {
          delete $state.current.params.$force;
        }
      })
    }

    var currentTarget = 'taskInformation';
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

    $scope.setField = function (attribute) {
      var field = {};
      field.name = attribute.name.toLowerCase();
      field.type = "ST";
      field.value = attribute.value;
      field.id = attribute.id
      field.version = attribute.version
      return field;
    }

    var getEnrollmentPayloadValues = function () {
      let payloadValues = [];
      prepareEntityFilter()
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        var adPropertiesPayload = angular.copy($scope.adProperties)
        angular.forEach(adPropertiesPayload, function (field) {
          if (field.name === 'roots') {
            let rootVal = $scope.roots.filter(function (root) {
              return root !== null && root !== ''
            }).join(":");
            field.value = ':' + rootVal + ':'
          }
          if (field.name === 'scheduledsyncinterv') {
            field.value = $scope.syncOn ? prepareIntervalValue() : '0'
          }
          if (field.name === 'scheduledsynctime') {
            field.value = $scope.syncOn ? prepareSyncTime() : '0'
          }
          field.value = parseToString(field.value);
          if (!isPropertyAttribute(field)) {
            payloadValues.push(field);
          }
        });
      }
      if ($scope.currentDataSource.value === 'LDIF') {
        var ldifPropertiesPayload = angular.copy($scope.ldifProperties)
        angular.forEach(ldifPropertiesPayload, function (field) {
          if (field.name === 'scheduledsyncinterv') {
            field.value = $scope.syncOn ? prepareIntervalValue() : '0'
          }
          if (field.name === 'scheduledsynctime') {
            field.value = $scope.syncOn ? prepareSyncTime() : '0'
          }
          field.value = parseToString(field.value);
          if (!isPropertyAttribute(field)) payloadValues.push(field);
        });
      }

      if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        var azurePropertiesPayload = angular.copy($scope.azureProperties)
        angular.forEach(azurePropertiesPayload, function (field) {
          if (field.name === 'scheduledsyncinterv') {
            field.value = $scope.syncOn ? prepareIntervalValue() : '0'
          }
          if (field.name === 'scheduledsynctime') {
            field.value = $scope.syncOn ? prepareSyncTime() : '0'
          }
          field.value = parseToString(field.value);
          if (!isPropertyAttribute(field)) payloadValues.push(field);
        });
      }

      if ($scope.currentDataSource.value === 'SHAREPOINT') {
        var portalPropertiesPayload = angular.copy($scope.portalProperties)
        angular.forEach(portalPropertiesPayload, function (field) {
          if (field.name === 'portals') {
            let rootVal = $scope.portals.map(function(portal){
              let escPortal = portal.replace(/(?<!\\):/, '\\:')
              return escPortal
            }).filter(function (root) {
              return root !== null && root !== ''
            }).join(":");
            field.value = ':' + rootVal + ':'
          }
          if (field.name === 'scheduledsyncinterv') {
            field.value = $scope.syncOn ? prepareIntervalValue() : '0'
          }
          if (field.name === 'scheduledsynctime') {
            field.value = $scope.syncOn ? prepareSyncTime() : '0'
          }
          field.value = parseToString(field.value);
          payloadValues.push(field);
        });
      }

      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        if ($scope.entities["user"].$checked === true) {
          $scope.adProperties["enroll.users"].value = 'true';
          angular.forEach($scope.entities["user"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          $scope.adProperties["enroll.users"].value = 'false'
          payloadValues = removeRequirements(payloadValues, 'user.requirements')
        }
        if ($scope.entities["contact"].$checked === true) {
          $scope.adProperties["enroll.contacts"].value = 'true';
          angular.forEach($scope.entities["contact"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          $scope.adProperties["enroll.contacts"].value = 'false'
          payloadValues = removeRequirements(payloadValues, 'contact.requirements')
        }
        if ($scope.entities["computer"].$checked === true) {
          $scope.adProperties["enroll.computers"].value = 'true';
          angular.forEach($scope.entities["computer"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          $scope.adProperties["enroll.computers"].value = 'false'
          payloadValues = removeRequirements(payloadValues, 'computer.requirements')
        }
        if ($scope.entities["group"].$checked === true) {
          $scope.adProperties["enroll.groups"].value = 'true';
        } else {
          $scope.adProperties["enroll.groups"].value = 'false'
          payloadValues = removeRequirements(payloadValues, 'group.requirements')
        }
      }

      if ($scope.currentDataSource.value === 'LDIF') {
        if ($scope.ldifEntities["user"].$checked === true) {
          $scope.ldifProperties["enroll.users"].value = 'true';
          angular.forEach($scope.ldifEntities["user"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          payloadValues = removeRequirements(payloadValues, 'user.requirements')
          $scope.ldifProperties["enroll.users"].value = 'false'
        }

        if ($scope.ldifEntities["contact"].$checked === true) {
          $scope.ldifProperties["enroll.contacts"].value = 'true';
          angular.forEach($scope.ldifEntities["contact"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          payloadValues = removeRequirements(payloadValues, 'contact.requirements')
          $scope.ldifProperties["enroll.contacts"].value = 'false'
        }

        if ($scope.ldifEntities["computer"].$checked === true) {
          $scope.ldifProperties["enroll.computers"].value = 'true';
          angular.forEach($scope.ldifEntities["computer"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          payloadValues = removeRequirements(payloadValues, 'computer.requirements')
          $scope.ldifProperties["enroll.computers"].value = 'false'
        }

        if ($scope.ldifEntities["application"].$checked === true) {
          $scope.ldifProperties["enroll.applications"].value = 'true';
          angular.forEach($scope.ldifEntities["application"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          payloadValues = removeRequirements(payloadValues, 'application.requirements')
          $scope.ldifProperties["enroll.applications"].value = 'false'
        }

        if ($scope.ldifEntities["group"].$checked === true) {
          $scope.ldifProperties["enroll.groups"].value = 'true';
        } else {
          payloadValues = removeRequirements(payloadValues, 'group.requirements')
          $scope.ldifProperties["enroll.groups"].value = 'false'
        }
      }

      if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        if ($scope.azureEntities["user"].$checked === true) {
          $scope.azureProperties["enroll.users"].value = 'true';
          angular.forEach($scope.azureEntities["user"].attributeList, function (attribute) {
            payloadValues.push($scope.setField(attribute));
          });
        } else {
          payloadValues = removeRequirements(payloadValues, 'user.requirements')
          $scope.azureProperties["enroll.users"].value = 'false'
        }
        if ($scope.azureEntities["group"].$checked === true) {
          $scope.azureProperties["enroll.groups"].value = 'true';
        } else {
          $scope.azureProperties["enroll.groups"].value = 'false'
        }
      }
      let finalPayloadValues = []
      angular.forEach(payloadValues, function (value) {
        if (value.name === 'scheduledsynctime' && value.value === '0') {
          null
        } else if (value.name === 'secure.transport.mode') {
          if (value.value === 'true') {
            value.value = 'SSL'
            finalPayloadValues.push(value)
          }
        } else {
          finalPayloadValues.push(value)
        }
      })
      return finalPayloadValues
    }

    var removeRequirements = function (payloadValues, requirementName) {
      let x = 0
      angular.forEach(payloadValues, function (value) {
        if (value.name === requirementName) {
          payloadValues.splice(x, 1)
        }
        x++
      })
      return payloadValues
    }

    $scope.getAdProperties = function (values) {
      $scope.adProperties = {};
      $scope.initialiseProperties("secure.transport.mode", "ST", false);
      angular.forEach(values, function (value) {
        if(value.name === 'secure.transport.mode'){
          if(value.value !== "SSL"){
            value.value = false
          } else {
            value.value = true
          }
        } else if (value.name === 'scheduledsyncinterv') {
          if (value.value !== '0') {
            $scope.onSyncChange(true)
            convertSyncInterval(value.value)
            $scope.adProperties[value.name] = value
          } else $scope.onSyncChange(false)
        } else if (value.name === 'scheduledsynctime') {
          $scope.adProperties[value.name] = value
          getSyncTime(value)
          getSyncDate(value)
        } else if (value.name === 'roots') {
          let filteredValue = value.value.substring(1, value.value.length - 1);
          let splitedValue = filteredValue.split(":")
          $scope.roots = splitedValue
        }
        value.value = parseToBool(value.value);
        $scope.adProperties[value.name] = value;
      })
      getEntityFilter()
    }

     $scope.getldifProperties = function (values) {
      $scope.ldifProperties = {};
      angular.forEach(values, function (value) {
       if (value.name === 'scheduledsyncinterv') {
         if (value.value !== '0') {
           $scope.onSyncChange(true)
           convertSyncInterval(value.value)
           $scope.ldifProperties[value.name] = value
         } else {
           $scope.onSyncChange(false)
         }
       } else if (value.name === 'scheduledsynctime') {
         $scope.ldifProperties[value.name] = value
         getSyncTime(value)
         getSyncDate(value)
      }
        value.value = parseToBool(value.value);
        $scope.ldifProperties[value.name] = value;
      })
      getEntityFilter()
    }

    $scope.getAzureProperties = function (values) {
      $scope.azureProperties = {};
      angular.forEach(values, function (value) {
        if (value.name === 'scheduledsyncinterv') {
          if (value.value !== '0') {
            $scope.onSyncChange(true);
            convertSyncInterval(value.value)
            $scope.azureProperties[value.name] = value;
          } else {
            $scope.onSyncChange(false);
          }
        } else if (value.name === 'scheduledsynctime') {
          $scope.azureProperties[value.name] = value
          getSyncTime(value)
          getSyncDate(value)
        }
        value.value = parseToBool(value.value);
        $scope.azureProperties[value.name] = value;
      })
      getEntityFilter();
    }

    $scope.getPortalProperties = function (values) {
      $scope.portalProperties = {};
      angular.forEach(values, function (value) {
        if (value.value === 'true') {
          value.value = true
          $scope.portalProperties[value.name] = value;
        } else if (value.value === 'false') {
          value.value = false
          $scope.portalProperties[value.name] = value;
        } else if (value.name === 'scheduledsyncinterv') {
          if (value.value !== '0') {
            $scope.onSyncChange(true)
            convertSyncInterval(value.value)
            $scope.portalProperties[value.name] = value
          } else $scope.onSyncChange(false)
        } else if (value.name === 'scheduledsynctime') {
          $scope.portalProperties[value.name] = value
          getSyncTime(value)
          getSyncDate(value)
        } else if (value.name === 'portals') {
          let filteredValue = value.value.substring(1, value.value.length - 1);
          let splitedValue = filteredValue.split(/(?<!\\):/).map(function(value) { return value.replace(/\\:/, ':') });
          $scope.portals = splitedValue
        }
        $scope.portalProperties[value.name] = value;
      })
    }

    var convertSyncInterval = function (value) {
      let intervalValue = Number(value)
      if (intervalValue > 59) {
        $scope.syncInterval.value = intervalValue / 60
        $scope.syncInterval.unit = $scope.timeUnits[1]
      } else {
        $scope.syncInterval.value = intervalValue
        $scope.syncInterval.unit = $scope.timeUnits[0]
      }
    } 

    var getSyncTime = function (value) {
      let time = new Date(Number(value.value))
      let hour = time.getHours()
      let minute = time.getMinutes()
      if (hour === 12) {
        $scope.syncTime.format = 'PM'
      } else if (hour > 12) {
        $scope.syncTime.format = 'PM'
        hour = hour - 12
      } else if (hour === 0) {
        hour = 12
        $scope.syncTime.format = 'AM'
      }
      $scope.syncTime.hour = hour
      $scope.syncTime.minute = minute
    }

    var getSyncDate = function (value) {
      let time = new Date(Number(value.value))
      let date = time.getDate()
      let month = time.getMonth()
      let year = time.getFullYear()

      $scope.enrollmentStartDate.from.date = new Date()
      $scope.enrollmentStartDate.from.date.setDate(date)
      $scope.enrollmentStartDate.from.date.setMonth(month)
      $scope.enrollmentStartDate.from.date.setFullYear(year)
    }


    var getEnrollmentPayload = function () {
      loggerService.getLogger().log('enrollment:', $scope.enrollment);
      var enrollmentPayload = {};
      enrollmentPayload.id = $scope.enrollment.id;
      enrollmentPayload.toolId = $scope.enrollment.toolId;
      enrollmentPayload.name = $scope.enrollment.name;
      enrollmentPayload.type = $scope.currentDataSource.value
      enrollmentPayload.description = $scope.enrollment.description;
      enrollmentPayload.status = $scope.enrollment.status;
      enrollmentPayload.version = $scope.enrollment.version;
      enrollmentPayload.created = $scope.enrollment.created;
      enrollmentPayload.values = getEnrollmentPayloadValues();
      return enrollmentPayload;
    }

    var prepareIntervalValue = function () {
      let intervalVal
      if ($scope.syncInterval.unit.value === 'hour') {
        intervalVal = $scope.syncInterval.value * 60
      } else {
        intervalVal = $scope.syncInterval.value
      }
      return intervalVal
    }
    
    let currentDate = new Date()
    $scope.enrollmentStartDate = {
      from: {
        popupOpen: false,
        date: null,
        minDate: currentDate 
      }
    }
    $scope.enrollmentStartDate.from.date = new Date()
    $scope.enrollmentStartDate.from.date.setHours(0)
    $scope.enrollmentStartDate.from.date.setMinutes(0)
    $scope.enrollmentStartDate.from.date.setSeconds(0)

    var prepareSyncTime = function () {
      let syncTimeVal
      let hour = angular.copy($scope.syncTime.hour)
      if ($scope.syncTime.format === 'AM' && $scope.syncTime.hour === 12) {
        hour = 0
      }
      if ($scope.syncTime.format === 'PM' && hour === 12) {
        null
      } else if ($scope.syncTime.format === 'PM') { hour = hour + 12 }

      $scope.enrollmentStartDate.from.date.setHours(hour)
      $scope.enrollmentStartDate.from.date.setMinutes($scope.syncTime.minute)
      $scope.enrollmentStartDate.from.date.setSeconds(0)
      syncTimeVal = $scope.enrollmentStartDate.from.date.getTime()

      return syncTimeVal
    }

    $scope.editEnrollment = function (enrollment) {
      $state.go('PolicyStudio.editEnrollment', {
        taskId: enrollment.id
      });
    }
    $scope.save = function () {
      $scope.validateEnrollment(function () {
        toolEnrollmentService.saveEnrollment(getEnrollmentPayload(), function (response) {
          if (response && response.statusCode != '1000') {
            dialogService.notify({
              msg: $filter('translate')(response.data ? response.data.statusMessage : response.message),
            });
          } else {
            $scope.enrollmentForm.val.$setPristine();
            $scope.enrollment.id = response.data;
            $scope.enrollmentForm.val.$setPristine()
            $state.current.name == 'PolicyStudio.editEnrollment' ? $state.reload() : $scope.editEnrollment($scope.enrollment);
            displaySavedNotification()
          }
        })
      })
    }

    var uiValidation = function (frm) {
      $scope.saveExecuted = false
      $scope.getCheckedStatus()
      $scope.saveExecuted = true
      if (frm.$invalid) {
        $scope.scrollTo(frm.$error.required[0].$$attr.id)
        return false
      }
      if ($scope.currentDataSource.value === 'LDIF') {
          return true
      }
      if (!$scope.checked && $scope.currentDataSource.value !== 'SHAREPOINT') {
        if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') $scope.scrollTo('ad-enrollment-entities')
        if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') $scope.scrollTo('azure-enrollment-entities')
        if ($scope.currentDataSource.value === 'LDIF') $scope.scrollTo('ldif-enrollment-entities')
        return false
      }
      return true
    }

    $scope.validateEnrollment = function(callback) {
      $scope.testConnectionExecuted = true
      $scope.connectionTestSuccessful = false;
      if(!uiValidation($scope.enrollmentForm.val)){
        return null
      }
      toolEnrollmentService.validateEnrollment(getEnrollmentPayload(), function (response) {
        $scope.connectionTestSuccessful = true;
        callback && callback();
      });
    }

    function displaySavedNotification() {
      dialogService.notifyWithoutBlocking({
        msg: $filter('translate')('toolManagement.createTask.savedNotify'),
        backLink: "PolicyStudio.Task({toolId:'" + $scope.enrollment.toolId + "'})",
        backLabel: $filter('translate')('BACK TO ENROLLMENT LIST')
      });
    }

    let checkFileUpload = function () {
      let file = document.getElementById('input-enrollment-ldif-fileUploadExtra').files[0];
      if (file) {
        return true
      } else return false
    }

    var getEnrollment = function () {
      toolEnrollmentService.findEnrollmentById($stateParams.taskId, function (response) {
        $scope.setEnrollment(response)
      });
    }
    var copyPropertyArray = function (arr) {
      let newArr = []
      angular.forEach(propertiesName, function (property) {
        if (isMainEntity(property)) {
          newArr[property] = []
          angular.forEach(arr[property], function (obj) {
            let newObj = angular.copy(obj)
            newArr[property].push(newObj)
          })
        }
      })
      return newArr
    }

    $scope.setDefaultAttributeList = function (propertylist) {
      let values = copyPropertyArray(propertylist)
      $scope.clearAttributeList()
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        let attrAD = []
        angular.forEach(Object.keys(values), function (key) {
          angular.forEach(values[key], function (value) {
            if (value.name in $scope.adDefaultAttributes) {
              attrAD = value;
              attrAD.value = $scope.adDefaultAttributes[value.name];
              if ($scope.adMandatoryAttributes.indexOf(value.name.toLowerCase()) != -1) {
                attrAD.mandatory = true;
              }
              if ($scope.isEditMode) {
                if (!$scope.entities[key].$checked) $scope.entities[key].attributeList.push(attrAD)
              } else $scope.entities[key].attributeList.push(attrAD)
            }
          });
        })
      } else if ($scope.currentDataSource.value === 'LDIF') {
        let attrsLDIF = []
        angular.forEach(Object.keys(values), function (key) {
          angular.forEach(values[key], function (value) {
            if (value.name in $scope.ldifDefaultAttributes) {
              attrsLDIF = value;
              attrsLDIF.value = $scope.ldifDefaultAttributes[value.name];
              if ($scope.ldifMandatoryAttributes.indexOf(value.name.toLowerCase()) != -1) {
                attrsLDIF.mandatory = true;
              }
              if ($scope.isEditMode) {
                if (!$scope.ldifEntities[key].$checked) $scope.ldifEntities[key].attributeList.push(attrsLDIF)
              } else $scope.ldifEntities[key].attributeList.push(attrsLDIF)

            }
          });
        })
      } else if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        let attrsAzure = []
        angular.forEach(Object.keys(values), function (key) {
          angular.forEach(values[key], function (value) {
            if (value.name in $scope.azureDefaultAttributes) {
              attrsAzure = value;
              attrsAzure.value = $scope.azureDefaultAttributes[value.name];
              if ($scope.azureMandatoryAttributes.indexOf(value.name.toLowerCase()) != -1) {
                attrsAzure.mandatory = true;
              }
              if ($scope.isEditMode) {
                if (!$scope.azureEntities[key].$checked) $scope.azureEntities[key].attributeList.push(attrsAzure)
              } else $scope.azureEntities[key].attributeList.push(attrsAzure)
            }
          });
        })
      }
    }

    $scope.clearAttributeList = function () {
      var list = $scope.currentDataSource.value === 'ACTIVE_DIRECTORY' ? $scope.entities : ($scope.currentDataSource.value === 'LDIF' ? $scope.ldifEntities : $scope.azureEntities);

      if ($scope.isEditMode) {
        switch ($scope.currentDataSource.value) {
          case 'ACTIVE_DIRECTORY' || 'LDIF':
            list["user"].attributeList = [];
            list["contact"].attributeList = [];
            list["computer"].attributeList = [];
            if (list["application"]) list["application"].attributeList = [];
            list["group"].attributeList = [];
            break;

          case 'AZURE_ACTIVE_DIRECTORY':
            list["user"].attributeList = [];
            list["group"].attributeList = [];
            break;
          default:
            break;
        }
      } else {
        switch ($scope.currentDataSource.value) {
          case 'ACTIVE_DIRECTORY' || 'LDIF':
            list["user"].attributeList = [];
            list["contact"].attributeList = [];
            list["computer"].attributeList = [];
            if (list["application"]) list["application"].attributeList = [];
            list["group"].attributeList = [];
            break;

          case 'AZURE_ACTIVE_DIRECTORY':
            list["user"].attributeList = [];
            list["group"].attributeList = [];
            break;
          default:
            break;
        }
      }
    }

    $scope.setAttributeList = function (values) {
      $scope.setDefaultAttributeList($scope.propertyList)
      let propertyList = copyPropertyArray($scope.propertyList)
      var attribute = [];
      angular.forEach(values, function (value) {
        attribute = value.name.split('.');
        if (attribute.length == 3) {
          if (attribute[0] in propertyList) {
            var attr = propertyList[attribute[0]].filter(function (a) {
              return a.shortName.toLowerCase() == attribute[2].toLowerCase();
            })[0];
            attr.value = value.value;
            attr.id = value.id
            attr.version = value.version
            if ($scope.adMandatoryAttributes.indexOf(value.name) != -1) {
              attr.mandatory = true;
            }
            if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
              $scope.entities[attribute[0]].attributeList.push(attr)
            } else if ($scope.currentDataSource.value === 'LDIF') {
              $scope.ldifEntities[attribute[0]].attributeList.push(attr)
            } else if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
              $scope.azureEntities[attribute[0]].attributeList.push(attr)
            }
          }
        }
      })
      $scope.isAttributeSelected()
      filterMandatoryAttribute()
      disableTabOnEntity()
    }

    $scope.setEnrollment = function (response) {
      var enrollment = response.data;
      $scope.enrollmentTitle = response.data.name
      angular.forEach($scope.dataSources, function (dataSource) {
        if (response.data.type === dataSource.value) {
          $scope.currentDataSource = dataSource
          $scope.initialiseEnrollmentProperties()
        }
      })
      $scope.enrollment = {
        id: enrollment.id,
        toolId: enrollment.toolId,
        name: enrollment.name,
        type: enrollment.type,
        description: enrollment.description,
        values: enrollment.values,
        version: enrollment.version,
        status: enrollment.status,
        created: enrollment.created
      }
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        $scope.adInit()
        $scope.getAdProperties($scope.enrollment.values)
        $scope.entities["user"].$checked = $scope.adProperties['enroll.users'].value === true;
        $scope.entities["contact"].$checked = $scope.adProperties['enroll.contacts'].value === true;
        $scope.entities["computer"].$checked = $scope.adProperties['enroll.computers'].value === true;
        $scope.entities["group"].$checked = $scope.adProperties['enroll.groups'].value === true;
        $scope.setAttributeList($scope.enrollment.values)
        $scope.updateAvailable = false;
      }
      if ($scope.currentDataSource.value === 'LDIF') {
        $scope.ldifInit()
        $scope.getldifProperties($scope.enrollment.values)
        $scope.ldifEntities["user"].$checked = $scope.ldifProperties['enroll.users'].value === true;
        $scope.ldifEntities["contact"].$checked = $scope.ldifProperties['enroll.contacts'].value === true;
        $scope.ldifEntities["computer"].$checked = $scope.ldifProperties['enroll.computers'].value === true;
        $scope.ldifEntities["application"].$checked = $scope.ldifProperties['enroll.applications'].value === true;
        $scope.ldifEntities["group"].$checked = $scope.ldifProperties['enroll.groups'].value === true;
        $scope.checkLdifChecked($scope.ldifEntities["application"])
        $scope.setAttributeList($scope.enrollment.values)
        $scope.updateAvailable = false;
      }
      if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        $scope.azureInit()
        $scope.getAzureProperties($scope.enrollment.values)
        $scope.azureEntities["user"].$checked = $scope.azureProperties['enroll.users'].value === true;
        $scope.azureEntities["group"].$checked = $scope.azureProperties['enroll.groups'].value === true;

        $scope.setAttributeList($scope.enrollment.values)

      }
      if ($scope.currentDataSource.value === 'SHAREPOINT') {
        $scope.getPortalProperties($scope.enrollment.values)

        $scope.updateAvailable = false;
      }
      $scope.getCheckboxValue()
    }
    $scope.dropdownClicked = function ($event) {
      if ($($event.target).attr('data-propagation') != 'true') $event.stopPropagation();
    };

    $scope.uploadFileExtra = function () {
      var deferred = $q.defer();
      var file = document.getElementById('input-enrollment-ldif-fileUploadExtra').files[0];
      dialogService.ldifUpload({
        title: $filter('translate')('enrollment.ldif.upload.title'),
        msg: $filter('translate')('enrollment.ldif.upload.message'),
        file: file,
        id: $scope.enrollment.id,
      }).then(function (val) {
        deferred.resolve(val);
      })
      return deferred.promise;
    }

    $scope.syncOn = false

    $scope.datePicker = {
      hour: getTime(),
      minute: getTime(),
      format: ['AM', 'PM'],
    }

    function getTime() {
      let time = []
      for (let index = 1; index <= 12; index++) {
        time.push(index)
      }
      return time
    }

    $scope.syncTime = {
      hour: null,
      minute: null,
      format: ''
    }

    $scope.syncInit = function () {
      $scope.syncTime.hour = 12
      $scope.syncTime.minute = 0,
        $scope.syncTime.format = 'AM'
      $scope.syncInterval.value = 24
      $scope.syncInterval.unit = $scope.timeUnit
    }


    $scope.upTime = function (type) {
      let hour = $scope.syncTime.hour
      let minute = $scope.syncTime.minute
      let newHour = null
      let newMinute = null

      if (type === 'hour') {
        if (hour === 12) {
          newHour = 1
        } else {
          let element = $scope.syncTime.hour + 1
          newHour = element
        }
        $scope.syncTime.hour = newHour
      }
      if (type === 'minute') {
        if (minute === 59) {
          newMinute = 0
          $scope.upTime('hour')
        } else {
          let element = $scope.syncTime.minute + 1
          newMinute = element
        }
        $scope.syncTime.minute = newMinute
      }
    }

    $scope.downTime = function (type) {
      let hour = $scope.syncTime.hour
      let minute = $scope.syncTime.minute
      let newHour = null
      let newMinute = null

      if (type === 'hour') {
        if (hour === 1) {
          newHour = 12
        } else {
          let element = $scope.syncTime.hour - 1
          newHour = element
        }
        $scope.syncTime.hour = newHour
      }
      if (type === 'minute') {
        if (minute === 0) {
          newMinute = 59
          $scope.downTime('hour')
        } else {
          let element = $scope.syncTime.minute - 1
          newMinute = element
        }
        $scope.syncTime.minute = newMinute
      }
    }

    $scope.toggleTimeFormat = function () {
      let format = $scope.syncTime.format
      if (format === 'AM') {
        format = 'PM'
      } else format = 'AM'

      $scope.syncTime.format = format
    }

    $scope.timeUnits = [
      { label: "Minutes", value: "minute" },
      { label: "Hours", value: "hour" }
    ]

    $scope.timeUnit = $scope.timeUnits[1]

    $scope.syncInterval = {
      value: null,
      unit: null
    }

    $scope.syncInit()

    $scope.convertedSyncInterval = null

    $scope.adInit = function () {
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        $scope.entities = {
          "user": {
            entity: "Users",
            shortName: "user",
            filter: $scope.adProperties['user.requirements'] ? $scope.adProperties['user.requirements'].value : null,
            disabled: false,
            $checked: $scope.adProperties['enroll.users'].value,
            attributeList: []
          },
          "contact": {
            entity: "Contacts",
            shortName: "contact",
            filter: $scope.adProperties['contact.requirements'] ? $scope.adProperties['contact.requirements'].value : null,
            disabled: false,
            $checked: $scope.adProperties['enroll.contacts'].value,
            attributeList: []
          },
          "computer": {
            entity: "Computers",
            shortName: "computer",
            filter: $scope.adProperties['computer.requirements'] ? $scope.adProperties['computer.requirements'].value : null,
            disabled: false,
            $checked: $scope.adProperties['enroll.computers'].value,
            attributeList: []
          },
          "group": {
            entity: "Groups",
            filter: $scope.adProperties['group.requirements'] ? $scope.adProperties['group.requirements'].value : null,
            disabled: false,
            $checked: $scope.adProperties['enroll.groups'].value,
            attributeList: []
          },
          "other": {
            entity: "Other Entities",
            shortName: "other",
            filter: $scope.adProperties['other.requirements'] ? $scope.adProperties['other.requirements'].value : null,
            disabled: false,
            $checked: $scope.otherRequirementsCheckbox.$checked,
            attributeList: []
          }
        }
      }
    }
    $scope.adInit()

    $scope.ldifInit = function () {
      if ($scope.currentDataSource.value === 'LDIF') {
        $scope.ldifEntities = {
          "user": {
            entity: "Users",
            shortName: "user",
            filter: $scope.ldifProperties['user.requirements'] ? $scope.ldifProperties['user.requirements'].value : null,
            disabled: false,
            $checked: $scope.ldifProperties['enroll.users'].value,
            attributeList: []
          },
          "contact": {
            entity: "Contacts",
            shortName: "contact",
            filter: $scope.ldifProperties['contact.requirements'] ? $scope.ldifProperties['contact.requirements'].value : null,
            disabled: false,
            $checked: $scope.ldifProperties['enroll.contacts'].value,
            attributeList: []
          },
          "computer": {
            entity: "Computers",
            shortName: "computer",
            filter: $scope.ldifProperties['computer.requirements'] ? $scope.ldifProperties['computer.requirements'].value : null,
            disabled: false,
            $checked: $scope.ldifProperties['enroll.computers'].value,
            attributeList: []
          },
          "application": {
            entity: "Applications",
            shortName: "application",
            filter: $scope.ldifProperties['application.requirements'] ? $scope.ldifProperties['application.requirements'].value : null,
            disabled: false,
            $checked: $scope.ldifProperties['enroll.applications'].value,
            attributeList: []
          },
          "group": {
            entity: "Groups",
            filter: $scope.ldifProperties['group.requirements'] ? $scope.ldifProperties['group.requirements'].value : null,
            disabled: false,
            $checked: $scope.ldifProperties['enroll.groups'].value,
            attributeList: []
          },
          "other": {
            entity: "Other Entities",
            filter: $scope.ldifProperties['other.requirements'] ? $scope.ldifProperties['other.requirements'].value : null,
            disabled: false,
            $checked: $scope.otherRequirementsCheckbox.$checked,
            attributeList: [],
            shortName: "other",
          }
        }
      }
    }

    $scope.ldifInit()

    $scope.azureInit = function () {
      if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        $scope.azureEntities = {
          "user": {
            entity: "Users",
            shortName: "user",
            disabled: false,
            displayTab: true,
            $checked: $scope.azureProperties['enroll.users'].value,
            attributeList: []
          },
          "group": {
            entity: "Groups",
            disabled: false,
            displayTab: false,
            $checked: $scope.azureProperties['enroll.groups'].value,
            attributeList: []
          }
        }
      }
    }

    $scope.azureInit()

    $scope.getEmptyAttribute = function () {
      return {
        id: null,
        type: null,
        value: null
      }
    }

    $scope.addAttribute = function (entity) {
      var l = $scope.getEmptyAttribute();
      $scope.azureEntities[entity].attributeList.push(l)
    }

    $scope.cancelEdit = function (entity, $index) {
      switch ($scope.currentDataSource.value) {
        case 'ACTIVE_DIRECTORY':
          $scope.entities[entity].attributeList.splice($index, 1);
          break;
        case 'LDIF':
          $scope.ldifEntities[entity].attributeList.splice($index, 1);
          break;
        case 'AZURE_ACTIVE_DIRECTORY':
          $scope.azureEntities[entity].attributeList.splice($index, 1);
          break;

        default:
          break;
      }
      $scope.isAttributeSelected()
    }

    $scope.propertyList = [];
    $scope.fetchProperties = function () {
      propertyManagerService.getAllProperties(function (data) {
        if (data.data && data.data.length && Object.keys($scope.propertyList).length === 0) {
          angular.forEach(data.data, function (property) {
            var prop = $scope.getEmptyProperty();
            if (property.parentName === 'host') property.parentName = 'computer'
            if (property.name === 'displayname') property.name = 'displayName'
            prop.name = property.parentName + "." + property.type.toLowerCase() + "." + property.name;
            prop.shortName = property.name;
            prop.label = property.label;
            prop.type = property.type.toLowerCase();
            prop.value = "";
            if (!$scope.propertyList[property.parentName]) {
              $scope.propertyList[property.parentName] = [];
            }
            $scope.propertyList[property.parentName].push(prop);
          })
        }
        if ($scope.isEditMode) {
          getEnrollment();
        } else {
          $scope.setDefaultAttributeList($scope.propertyList);
          $scope.isAttributeSelected()
          filterMandatoryAttribute()
          disableTabOnEntity()
        }
        $scope.filterPropertyList()
      });

    };
    $scope.fetchProperties();


    $scope.adDefaultAttributes = {
      "user.string.principalName": "userPrincipalName",
      "user.cs-string.windowsSid": "objectSid",
      "user.string.displayName": "name",
      "user.string.firstName": "givenName",
      "user.string.lastName": "sn",
      "user.multi-string.mail": "proxyAddresses",
      "contact.string.principalName": "mail",
      "contact.string.displayName": "name",
      "contact.string.firstName": "firstName",
      "contact.string.lastName": "sn",
      "contact.multi-string.mail": "proxyAddresses",
      "computer.string.dnsName": "dnsHostName",
      "computer.cs-string.windowsSid": "objectSid"
    }

    $scope.adMandatoryAttributes = ["user.string.principalname", "user.string.displayname", "contact.string.principalname", "computer.string.dnsname"];

    $scope.ldifDefaultAttributes = {
      "user.string.principalName": "User Principal Name",
      "user.cs-string.windowsSid": "objectSid",
      "user.string.displayName": "Full Name",
      "user.string.firstName": "First Name",
      "user.string.lastName": "Last Name",
      "user.multi-string.mail": "proxyAddresses",
      "contact.string.principalName": "mail",
      "contact.string.displayName": "name",
      "contact.string.firstName": "firstName",
      "contact.string.lastName": "sn",
      "contact.multi-string.mail": "proxyAddresses",
      "computer.string.dnsName": "dnsHostName",
      "computer.cs-string.windowsSid": "objectSid",
      "application.string.uniqueName": "fullyQualifiedName",
      "application.string.displayName": "cn",
      "application.cs-string.appFingerPrint": "applicationFingerPrint",
      "application.cs-string.systemReference": "uniqueSystemIdentifier",
    }

    $scope.ldifMandatoryAttributes = ["user.string.principalname", "user.string.displayname", "contact.string.principalname", "computer.string.dnsname"];

    $scope.azureDefaultAttributes = {
      "user.string.principalName": "userPrincipalName",
      "user.cs-string.windowsSid": "id",
      "user.string.displayName": "displayName",
      "user.string.firstName": "givenName",
      "user.string.lastName": "surname",
      "user.multi-string.mail": "mail",
    }

    $scope.azureMandatoryAttributes = ["user.string.principalname", "user.string.displayname"];

    $scope.addProperty = function (entityType) {
      $scope.isAttributeSelected()
      if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        var l = $scope.getEmptyProperty();
        $scope.entities[entityType].attributeList.push(l);
      } else if ($scope.currentDataSource.value === 'LDIF') {
        var l = $scope.getEmptyProperty();
        $scope.ldifEntities[entityType].attributeList.push(l);
      } else if ($scope.currentDataSource.value === 'AZURE_ACTIVE_DIRECTORY') {
        var l = $scope.getEmptyProperty();
        $scope.azureEntities[entityType].attributeList.push(l);
      }
    }

    $scope.setAttribute = function (attribute, s) {
      attribute.name = s.name;
      attribute.shortName = s.shortName;
      attribute.label = s.label;
      attribute.type = s.type;
      attribute.value = s.value;
      if ($scope.currentDataSource.value === 'LDIF' && attribute.name === 'user.string.unixId') attribute.value = 'unixSid'
      $scope.isAttributeSelected()
    }

    $scope.isFormInvalid = function (frm) {
      return frm.$invalid
    }

    $scope.discardEnrollment = function (frm) {
      frm.$setPristine()
      frm.$setUntouched()
      dialogService.confirm({
        msg: $filter('translate')('toolManagement.createTask.resetConfirmation'),
        confirmLabel: $filter('translate')('RESET'),
        cancelLabel: $filter('translate')('CANCEL'),
        ok: function () {
          if ($scope.isEditMode) {
            getEnrollment()
          } else {
            $scope.onSelectChange($scope.currentDataSource)
            $scope.enrollment.name = ""
            $scope.enrollment.description = ""
            $scope.portals = [""]
            $scope.roots = [""]
            $scope.syncOn = false
            $scope.syncInit()
          }
        }
      });
    }

    $scope.onSelectChange = function (dataSource) {
      resetFormState()
      $scope.currentDataSource = dataSource
      $scope.syncOn = false
      $scope.syncInit()
      $scope.closeAllUserManual()
      $scope.initialiseEnrollmentProperties()
      $scope.adInit()
      $scope.ldifInit()
      $scope.azureInit()
      $scope.fetchProperties();

    }

    function resetFormState() {
      $scope.enrollmentForm.val.$setPristine();
      $scope.saveExecuted = false
      $scope.structuralGroupCheckbox.$checked = false
    }
    function parseToBool(val) {
      return val === 'true' ? true : val === 'false' ? false : val;
    }

    function parseToString(val) {
      return val !== null && val !== "" ? val.toString() : "";
    }

    $scope.onSyncChange = function (val) {
      $scope.syncOn = val
      $scope.initialiseProperties("scheduledsyncinterv", "NM", "0");
      $scope.initialiseProperties("scheduledsynctime", "NM", "");
      if (!val) $scope.syncInit()
    }

    $scope.entityChecked = function (entity) {
      $scope.checkLdifChecked(entity)
      disableTabOnEntity()
      setDefaultValueForFilter(entity)
    }

    $scope.checkLdifChecked = function (entity) {
      if (entity) {
        if (entity.shortName === 'application' && entity.$checked) {
          angular.forEach(Object.keys($scope.ldifEntities), function (ent) {
            if (ent !== 'application' && ent !== 'group') {
              $scope.ldifEntities[ent].$checked = false
              $scope.ldifEntities[ent].disabled = true
            }
          })
          $scope.ldifProperties['entry.attributefor.staticid'].value = 'uniqueGlobalIdentifier'
        } else if (entity.shortName === 'application' && !entity.$checked) {
          angular.forEach(Object.keys($scope.ldifEntities), function (ent) {
            if (ent !== 'application' && ent !== 'group') {
              $scope.ldifEntities[ent].disabled = false
            }
          })
          $scope.ldifProperties['entry.attributefor.staticid'].value = 'objectGUID'
        }
      }
    }

    function setDefaultValueForFilter(entity) {
      let entityGroup = getEntityGroup()
      if ($scope.currentDataSource.value === 'LDIF') {
        switch (entity.entity) {
          case 'Users':
            $scope.initialiseProperties("user.requirements", "ST", "objectClass=User");
            entity.filter = 'objectClass=User'
            break;
          case 'Contacts':
            $scope.initialiseProperties("contact.requirements", "ST", "objectClass=contact");
            entity.filter = 'objectClass=contact'
            break;
          case 'Computers':
            $scope.initialiseProperties("computer.requirements", "ST", "(dnsHostName=*)");
            entity.filter = '(dnsHostName=*)'
            break;
          case 'Applications':
            $scope.initialiseProperties("application.requirements", "ST", "objectClass=Application");
            entity.filter = 'objectClass=Application'
            break;
          case 'Groups':
            $scope.initialiseProperties("group.requirements", "ST", "objectClass=Group");
            entity.filter = 'objectClass=Group'
            break;
          default:
            break;
        }
      } else if ($scope.currentDataSource.value === 'ACTIVE_DIRECTORY') {
        switch (entity.entity) {
          case 'Users':
            $scope.initialiseProperties("user.requirements", "ST", "(&(objectClass=user)(!(objectClass=computer)))");
            entity.filter = '(&(objectClass=user)(!(objectClass=computer)))'
            break;
          case 'Contacts':
            $scope.initialiseProperties("contact.requirements", "ST", "objectClass=contact");
            entity.filter = 'objectClass=contact'
            break;
          case 'Computers':
            $scope.initialiseProperties("computer.requirements", "ST", "objectClass=computer");
            entity.filter = 'objectClass=computer'
            break;
          case 'Groups':
            $scope.initialiseProperties("group.requirements", "ST", "objectClass=Group");
            entity.filter = 'objectClass=Group'
            break;
          default:
            break;
        }
      }
      if (entity.$checked && entity.shortName === 'other') {
        entityGroup[entity.shortName].filter = "(|(objectClass=serviceConnectionPoint)(objectClass=connectionPoint))"
      }
    }

    var isPropertyAttribute = function (obj) {
      let prop = obj.name.split('.')
      if (prop.length == 3) {
        if (prop[0] in $scope.propertyList) {
          return true
        }
      }
    }

    let propertiesName = ['user', 'contact', 'computer', 'application', 'group', 'other']
    $scope.isAttributeSelected = function () {
      let entityGroup = getEntityGroup()
      angular.forEach(propertiesName, function (propertyName) {
        if (isMainEntity(propertyName)) {
          if (entityGroup && entityGroup[propertyName]) {
            angular.forEach($scope.propertyList[propertyName], function (property) {
              let valueFound = false
              angular.forEach(entityGroup[propertyName].attributeList, function (attribute) {
                if (!valueFound) {
                  if (property.shortName === attribute.shortName) {
                    property.disabled = true
                    valueFound = true
                  } else property.disabled = false
                }
              })
            })
          }
        }
      })
    }

    var filterMandatoryAttribute = function () {
      let entityGroup = getEntityGroup()
      let thirdRowChosen = false
      angular.forEach(propertiesName, function (propertyName) {
        if (isMainEntity(propertyName)) {
          let isNotMandatoryAttribute = []
          if (entityGroup && entityGroup[propertyName]) {
            let mandatoryAttribute = entityGroup[propertyName].attributeList.filter(function (property) {
              if (!property.mandatory) isNotMandatoryAttribute.push(property)
              return property.mandatory === true
            })
            if (!thirdRowChosen) {
              let index = isNotMandatoryAttribute.findIndex(function (attr) {
                return attr.name === 'user.cs-string.windowsSid'
              })
              if (index !== -1) {
                angular.forEach(isNotMandatoryAttribute, function (attr) {
                  if (attr.name === 'user.cs-string.windowsSid') {
                    isNotMandatoryAttribute.splice(index, 1)
                    isNotMandatoryAttribute.unshift(attr)
                  }
                })
                thirdRowChosen = true
              }
            }
            if (!thirdRowChosen) {
              let index = isNotMandatoryAttribute.findIndex(function (attr) {
                return attr.name === 'user.string.unixId'
              })
              if (index !== -1) {
                angular.forEach(isNotMandatoryAttribute, function (attr) {
                  if (attr.name === 'user.string.unixId') {
                    isNotMandatoryAttribute.splice(index, 1)
                    isNotMandatoryAttribute.unshift(attr)
                  }
                })
                thirdRowChosen = true
              }
            }
            if (!thirdRowChosen) {
              let index = isNotMandatoryAttribute.findIndex(function (attr) {
                return attr.name === 'user.multi-string.mail'
              })
              if (index !== -1) {
                angular.forEach(isNotMandatoryAttribute, function (attr) {
                  if (attr.name === 'user.multi-string.mail') {
                    isNotMandatoryAttribute.splice(index, 1)
                    isNotMandatoryAttribute.unshift(attr)
                  }
                })
                thirdRowChosen = true
              }
            }
            entityGroup[propertyName].attributeList = mandatoryAttribute.concat(isNotMandatoryAttribute)
          }
        }
      })
    }

    var disableTabOnEntity = function () {
      let entityGroup = getEntityGroup()
      angular.forEach(propertiesName, function (propertyName) {
        if (entityGroup && entityGroup[propertyName]) {
          if (!entityGroup[propertyName].$checked) entityGroup[propertyName].tabDisabled = true
          if (entityGroup[propertyName].$checked) entityGroup[propertyName].tabDisabled = false
        }
      })
    }

    $scope.getCheckboxValue = function () {
      let entityGroup = getEntityGroup()
      let propertyGroup = getPropertiesGroup()
      if (entityGroup && entityGroup['other']) {
        if (propertyGroup && !propertyGroup['other.requirements'].value) entityGroup['other'].$checked = false
        else entityGroup['other'].$checked = true
      }
      getStructuralGroupValue()
      disableTabOnEntity()
    }

    function prepareFilterValue() {
      let entityGroup = getEntityGroup()
      let propertyGroup = getPropertiesGroup()
      if (entityGroup && entityGroup['other']) {
        if (!entityGroup['other'].$checked) {
          propertyGroup['other.requirements'].value = ""
        } else propertyGroup['other.requirements'].value = entityGroup['other'].filter
      }
      prepareStructuralGroupValue()
    }

    function getStructuralGroupValue() {
      let propertyGroup = getPropertiesGroup()
      if (propertyGroup && (propertyGroup['structure.requirements'] == null || !propertyGroup['structure.requirements'].value)) $scope.structuralGroupCheckbox.$checked = false
      else $scope.structuralGroupCheckbox.$checked = true
    }

    function prepareStructuralGroupValue() {
      let propertyGroup = getPropertiesGroup()
      if (propertyGroup && !$scope.structuralGroupCheckbox.$checked && propertyGroup['structure.requirements'] != null)
        propertyGroup['structure.requirements'].value = ""
    }

    $scope.onChangeStructuralCheckbox = function (value) {
      let propertyGroup = getPropertiesGroup()
      switch ($scope.currentDataSource.value) {
        case 'ACTIVE_DIRECTORY':
          if (value) propertyGroup['structure.requirements'].value = "(|(objectClass=organizationalUnit)(objectClass=domain)(objectClass=container))"
          else if (!value) propertyGroup['structure.requirements'].value = ""
          break;
        case 'AZURE_ACTIVE_DIRECTORY':
          if (value) propertyGroup['structure.requirements'].value = "(|(objectClass=serviceConnectionPoint)(objectClass=connectionPoint))"
          else if (!value) propertyGroup['structure.requirements'].value = ""
          break;
        case 'LDIF':
          if (value) propertyGroup['structure.requirements'].value = "objectClass=*"
          else if (!value) propertyGroup['structure.requirements'].value = ""
          break;
        default:
          break;
      }
    }

    function getEntityFilter() {
      let propertyGroup = getPropertiesGroup()
      let entityGroup = getEntityGroup()
      angular.forEach(propertiesName, function (propertyName) {
        let field = propertyName + '.requirements'
        if (entityGroup) {
          if (propertyGroup[field] && entityGroup[propertyName]) {

            entityGroup[propertyName].filter = propertyGroup[field].value
          }
        }
      })
    }

    function prepareEntityFilter() {
      let propertyGroup = getPropertiesGroup()
      let entityGroup = getEntityGroup()
      angular.forEach(propertiesName, function (propertyName) {
        if (isMainEntity(propertyName)) {
          let field = propertyName + '.requirements'
          if (propertyGroup && entityGroup) {
            if (propertyGroup[field] && entityGroup[propertyName]) {
              propertyGroup[field].value = entityGroup[propertyName].filter
            }
          }
        }
      })
      prepareFilterValue()
    }

    var getEntityGroup = function () {
      let entityGroup = null
      switch ($scope.currentDataSource.value) {
        case 'ACTIVE_DIRECTORY':
          entityGroup = $scope.entities
          break;
        case 'LDIF':
          entityGroup = $scope.ldifEntities
          break;
        case 'AZURE_ACTIVE_DIRECTORY':
          entityGroup = $scope.azureEntities
          break;
        default:
          break;
      }
      return entityGroup
    }

    function isMainEntity(entity) {
      if (entity !== 'group' && entity !== 'other') return true
      else return false
    }

    $scope.filterPropertyList = function () {
      $scope.filteredPropertyList = []
      let filteredList = ["windowsSid", "unixId", "mail"]
      angular.forEach($scope.propertyList['user'], function (property) {
        angular.forEach(filteredList, function (item) {
          if (property.shortName === item) $scope.filteredPropertyList.push(property)
        })
      })
    }

    $scope.getCheckedStatus = function () {
      let entities = getEntityGroup()
      $scope.checked = false
      if (entities) {
        angular.forEach(Object.keys(entities), function (key) {
          if (entities[key].$checked) {
            $scope.checked = true
          }
        })
        return $scope.checked
      }
    }

    $scope.checkEntityType = function (entity, index) {
      if (entity === 'Users' && index === 2) return false
      else return true
    }

    $scope.numberOnly = function (e) {
        if (e.which === 109 || e.which === 189 || e.which === 69 || e.which === 190) {
          e.preventDefault()
        }
    }
  }
]);