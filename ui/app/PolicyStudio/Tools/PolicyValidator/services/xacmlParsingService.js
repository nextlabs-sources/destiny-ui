policyStudio.factory('xacmlParsingService', ['loggerService', function(loggerService) {
    'use strict';

    var service = this;

    var generateXacmlRequestPayload = function(dataType, requestData) {
        var xacmlReqPayload = '';
        if (dataType === 'json') {
            xacmlReqPayload = createXacmlJsonPayload(requestData);
        } else {
            xacmlReqPayload = createXacmlXmlPayload(requestData);
        }
        return xacmlReqPayload;
    }

    var generateXacmlResponsePayload = function(dataType, responseData) {
        var xacmlRespPayload = '';
        if (dataType === 'json') {
            xacmlRespPayload = createXacmlJsonResponse(responseData);
        } else {
            xacmlRespPayload = createXacmlXmlResponse(responseData);
        }
        return xacmlRespPayload;
    }

    //declare all constants
    var CATEGORY_SUBJECT = 'urn:oasis:names:tc:xacml:1.0:subject-category:access-subject';
    var CATEGORY_RESOURCE = 'urn:oasis:names:tc:xacml:3.0:attribute-category:resource';
    var CATEGORY_ACTION = 'urn:oasis:names:tc:xacml:3.0:attribute-category:action';
    var CATEGORY_APPLICATION = 'urn:nextlabs:names:evalsvc:1.0:attribute-category:application';
    var CATEGORY_ENVIRONMENT = 'urn:oasis:names:tc:xacml:3.0:attribute-category:environment';
    var CATEGORY_HOST = 'urn:nextlabs:names:evalsvc:1.0:attribute-category:host';
    var CATEGORY_RECIPIENT = 'urn:oasis:names:tc:xacml:1.0:subject-category:recipient-subject';
    var CATEGORY_OTHERS_PREFIX = 'urn:nextlabs:names:evalsvc:1.0:attribute-category:environment-';

    var XACML_XML_NAMESPACE = 'urn:oasis:names:tc:xacml:3.0:core:schema:wd-17';
    var XACML_XML_SCHEMA_INSTANCE = 'http://www.w3.org/2001/XMLSchema-instance';
    var XACML_XML_SCHEMA_LOCATION = 'urn:oasis:names:tc:xacml:3.0:core:schema:wd-17 http://docs.oasis-open.org/xacml/3.0/xacml-core-v3-schema-wd-17.xsd';

    var subject_attr_id_prefix = 'urn:oasis:names:tc:xacml:1.0:subject:';
    var resource_attr_id_prefix = 'urn:oasis:names:tc:xacml:1.0:resource:';
    var resource_type_attr_id_prefix = 'urn:nextlabs:names:evalsvc:1.0:resource:';
    var action_attr_id_prefix = 'urn:oasis:names:tc:xacml:1.0:action:';
    var application_attr_id_prefix = 'urn:nextlabs:names:evalsvc:1.0:application:';
    var environment_attr_id_prefix = 'urn:oasis:names:tc:xacml:1.0:environment:';
    var host_attr_id_prefix = 'urn:nextlabs:names:evalsvc:1.0:host:';
    var recipient_attr_id_prefix = 'urn:nextlabs:names:evalsvc:1.0:recipient:';
    var other_attrs_id_prefix = 'urn:nextlabs:names:evalsvc:1.0:attribute-category:environment-';

    var attr_data_type_string = 'http://www.w3.org/2001/XMLSchema#string';
    var attr_data_type_date = 'http://www.w3.org/2001/XMLSchema#date';
    var attr_data_type_time = 'http://www.w3.org/2001/XMLSchema#time';
    var attr_data_type_any_uri = 'http://www.w3.org/2001/XMLSchema#anyURI';
    // constants declarations end here

    /* JSON formatting starts here */

    /**  XACML JSON Payload formation starts here **/
    // XACML JSON Request definition
    function getXacmlJsonRequest() {
        return {
            Request: {
                ReturnPolicyIdList: true,
                Category: []
            }
        };
    }

    //XACML Json Request Category definition
    function createNewCategory(categoryId, attributesList) {
        return {
            CategoryId: categoryId,
            Attribute: attributesList
        };
    }

    //XACML Json Request Attribute definition
    function getAttribute(idPrefix, attributeId, attributeValues) {
        var attribute = {
            DataType: attr_data_type_string,
            AttributeId: idPrefix + attributeId,
            IncludeInResult: false,
            Value: ''
        };
        //format appropriately for single and multi-valued
        var values = [];
        if (attributeValues.length > 1) {
            values = [];
            for (var i = 0; i < attributeValues.length; i++) {
                values.push(attributeValues[i]);
            }
            attribute.Value = values;
        } else {
            attribute.Value = attributeValues[0];
        }
        return attribute;
    }

    //creates xacml payload in JSON format
    function createXacmlJsonPayload(requestData) {
        var jsonPayload = getXacmlJsonRequest();
        var userConditions = [];
        var hostConditions = []; 
        var applicationConditions = [];
        angular.forEach(requestData.request.subjectConditions, function(condition){
            if(condition.attribute.type === "host") {
                var newCondition = [];
                if (condition.attribute.attrName == "inet_address" || condition.attribute == "inet_address") {
                    newCondition = JSON.parse(JSON.stringify(condition));
                    newCondition.values = [];
                    angular.forEach(condition.values, function(value){
                        newCondition.values.push(convertIpToDecimal(value).toString());
                    });
                    hostConditions.push(newCondition);
                } else {
                    hostConditions.push(condition);
                }
            } else if(condition.attribute.type === "application") {
                applicationConditions.push(condition);
            } else {
                userConditions.push(condition);
            }
        });
        //set subject attributes
        if (userConditions) {
            var categorySubject = createSubject(userConditions);
            jsonPayload.Request.Category.push(categorySubject);
        }

        if(hostConditions.length) {
            var categoryHost = createHost(hostConditions);
            jsonPayload.Request.Category.push(categoryHost);
       }
        
       if(applicationConditions.length) {
            var categoryApplication = createApplication(applicationConditions);
            jsonPayload.Request.Category.push(categoryApplication);
        
       }

        //set resource attributes
        if (requestData.request.resourceConditions.length) {
            var categoryResource = createResource(requestData.request.resourceConditions, requestData.request.resourceType.shortName);
            jsonPayload.Request.Category.push(categoryResource);
        }

        //set action
        if (!(requestData.request.action === null || requestData.request.action === '' || requestData.request.action === undefined)) {
            var action = createAction(requestData.request.action.shortName);
            jsonPayload.Request.Category.push(action);
        }

        //set Environment attributes
        if (requestData.request.envConditions.length) {
            var categoryEnvironment = createEnvironment(requestData.request.envConditions);
            jsonPayload.Request.Category.push(categoryEnvironment);
        }

        //set other categories

        return jsonPayload;
    }

    function createSubject(subjectConditions) {
        //var subIdValues = [];
        //subIdValues.push("Christina");
        //var subjectId = getAttribute(subject_attr_id_prefix, "subject-id", subIdValues);
        var subjectAttributes = getAttributesList(subjectConditions, subject_attr_id_prefix);
        //subjectAttributes.push(subjectId);
        var subject = createNewCategory(CATEGORY_SUBJECT, subjectAttributes);
        return subject;
    }

    function createResource(resourceConditions, resourceType) {
        var resourceAttributes = getResourceAttributes(resourceConditions, resourceType);
        var resource = createNewCategory(CATEGORY_RESOURCE, resourceAttributes);
        return resource;
    }

    function getResourceAttributes(conditions, resourceType) {
        var resourceAttrs = [];

/*        var resIdValues = [];
        resIdValues.push("resource-name");
        var resourceIdAttr = getAttribute(resource_attr_id_prefix, 'resource-id', resIdValues);
        resourceAttrs.push(resourceIdAttr);*/

        var resTypeValues = [];
        resTypeValues.push(resourceType);
        var resourceTypeAttr = getAttribute(resource_type_attr_id_prefix, 'resource-type', resTypeValues);
        resourceAttrs.push(resourceTypeAttr);

        angular.forEach(conditions, function(condition) {
            if(condition.attribute.attrShortName)
                var attribute = getAttribute(resource_attr_id_prefix, condition.attribute.attrShortName, condition.values);
            else
                var attribute = getAttribute(resource_attr_id_prefix, condition.attribute, condition.values);
            resourceAttrs.push(attribute);
        });

        return resourceAttrs;
    }

    function createAction(action) {
        var actValues = [];
        actValues.push(action);
        var attribute = getAttribute(action_attr_id_prefix, "action-id", actValues);
        var actionAttributes = [];
        actionAttributes.push(attribute);
        var categoryAction = createNewCategory(CATEGORY_ACTION, actionAttributes);
        return categoryAction;
    }

    function createApplication(conditions) {
        var applicationAttributes = getAttributesList(conditions, application_attr_id_prefix);
        var application = createNewCategory(CATEGORY_APPLICATION, applicationAttributes);
        return application;
    }

    function createEnvironment(conditions) {
        var envAttributes = getAttributesList(conditions, environment_attr_id_prefix);
        var environment = createNewCategory(CATEGORY_ENVIRONMENT, envAttributes);
        return environment;
    }

    function createHost(conditions) {
        var hostAttributes = getAttributesList(conditions, host_attr_id_prefix);
        var host = createNewCategory(CATEGORY_HOST, hostAttributes);
        return host;
    }

    function createRecipient() {
        var recipientAttributes = getAttributesList(conditions, recipient_attr_id_prefix);
        var recipient = createNewCategory(CATEGORY_RECIPIENT, recipientAttributes);
        return recipient;
    }

    function getAttributesList(conditions, attrIdPrefix) {
        var attributes = [];
        angular.forEach(conditions, function(condition) {
            if(condition.attribute.attrShortName)
                var attribute = getAttribute(attrIdPrefix, condition.attribute.attrShortName, condition.values);
            else
                var attribute = getAttribute(attrIdPrefix, condition.attribute, condition.values);
            attributes.push(attribute);
        });
        return attributes;
    }
    /**  XACML JSON Payload formation ends here **/

    /**  XACML JSON Response Payload generation starts here **/

    //XACML JSON Response definition
    function getXacmlJsonResponse() {
        return {
            Response: {
                Result: []
            }
        };
    }

    //XACML JSON Result definition
    function getEvaluationResult(responseData) {
        return {
            Decision: responseData.decision,
            Status: {
                StatusMessage: responseData.status.statusMessage,
                StatusCode: {
                    Value: responseData.status.statusCode
                }
            },
            Obligations: []
        };
    }

    //XACML JSON Response Obligation definition
    function getResponseObligation(obligationId) {
        return {
            Id: obligationId,
            AttributeAssignment: []
        };
    }

    //XACML JSON Response Obligation definition
    function getResponseObligationDetails(obligationParam) {
        return {
            AttributeId: obligationParam.attributeId,
            Value: obligationParam.value
        };
    }

    //creates xacml payload in JSON format
    function createXacmlJsonResponse(responseData) {
        var xacmlJsonResult = getEvaluationResult(responseData);

        var obligations = responseData.obligations;
        angular.forEach(obligations, function(obligation) {
            var obl = getResponseObligation(obligation.id);
            var parameters = obligation.attributeAssignment;
            angular.forEach(parameters, function(parameter) {
                var obligationDetails = getResponseObligationDetails(parameter);
                obl.AttributeAssignment.push(obligationDetails);
            });
            xacmlJsonResult.Obligations.push(obl);
        });

        var xacmlJsonResponse = getXacmlJsonResponse();
        xacmlJsonResponse.Response.Result.push(xacmlJsonResult);

        return xacmlJsonResponse;
    }

    /**  XACML JSON Response Payload generation ends here **/

    /* JSON formatting ends here */

    /* XML formatting starts here */

    //XACML XML request structure
    function getXacmlXmlRequest() {
        return {
            "Request": {
                "_xmlns": XACML_XML_NAMESPACE,
                "_xmlns:xsi": XACML_XML_SCHEMA_INSTANCE,
                "_xsi:schemaLocation": XACML_XML_SCHEMA_LOCATION,
                "_ReturnPolicyIdList": "false",
                "Attributes": []
            }
        };
    }

    // XACML xml request attributes list definition
    function getXMLRequestAttributesList(categoryId) {
        return {
            "_Category": categoryId,
            "Attribute": []
        };
    }

    //XACML XML Request Attribute definition
    function createNewAttribute(attrIdPrefix, attributeId, attributeValues) {
        return {
            "_IncludeInResult": "false",
            "_AttributeId": attrIdPrefix + attributeId,
            "AttributeValue": attributeValues
        };
    }

    //XACML XML response structure
    function getXacmlXmlResponse() {
        return {
            Response: {
                _xmlns: XACML_XML_NAMESPACE,
                Result: []
            }
        };
    }

    // XACML XML Response Result structure
    function getXmlResponseResult(responseData) {
        return {
            Decision: responseData.decision,
            Status: {
                StatusMessage: responseData.status.statusMessage,
                StatusCode: {
                    _Value: responseData.status.statusCode.value
                },
            },
            Obligations: []
        };
    }

    //XACML XML Response Obligation definition
    function getXmlResponseObligation(obligationId) {
        return {
            Obligation: {
                _ObligationId: obligationId,
                AttributeAssignment: []
            }
        };
    }

    //XACML XML Response Obligation definition
    function getXmlResponseObligationDetails(obligationParam) {
        return {
            _AttributeId: obligationParam.attributeId,
             __text: obligationParam.value
        };
    }

    // formats JSON object to generate the required xacml in xml format
    function createXacmlXmlPayload(requestData) {
        var xmlPayload = getXacmlXmlRequest();
        var userConditions = [];
        var hostConditions = []; 
        var applicationConditions = [];
        angular.forEach(requestData.request.subjectConditions, function(condition){
            if(condition.attribute.type === "host") {
                var newCondition = [];
                if (condition.attribute.attrName == "inet_address" || condition.attribute == "inet_address") {
                    newCondition = JSON.parse(JSON.stringify(condition));
                    newCondition.values = [];
                    angular.forEach(condition.values, function(value){
                        newCondition.values.push(convertIpToDecimal(value).toString());
                    });
                    hostConditions.push(newCondition);
                } else {
                    hostConditions.push(condition);
                }
            } else if(condition.attribute.type === "application") {
                applicationConditions.push(condition);
            } else {
                userConditions.push(condition);
            }
        });

        //set subject attributes
        if (userConditions.length) {
            var userAttrs = getCategoryAttributes(CATEGORY_SUBJECT, userConditions, subject_attr_id_prefix);
            xmlPayload.Request.Attributes.push(userAttrs);
        }

        if(hostConditions.length) {
            var hostAttrs = getCategoryAttributes(CATEGORY_HOST, hostConditions, host_attr_id_prefix);
            xmlPayload.Request.Attributes.push(hostAttrs);
        }
        
        if(applicationConditions.length) {
            var applicationAttrs = getCategoryAttributes(CATEGORY_APPLICATION, applicationConditions, application_attr_id_prefix);
            xmlPayload.Request.Attributes.push(applicationAttrs);
        }   

        //set resource attributes
        if (requestData.request.resourceConditions.length) {
            var resourceAttrs = getResourceAttributesList(requestData.request.resourceConditions, requestData.request.resourceType.shortName);
            xmlPayload.Request.Attributes.push(resourceAttrs);
        }

        // //set action
        if (!(requestData.request.action === null || requestData.request.action === '' || requestData.request.action === undefined)) {
            var action = getAction(requestData.request.action.shortName);
            xmlPayload.Request.Attributes.push(action);
        }

        //set Environment attributes
        if (requestData.request.envConditions.length) {
            var environment = getEnvironment(requestData.request.envConditions, environment_attr_id_prefix);
            xmlPayload.Request.Attributes.push(environment);
        }

        //set other categories
        return xmlPayload;
    }

    function getAction(action) {
        var actValues = [];
        actValues.push(action);
        var actAttr = createNewAttribute(action_attr_id_prefix, "action-id", actValues);

        var act = getXMLRequestAttributesList(CATEGORY_ACTION);
        act.Attribute.push(actAttr);
        return act;
    }

    function getEnvironment(conditions, attrIdPrefix) {
        var res = getXMLRequestAttributesList(CATEGORY_ENVIRONMENT);
        angular.forEach(conditions, function(condition) {
            if(condition.attribute.attrShortName)
                var envAttr = createNewAttribute(attrIdPrefix, condition.attribute.attrShortName, condition.values);
            else
                var envAttr = createNewAttribute(attrIdPrefix, condition.attribute, condition.values);
            res.Attribute.push(envAttr);
        });
        return res;
    }

    function getCategoryAttributes(category, conditions, attrIdPrefix) {
        var cat = getXMLRequestAttributesList(category);
/*        if (category === CATEGORY_SUBJECT) {
            var subjectIdValues = [];
            cat.Attribute.push(subjectId);
        }*/

        angular.forEach(conditions, function(condition) {
            if(condition.attribute.attrShortName)
                var catAttr = createNewAttribute(attrIdPrefix, condition.attribute.attrShortName, condition.values);
            else
                var catAttr = createNewAttribute(attrIdPrefix, condition.attribute, condition.values);                
            cat.Attribute.push(catAttr);
        });
        return cat;
    }

    function getResourceAttributesList(conditions, resourceType) {
        var res = getXMLRequestAttributesList(CATEGORY_RESOURCE);

/*        var resIdValues = [];
        res.Attribute.push(resourceId);*/
        if(resourceType === undefined){
            resourceType = ""
        }
        var resTypeValues = [];
        resTypeValues.push(resourceType);
        var resType = createNewAttribute(resource_type_attr_id_prefix, 'resource-type', resTypeValues);
        res.Attribute.push(resType);

        angular.forEach(conditions, function(condition) {
            if(condition.attribute.attrShortName)
                var resAttr = createNewAttribute(resource_attr_id_prefix, condition.attribute.attrShortName, condition.values);
            else
                var resAttr = createNewAttribute(resource_attr_id_prefix, condition.attribute, condition.values);
            res.Attribute.push(resAttr);
        });

        return res;
    }

    //generate XACML response in XMl format
    function createXacmlXmlResponse(responseData) {
        var xacmlXmlResult = getXmlResponseResult(responseData);

        var obligations = responseData.obligations;
        angular.forEach(obligations, function(obligation) {
            var obl = getXmlResponseObligation(obligation.id);
            var parameters = obligation.attributeAssignment;
            angular.forEach(parameters, function(parameter) {
                var obligationDetails = getXmlResponseObligationDetails(parameter);
                obl.Obligation.AttributeAssignment.push(obligationDetails);
            });
            xacmlXmlResult.Obligations.push(obl);
        });

        var xacmlXmlResponse = getXacmlXmlResponse();
        xacmlXmlResponse.Response.Result.push(xacmlXmlResult);

        return xacmlXmlResponse;
    }

    /* XML formatting ends here */

    function convertIpToDecimal(ipAddress){
        let VALID_IP_FORMAT = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (VALID_IP_FORMAT.test(ipAddress)){
            var blocks = ipAddress.split('.');
            if(blocks.length === 4)
                return ((((((+blocks[0])*256)+(+blocks[1]))*256)+(+blocks[2]))*256)+(+blocks[3]);
        }
        return ipAddress;
    }
	

    return {
        generateXacmlRequestPayload: generateXacmlRequestPayload,
        generateXacmlResponsePayload: generateXacmlResponsePayload
    }

}]);
