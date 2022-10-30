policyStudio.controller('createRequestController', ['$timeout', '$scope', '$http', 'policyService', 'componentService', 'resourceService', 'loggerService', '$uibModal', '$location', '$anchorScroll',
    '$stateParams', '$filter', 'dialogService', '$state', 'autoCloseOptionService', '$window', 'userManualTranslateService', '$rootScope', 'moment', '$q', 'userService', 'versionService',
    'tagService', 'xacmlParsingService', 'requestBuilderService',
    function($timeout, $scope, $http, policyService, componentService, resourceService, loggerService, $uibModal, $location, $anchorScroll, $stateParams, $filter, dialogService, $state,
        autoCloseOptionService, $window, userManualTranslateService, $rootScope, moment, $q, userService, versionService, tagService, xacmlParsingService, requestBuilderService) {

        if(!$rootScope.policyTesterScope){
            $rootScope.policyTesterScope = $scope;
        }

        var getEmptyCondition = function(type) {
            var reqCondition = {
                attrName: "",
                attrShortName: "",
                attrDataType: "",
                type: type || ""
            };
            return reqCondition;
        };

        var getEmptyAction = function() {
            var actionObj = {
                name: "",
                shortName: ""
            };
            return actionObj;
        };

        var defaultSubjectIdCondition = {
            attribute: {
                attrName: "subject-id",
                attrShortName: "subject-id",
                attrDataType: "STRING",
                type: "subject"
            },
            values: ["unspecified"],
            newVal: '',
            type: 'S',
            mandatory: true
        };

        var defaultResourceIdCondition = {
            attribute: {
                attrName: "resource-id",
                attrShortName: "resource-id",
                attrDataType: "STRING",
                type: "resource"
            },
            values: ["unspecified"],
            newVal: '',
            type: 'R',
            mandatory: true
        };

        var defaultApplicationIdCondition = {
            attribute: {
                attrName: "application-id",
                attrShortName: "application-id",
                attrDataType: "STRING",
                type: "application"
            },
            values: ["unspecified"],
            newVal: '',
            type: 'S',
            mandatory: true,
            implicit: true
        };

        var defaultHostIPCondition = {
                attribute: {
                    attrName: "inet_address",
                    attrShortName: "inet_address",
                    attrDataType: "STRING",
                    type: "host"
                },
                values: ["127.0.0.1"],
                newVal: '',
                type: 'S',
                mandatory: true,
                implicit: true
            };  

        var requestData = {
            "request": {
                "subjectConditions": [],
                "action": "",
                "resourceType": "",
                "resourceConditions": [] ,
                "envConditions": []
            }
        };

        var getNewCondition = function (type, mandatory, attribute, values) {
            return {
                attribute: attribute || "",
                values: values || [],
                newVal: '',
                type: type || "",
                mandatory: false || mandatory
            };
        };
        var getEmptyRequestPayload = function() {
            return {
                "subject": [],
                "resource": [],
                "toResource": [],
                "action": [],
                "recipient": [],
                "application": [],
                "host": [],
                "environment": [],
                "otherCategories": [],
                "onDemandPolicyCriteria": [],
                "onDemandPolicyIds": [],
                "debug": ''
            };
        };
        $scope.selectedPolicies =  $rootScope.policyTesterScope.selectedPolicies || [];
        $scope.selectPolicyOptions = $rootScope.policyTesterScope.selectPolicyOptions || [{
            key: "all",
            label: "All Policies"
        }, {
            key: "custom",
            label: "Select Policies"
        }];
        $scope.radioType = {
            name: 'policy'
        };
        $scope.selectFilterOptions = $rootScope.policyTesterScope.selectFilterOptions || [];
        $scope.selectPoliciesCriteria = $rootScope.policyTesterScope.selectPoliciesCriteria || [];
        $scope.selectPoliciesType =  $rootScope.policyTesterScope.selectPoliciesType  || {
            val: 'All Policies'
        };
        $scope.selectedCriterion = {
            val: ''
        };
        $scope.selectCustomPolicies = $rootScope.policyTesterScope.selectCustomPolicies || {
            val: false
        };
        $scope.includeSubPolicies = $rootScope.policyTesterScope.includeSubPolicies ||{
            val: true
        };

        $scope.showEvalLogs = $rootScope.policyTesterScope.showEvalLogs ||{
            val: true
        };
        $scope.evalLog = $rootScope.policyTesterScope.evalLog || {
			allowPolicies : null,
			denyPolicies : null,
			noMatchPolicies : null,
			requestParams : null,
			evalResponse: null,
			logdatetime : null
        };

        $scope.logData = $rootScope.policyTesterScope.logData || {
            val: false
        }

        $scope.subjectOptions = [];
        $scope.resourceOptions = $rootScope.policyTesterScope.resourceOptions || [];
        $scope.resourceTypeOptions = [];
        $scope.actionOptions = $rootScope.policyTesterScope.actionOptions || [];
        $scope.reqBuilderForm = {
            val: null,
        }

        $scope.requestObj = $rootScope.policyTesterScope.requestObj || {
            data: requestData,
            jsonData: '',
            xmlData: '',
            options: {
                mode: 'tree'
            }
        };

        $scope.requestJson = $rootScope.policyTesterScope.requestJson || {
            "request": {
                "subjectConditions": [],
                "action": "",
                "resourceType": "",
                "resourceConditions": [] ,
                "envConditions": []
            }
        };

        $scope.requestXml = $rootScope.policyTesterScope.requestXml || {
            "request": {
                "subjectConditions": [],
                "action": "",
                "resourceType": "",
                "resourceConditions": [] ,
                "envConditions": []
            }
        };

        $scope.selectedTab = {
            val: 0
        };

        $scope.showIcons = false;

        $scope.responseObj = $rootScope.policyTesterScope.responseObj || {
            data: '',
            jsonData: '',
            xmlData: '',
            options: {
                mode: 'tree'
            }
        };

        $scope.resTypeAttr = $rootScope.policyTesterScope.resTypeAttr || {
            attributeId: 'resource-type',
            attributeValue: $scope.requestObj.data.request.resourceType.shortName || ' '
        };

        $scope.act = $rootScope.policyTesterScope.act || {
            attributeId: 'action-id',
            attributeValue: requestData.request.action.shortName || ''
        };

        $scope.evalLog = $rootScope.policyTesterScope.evalLog || {
            allowPolicies: "",
            denyPolicies: "",
            noMatchPolicies: ""
        }

        $scope.invalidCondition = false;

        var x2js = new X2JS();

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
                $rootScope.policyTesterScope = null;
                $scope.getModelsAttributesActions();
                $state.reload();
                callback && callback();
            }
        }];

        //get permissions for the logged-in user
        userService.getPermissions('POLICY', function(permissions) {
            $scope.permissions = permissions;
        });
        userService.goBackIfAccessDenied('MANAGE_POLICY_VALIDATOR');

        $scope.updateSelectedPolicies = function(optionSelected) {
            var policySelectType = optionSelected.key;
            $scope.selectPoliciesType.val = optionSelected.label;

            if (policySelectType === 'custom') {
                $scope.selectCustomPolicies.val = true;
                $scope.selectPoliciesCriteria = [];
            } else {
                updateSelectPoliciesCriteria(policySelectType);
                $scope.selectCustomPolicies.val = false;
                $scope.selectedPolicies = [];
            }
        };

        function updateSelectPoliciesCriteria(policySelectType) {
            if (policySelectType === 'all') {
                var criteria = {
                    "field": "status",
                    "type": "MULTI",
                    "value": {
                        "type": "String",
                        "value": ["APPROVED", "DRAFT", "DE_ACTIVATED"]
                    }
                };
                $scope.selectPoliciesCriteria = [];
                $scope.selectPoliciesCriteria.push(criteria);
            } else {
                $scope.selectPoliciesCriteria = [];
            }
        }

        $scope.setPolicySearchCriteria = function(filterOption) {
            $scope.selectedPolicies = [];
            $scope.selectCustomPolicies.val = false;
            $scope.selectPoliciesType.val = filterOption.name;
            $scope.selectPoliciesCriteria = [];

            var searchFields = filterOption.criteria.fields;
            angular.forEach(searchFields, function(searchField) {
                var criteria = searchField;
                $scope.selectPoliciesCriteria.push(criteria);
            });
        }

        $scope.addtoCustomPolicies = function(policy) {
            var policyId = policy.id;
            $scope.selectedPolicies.push(policyId);
        };

        $scope.getMatchingPolicies = function(name, filterSelection, callback) {
            var searchCriteria = {
                "criteria": {
                    "fields": [],
                    "sortFields": [{
                        "field": "lastUpdatedDate",
                        "order": "DESC"
                    }],
                    "pageNo": 0,
                    "pageSize": 65535
                }
            };
            if (!$scope.includeSubPolicies.val) {
                searchCriteria = {
                    "criteria": {
                        "fields": [],
                        "sortFields": [],
                        "pageNo": 0,
                        "pageSize": 65535
                    },
                    "withSubpolicies": false
                };
            }
            policyService.getPolicies(searchCriteria, 0, function(policyList) {
                callback(policyList);
            });
        };

        //operations related to display and add/remove attributes values
        $scope.removeValue = function (index, condition) {
            var value = condition.values[index];
            condition.values.splice(index, 1);
            if (value !== 'unspecified' && condition.mandatory && !condition.values.length > 0) {
                condition.values.push("unspecified");
            }
        };

        $scope.setIconsFlag = function(value) {
            $scope.showIcons = true;
        };

        $scope.clearValue = function(condition) {
            condition.newVal = "";
        };

        $scope.addDefaultAttributes = function () {
            var subjectIdConditionExists = false;
            angular.forEach($scope.requestObj.data.request.subjectConditions, function (condition) {
                if (condition.attribute.attrName == "subject-id" || condition.attribute == "subject-id") {
                    subjectIdConditionExists = true;
                }
            });
            if (!subjectIdConditionExists) {
                $scope.requestObj.data.request.subjectConditions.push(defaultSubjectIdCondition);
            }
            var resoruceIdConditionExists = false;
            angular.forEach($scope.requestObj.data.request.resourceConditions, function (condition) {
                if (condition.attribute.attrName == "resource-id") {
                    resoruceIdConditionExists = true;
                }
            });
            if (!resoruceIdConditionExists) {
                $scope.requestObj.data.request.resourceConditions.push(defaultResourceIdCondition);
            }
        }

        //adds a new attribute-value to table
        $scope.addAttribute = function(attrType) {
            switch (attrType) {
                case 'S':
                    var condition = getNewCondition('S');
                    $scope.requestObj.data.request.subjectConditions.push(condition);
                    break;
                case 'R':
                    var condition = getNewCondition('R');
                    $scope.requestObj.data.request.resourceConditions.push(condition);
                    break;
                case 'E':
                    var condition = getNewCondition('E');
                    $scope.requestObj.data.request.envConditions.push(condition);
                    break;
                default:
                    break;
            }
        };
        // removes a selected attribute from table
        $scope.removeAttribute = function(attrType, attrIndex) {
            switch (attrType) {
                case 'S':
                    $scope.requestObj.data.request.subjectConditions.splice(attrIndex, 1);
                    break;
                case 'R':
                    $scope.requestObj.data.request.resourceConditions.splice(attrIndex, 1);
                    break;
                case 'E':
                    $scope.requestObj.data.request.envConditions.splice(attrIndex, 1);
                    break;
                default:
                    break;
            }
        };

        $scope.checkAddAttrAllowed = function(attrType) {
            var isInvalid = false;
            switch (attrType) {
                case 'S':
                    isInvalid = isInvalidRequestCondition($scope.requestObj.data.request.subjectConditions);
                    break;
                case 'R':
                    isInvalid = isInvalidRequestCondition($scope.requestObj.data.request.resourceConditions);
                    break;
                case 'E':
                    isInvalid = isInvalidRequestCondition($scope.requestObj.data.request.envConditions);
                    break;
                default:
                    break;
            }
            return isInvalid;
        }

        $scope.addValue = function (condition) {
            if (condition.newVal != "" && condition.newVal != undefined) {
                condition.values.push(condition.newVal);
                if (condition.mandatory) {
                    var index = condition.values.indexOf('unspecified');
                    if (index !== -1) condition.values.splice(index, 1);
                }
            }

            $scope.showIcons = false;
            condition.newVal = "";
        };

        //get subject and resource conditions
        var modelActionsAttrs = [];
        
        $scope.getModelsAttributesActions = function () {
            //component type attributes
            
            var deferred = $q.defer();
            resourceService.getResourceLiteList('SUBJECT', function (resourceList) {
                angular.forEach(resourceList.data, function(model, index){
                    var modelId = model.id;
                    var subjectGroup = {
                        policyModelName: model.name,
                        conditions: []
                    };
                    resourceService.getResourceLite(modelId, function (response) {
                        var attrs = response.data.attributes;
                        angular.forEach(attrs, function (attr) {
                            var cond = getEmptyCondition(model.shortName);
                            cond.attrName = attr.name;
                            cond.attrShortName = attr.shortName;
                            cond.attrDataType = attr.dataType;
                            subjectGroup.conditions.push(cond);
                        });
                        resourceService.getEnrollmentSubjectAttributes(model.shortName, function(data){
                            if(data.data && data.data.length){
                                var enrollmentAttributes = data.data
                                angular.forEach(enrollmentAttributes, function(attr) {
                                    var cond = getEmptyCondition(model.shortName);
                                    cond.attrName = attr.name;
                                    cond.attrShortName = attr.shortName;
                                    cond.attrDataType = attr.dataType;
                                    subjectGroup.conditions.push(cond);
                                });
                                subjectGroup.conditions.sort(function(a, b){
                                    if (a.attrName.toLowerCase() < b.attrName.toLowerCase())
                                        return -1;
                                    if (a.attrName.toLowerCase() > b.attrName.toLowerCase())
                                        return 1;
                                    return 0;
                                });
                            }
                        });
                    });
                    $scope.subjectOptions.push(subjectGroup);
                }); 
            });
            deferred.resolve();

            resourceService.getResourceLiteList('RESOURCE', function(resourceList) {
                var modelIds = [];
                var policyModels = resourceList.data;
                angular.forEach(policyModels, function(policyModel) {
                    var policyModelId = policyModel.id;
                    resourceService.getResourceLite(policyModelId, function(response) {
                        if (!response.data) return;
                        var resType = {
                            shortName: response.data.shortName,
                            name: response.data.name
                        };
                        $scope.resourceTypeOptions.push(resType);
                        var item = {
                            model: resType.shortName,
                            allAttributes: response.data.attributes,
                            allActions: response.data.actions
                        };
                        modelActionsAttrs.push(item);
                        $scope.resourceTypeOptions.sort(function(a, b){
                            if (a.name.toLowerCase() < b.name.toLowerCase())
                                return -1;
                            if (a.name.toLowerCase() > b.name.toLowerCase())
                                return 1;
                            return 0;
                        });
                    });
                });
            });
        };

        //populate resource attrributes and actions, given the resourceType
        $scope.getResourceAttrsActions = function(resourceType) {
            if ($scope.resourceOptions.length) {
                $scope.resourceOptions = [];
                $scope.resourceOptions.length = 0;
            }
            if ($scope.actionOptions.length) {
                $scope.actionOptions = [];
                $scope.actionOptions.length = 0;
            }
            for (var i = 0; i < modelActionsAttrs.length; i++) {
                if (resourceType.shortName === modelActionsAttrs[i].model) {
                    var attrs = modelActionsAttrs[i].allAttributes;
                    var actions = modelActionsAttrs[i].allActions;
                    angular.forEach(attrs, function (attr) {
                        var cond = getEmptyCondition("resource");
                        cond.attrName = attr.name;
                        cond.attrShortName = attr.shortName
                        cond.attrDataType = attr.dataType;
                        $scope.resourceOptions.push(cond);
                    });

                    angular.forEach(actions, function (action) {
                        var actionObj = getEmptyAction();
                        actionObj.name = action.name;
                        actionObj.shortName = action.shortName

                        $scope.actionOptions.push(actionObj);
                    });

                    $scope.resourceOptions.sort(function(a, b){
                        if (a.attrName.toLowerCase() < b.attrName.toLowerCase())
                            return -1;
                        if (a.attrName.toLowerCase() > b.attrName.toLowerCase())
                            return 1;
                        return 0;
                    });

                    $scope.actionOptions.sort(function(a, b){
                        if (a.name.toLowerCase() < b.name.toLowerCase())
                            return -1;
                        if (a.name.toLowerCase() > b.name.toLowerCase())
                            return 1;
                        return 0;
                    });
                    break;
                }
            }
            $scope.requestObj.data.request.resourceType = "";
            $scope.requestObj.data.request.action = "";
            $scope.requestObj.data.request.resourceConditions = [];
            $rootScope.policyTesterScope.resourceOptions = $scope.resourceOptions;
            $rootScope.policyTesterScope.actionOptions = $scope.actionOptions;
            $scope.addDefaultAttributes();
        };

        // All TAB operations start here
        $scope.onLoad = function(instance) {
            instance.expandAll();
        };
        //prettify the json
        $scope.prettifyJson = function(jsonObjectStr) {
            return angular.toJson(jsonObjectStr, true);
        };
        //prettify the xml
        $scope.prettifyXml = function(xmlObjectStr) {
            return vkbeautify.xml(xmlObjectStr);
        };

        //On click of JSON Editor tab
        $scope.getJsonObj = function() {
            $scope.requestJson = {
                "request": {
                    "subjectConditions": [],
                    "action": "",
                    "resourceType": "",
                    "resourceConditions": [] ,
                    "envConditions": []
                }
            }
            var conditions = $scope.requestObj.data.request.subjectConditions;
            var subjectIdAttributeExists = false;
            angular.forEach(conditions, function (condition) {
                if (condition.attribute.attrName == "subject-id" || condition.attribute == "subject-id") {
                    subjectIdAttributeExists = true;
                }
                $scope.requestJson.request.subjectConditions.push(condition);
            });
            if (!subjectIdAttributeExists) {
                $scope.requestJson.request.subjectConditions.push(defaultSubjectIdCondition);
            }

            var conditions = $scope.requestObj.data.request.resourceConditions;
            var resourceIdAttributeExists = false;
            angular.forEach(conditions, function (condition) {
                if (condition.attribute.attrName == "resource-id" || condition.attribute == 'resource-id') {
                    resourceIdAttributeExists = true;
                }
                $scope.requestJson.request.resourceConditions.push(condition);
            });
            if (!resourceIdAttributeExists) {
                $scope.requestJson.request.resourceConditions.push(defaultResourceIdCondition);
            }

            $scope.requestJson.request.action = $scope.requestObj.data.request.action;
            $scope.requestJson.request.resourceType = $scope.requestObj.data.request.resourceType;
            $scope.requestJson.request.envConditions = $scope.requestObj.data.request.envConditions;
            var xacmlJson = xacmlParsingService.generateXacmlRequestPayload('json', $scope.requestJson);
            $scope.requestObj.jsonData = xacmlJson;
        };

        $scope.getXmlObj = function() {
            $scope.requestXml = {
                "request": {
                    "subjectConditions": [],
                    "action": "",
                    "resourceType": "",
                    "resourceConditions": [] ,
                    "envConditions": []
                }
            }
            var conditions = $scope.requestObj.data.request.subjectConditions;
            var subjectIdAttributeExists = false;
            angular.forEach(conditions, function (condition) {
                if (condition.attribute.attrName == "subject-id" || condition.attribute == "subject-id") {
                    subjectIdAttributeExists = true;
                }
                $scope.requestXml.request.subjectConditions.push(condition);
            });
            if (!subjectIdAttributeExists) {
                $scope.requestXml.request.subjectConditions.push(defaultSubjectIdCondition);
            }

            var conditions = $scope.requestObj.data.request.resourceConditions;
            var resourceIdAttributeExists = false;
            angular.forEach(conditions, function (condition) {
                if (condition.attribute.attrName == "resource-id" || condition.attribute == 'resource-id') {
                    resourceIdAttributeExists = true;
                }
                $scope.requestXml.request.resourceConditions.push(condition);
            });
            if (!resourceIdAttributeExists) {
                $scope.requestXml.request.resourceConditions.push(defaultResourceIdCondition);
            }
            
            $scope.requestXml.request.action = $scope.requestObj.data.request.action;
            $scope.requestXml.request.resourceType = $scope.requestObj.data.request.resourceType;
            $scope.requestXml.request.envConditions = $scope.requestObj.data.request.envConditions;
            var xacmlXml = xacmlParsingService.generateXacmlRequestPayload('xml', $scope.requestXml);
            var xmlObj = x2js.json2xml_str(eval(xacmlXml));
            $scope.requestObj.xmlData = xmlObj;
        };

        $scope.resetForm = function() {
            if ($scope.requestObj.data.request === null) {} else {
                dialogService.confirm({
                    msg: $filter('translate')('createpolicy.reset.confirm'),
                    buttonList: buttonListForDiscarding
                });
            }
        };

        $scope.testRequest = function(frm) {
            var requestData = $scope.requestObj.data;
            var submitFlag = true;
            var conditions = requestData.request.subjectConditions;
            angular.forEach(conditions, function (condition) {
                if ((condition.attribute.attrName == "subject-id" || condition.attribute == "subject-id") && condition.values.length == 0) {
                    submitFlag = false;
                    return;
                }
            });

            var conditions = requestData.request.resourceConditions;
            angular.forEach(conditions, function (condition) {
                if ((condition.attribute.attrName == "resource-id" || condition.attribute == "resource-id") && condition.values.length == 0) {
                    submitFlag = false;
                    return;
                }
            });

            var payload = prepareTestRequestPayload($scope.requestObj.data);
            if(submitFlag){
                evaluateRequest(payload);            
            }
        };

        var prepareTestRequestPayload = function(requestData) {
            var requestPayload = getEmptyRequestPayload();
            var currentUser = userService.getCurrentUserProfile();
            var defaultSubjectExists = false;
            //subject
            if (requestData.request.subjectConditions.length) {
                var conditions = requestData.request.subjectConditions;
                angular.forEach(conditions, function (condition) {
                    var sub = '';
                    if (condition.values.length > 1) {
                        sub = getMultiValuedAttribute(condition);
                    } else if (condition.values.length == 1) {
                        sub = getAttribute(condition);
                    } else {
                        sub = getAttributeNullValue(condition);
                    }
                    switch(condition.attribute.type){
                        case 'host':
                            requestPayload.host.push(sub);
                            break;
                        case 'application':
                            requestPayload.application.push(sub);
                            break;
                        default:
                            requestPayload.subject.push(sub);
                            break;
                    }
                    //requestPayload.subject.push(sub);
                    if (condition.attribute.attrName == "subject-id" || condition.attribute == "subject-id") {
                        defaultSubjectExists = true;
                    }
                });
                if (!defaultSubjectExists) {
                    requestPayload.subject.push(getAttribute(defaultSubjectIdCondition));
                }
            } else {
                requestPayload.subject.push(getAttribute(defaultSubjectIdCondition));
            }
            //resource
            $scope.resTypeAttr = {
                attributeId: 'resource-type',
                attributeValue: $scope.requestObj.data.request.resourceType.shortName || ' '
            }; 
            requestPayload.resource.push($scope.resTypeAttr);

            var defaultResourceExists = false;
            if (requestData.request.resourceConditions.length) {
                var conditions = requestData.request.resourceConditions;
                angular.forEach(conditions, function (condition) {
                    var res = '';
                    if (condition.values.length > 1) {
                        res = getMultiValuedAttribute(condition);
                    } else if (condition.values.length == 1) {
                        res = getAttribute(condition);
                    } else {
                        res = getAttributeNullValue(condition);
                    }
                    requestPayload.resource.push(res);
                    if (condition.attribute.attrName == "resource-id" || condition.attribute == "resource-id") {
                        defaultResourceExists = true;
                    }
                });
                if (!defaultResourceExists) {
                    requestPayload.resource.push(getAttribute(defaultResourceIdCondition));
                }
            } else {
                requestPayload.resource.push(getAttribute(defaultResourceIdCondition));
            }
            //action
            $scope.act = {
                attributeId: 'action-id',
                attributeValue: requestData.request.action.shortName || ''
            };
            requestPayload.action.push($scope.act);

            //environment
            if (requestData.request.envConditions.length) {
                var conditions = requestData.request.envConditions;
                angular.forEach(conditions, function(condition) {
                    var env = '';
                    if (condition.values.length > 1) {
                        env = getMultiValuedAttribute(condition);
                    } else {
                        env = getAttribute(condition);
                    }
                    requestPayload.environment.push(env);
                });
            }
            //On Demand policyIds
            var pods = $scope.selectedPolicies;
            angular.forEach(pods, function(pod) {
                requestPayload.onDemandPolicyIds.push(pod.id);
            });

            //On Demand Policy Criteria
            var criteria = $scope.selectPoliciesCriteria;
            angular.forEach(criteria, function(criterion) {
                requestPayload.onDemandPolicyCriteria.push(criterion);
            });
            if (!$scope.selectedPolicies.length && !$scope.selectPoliciesCriteria.length) {
                var criteria = {
                    "field": "status",
                    "type": "MULTI",
                    "value": {
                        "type": "String",
                        "value": ["APPROVED", "DRAFT", "DE_ACTIVATED"]
                    }
                };
                requestPayload.onDemandPolicyCriteria.push(criteria);
            };
            //debug logs flag
            requestPayload.debug = $scope.showEvalLogs.val;
            return requestPayload;
        }

        $scope.handleKeyPress = function(event, condition) {
            switch(event.keyCode){
                // 13 === enter; 9 === tab; 27 === esc
                case 13:
                case 9:
                    event.stopPropagation();
                    $scope.addValue(condition);
                    break;
                case 27:
                    $scope.clearValue(condition);
                    break;
                default:
                    $(event.target).focus();
                    break;
            }
        };

        function getAttributeNullValue(condition){
            var attribute = {
                attributeId: condition.attribute.attrShortName || condition.attribute,
                attributeValue: "",
                type: ""
            };
            return attribute;
        }

        function getAttribute(condition) {
            var attribute = {
                attributeId: condition.attribute.attrShortName || condition.attribute,
                attributeValue: condition.values[0],
                type: condition.attribute.type
            };
            return attribute;
        }

        function getMultiValuedAttribute(condition) {
            var attribute = {
                attributeId: condition.attribute.attrShortName || condition.attribute,
                listValue: condition.values,
                type: condition.attribute.type
            };
            return attribute;
        }

        function evaluateRequest(payload) {
            $scope.errorResponse = "";
            requestBuilderService.evaluateRequest(payload, function(response) {
                var responseData = {}
                if(response.data) {
                    responseData = response.data;
                    $scope.responseObj.data = responseData;                        
                    var decisionVal = responseData.decision;
                    if (decisionVal == 'Permit') {
                        responseData.decision = "Allow";
                        $scope.decisionClass = 'cc-pv-decision-allow-color';
                    } else if (decisionVal == 'Deny') {
                        $scope.decisionClass = 'cc-pv-decision-deny-color';
                    } else if (decisionVal == 'NotApplicable') {
                        responseData.decision = "Not Applicable";
                        $scope.decisionClass = 'cc-pv-decision-not-applicable-color';
                    } else {
                        responseData.decision = "Indeterminate";
                        $scope.decisionClass = 'cc-pv-decision-indeterminate-color';
                    }
                    angular.forEach($scope.responseObj.data.obligations, function(obligation){
                        var attributeAssignment = obligation.attributeAssignment
                        attributeAssignment.forEach(function(item, index, object){
                            if(item.attributeId === "policy_model_id"){
                                object.splice(index,1);
                            }
                        })
                    })
                    $scope.responseObj.jsonData = xacmlParsingService.generateXacmlResponsePayload('json', responseData);

                    var xacmlXmlResp = xacmlParsingService.generateXacmlResponsePayload('xml', responseData);
                    var xmlRespObj = x2js.json2xml_str(eval(xacmlXmlResp));
                    $scope.responseObj.xmlData = xmlRespObj;

                    //get evaluation logs if debug flag is set
                    if ($scope.showEvalLogs.val && $scope.responseObj.data.logId > 0) {
                        requestBuilderService.getEvalLogsById($scope.responseObj.data.logId, function(response) {
                            if (response.data.length) {
                                setEvalLogContent(response.data);
                            }
                        });
                    }
                } else {
                    $scope.errorResponse = response.message;
                }
                $scope.selectedTab.val = 1;
            });
        }

        function setEvalLogContent(logsContent) {   
            angular.forEach(logsContent, function(logContent) { 
				if(logContent.mappingDetails){

                    if(logContent.mappingPolicyDetails["ALLOW"] != undefined){
                        $scope.evalLog.allowPolicies = logContent.mappingPolicyDetails["ALLOW"].join("\n\t");
                    }else{
                        $scope.evalLog.allowPolicies = "None";
                    }	

                    if(logContent.mappingPolicyDetails["DENY"] != undefined){
                        $scope.evalLog.denyPolicies = logContent.mappingPolicyDetails["DENY"].join("\n\t");
                    }else{
                        $scope.evalLog.denyPolicies = "None";
                    }

                    if(logContent.mappingPolicyDetails["NO_MATCH"] != undefined){
                        $scope.evalLog.noMatchPolicies = logContent.mappingPolicyDetails["NO_MATCH"].join("\n\t");
                    }else{
                        $scope.evalLog.noMatchPolicies = "None";
                    }			
				}else{
					var evalLogContent = logContent.content;
					var responseIndex = evalLogContent.indexOf('Result:');
			
					$scope.evalLog.requestParams = evalLogContent.substring(evalLogContent.indexOf('application'), responseIndex);
					$scope.evalLog.evalResponse = evalLogContent.substring(responseIndex);
				}
                var logGenDate = new Date(logContent.timestamp);
                var datetimecontent = "New log created on : " + logGenDate + " \n";
                $scope.evalLog.logdatetime = datetimecontent
               
                /*unshift or push to logData array removed to display only the most recent log*/
               // $scope.evalLog.logData = logData;
                /*unshift: to implement LIFO display in logs*/
                /*$scope.evalLog.logData.unshift(logData);*/ 
            });
            $scope.logData = true;
        }

        function isInvalidRequestCondition(conds) {
            var isInvalidCond = false;
            angular.forEach(conds, function(cond) {
                if (!cond.values.length) {
                    isInvalidCond = true;
                }
            });
            return isInvalidCond;
        }

        $scope.getSavedPolicySearchCriteria = function() {
          getSavedSearchForPolicy();
        }

        $scope.filterSubjectAttributes = function (key) {
            var result = [];
            angular.forEach($scope.subjectOptions, function (subjectOption) {
                result.push({
                    label: subjectOption.policyModelName,
                    isGroup: true
                });
                angular.forEach(subjectOption.conditions, function (subjectAttribute) {
                    if (key.length == 0 || subjectAttribute.attrName.toLowerCase().indexOf(key.toLowerCase()) > -1) {
                        result.push(subjectAttribute);
                    }
                });
                if (result && result[result.length - 1].isGroup) {
                    result.pop();
                }
            });
            return result;
        }

        function getSavedSearchForPolicy() {
          policyService.getSavedSearch(function(savedSearch) {
              $scope.selectFilterOptions = savedSearch.data;
          });
        }

        $scope.addDefaultHostOrAppAttr = function (condition) {
            var hostIPConditionExists = false;
            var hostNameConditionExists = false;
            var hasHost = false;
            var hasApplication = false;
            var appIdConditionExists = false;
            var indexInetAddress = -1;
            var inddexAppId = -1;

            let iNetAddressCondition;
            let hostCondition;
            let applicationIdCondition;

            angular.forEach($scope.requestObj.data.request.subjectConditions, function (condition, index) {
                if (condition.attribute.attrName == "inet_address" || condition.attribute == "inet_address") {
                    iNetAddressCondition = condition;
                    indexInetAddress = index;
                } else if (condition.attribute.attrName == "host" || condition.attribute == "host") {
                    hostCondition = condition;
                } else if (condition.attribute.attrName == "application-id" || condition.attribute == "application-id") {
                    applicationIdCondition = condition;
                    indexAppId = index;
                }

                hasHost = hasHost || (!condition.implicit && condition.attribute.type === "host");
                hasApplication = hasApplication || (!condition.implicit && condition.attribute.type === "application");
            });


            if (hasHost) {
                if (hostCondition && !iNetAddressCondition) {
                    hostCondition.mandatory = true;
                }

                if (!hostCondition && iNetAddressCondition) {
                    iNetAddressCondition.mandatory = true;
                }

                if (hostCondition && iNetAddressCondition) {
                    hostCondition.mandatory = false;
                    iNetAddressCondition.mandatory = false;
                }

                if (!hostCondition && !iNetAddressCondition) {
                    $scope.requestObj.data.request.subjectConditions.push(defaultHostIPCondition);
                }
            } else {
                if (hostCondition) {
                    hostCondition.mandatory = false;
                }
                if (iNetAddressCondition) {
                    iNetAddressCondition.mandatory = false;
                    if (iNetAddressCondition.implicit) {
                        if (indexInetAddress !== -1) {
                            $scope.requestObj.data.request.subjectConditions.splice(indexInetAddress, 1);
                        }
                    }
                }
            }

            if (hasApplication) {
                if(applicationIdCondition) {
                    applicationIdCondition.mandatory = true;
                } else {
                    $scope.requestObj.data.request.subjectConditions.push(defaultApplicationIdCondition);
                }
            } else {
                if(applicationIdCondition) {
                    applicationIdCondition.mandatory = false;
                    if (applicationIdCondition.implicit) {
                        if (indexAppId !== -1) {
                            $scope.requestObj.data.request.subjectConditions.splice(indexAppId, 1);
                        }
                    }
                }
            }
        }

        var decisionVal = $scope.responseObj.data.decision;
		if(typeof decisionVal === 'string') {
			if (decisionVal == 'Allow') {
				$scope.decisionClass = 'cc-pv-decision-allow-color';
			} else if (decisionVal == 'Deny') {
				$scope.decisionClass = 'cc-pv-decision-deny-color';
			} else if (decisionVal == 'Not Applicable') {
				$scope.decisionClass = 'cc-pv-decision-not-applicable-color';
			} else {
				$scope.decisionClass = 'cc-pv-decision-indeterminate-color';
			}
        }
    }
]);
