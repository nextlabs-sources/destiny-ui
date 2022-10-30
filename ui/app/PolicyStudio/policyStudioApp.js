var policyStudio = angular.module('policyStudioApp',
    ['ui.router','ui.bootstrap','ngAnimate','ngMessages','ui.sortable','ng.jsoneditor','ui.codemirror','prettifyDirective']);

policyStudio.
    config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {

            $urlRouterProvider.otherwise('/Policies');
    
            $stateProvider
				.state('PolicyStudio.createPolicy', {
                    url: '/Policies/create',
                    templateUrl: 'ui/app/PolicyStudio/Policy/createPolicy.html',
                    params: {
                        folderId: null,
                        folderPath: null,
                        parentPolicy: null,
                        tab: null
                    }
                })
                .state('PolicyStudio.Policies', {
                    url: '/Policies',
                    templateUrl: 'ui/app/PolicyStudio/Policy/policyList.html'
                })
                .state('PolicyStudio.editPolicy', {
                    url: '/Policies/Policy/:policyId',
                    templateUrl: 'ui/app/PolicyStudio/Policy/editPolicy.html',
                    params: {
                        parentPolicy: null,
                        tab: null
                    }
                })
                .state('PolicyStudio.Components', {
                    url: '/Components/{type}',
                    templateUrl: 'ui/app/PolicyStudio/Component/componentList.html',
                })
				.state('PolicyStudio.createComponent', {
                    url: '/Components/{type}/create',
                    templateUrl: 'ui/app/PolicyStudio/Component/createComponent.html',
                    params: {
                        folderId: null,
                        folderPath: null,
                        parentComponent: null,
                        tab: null
                    }
                })
                .state('PolicyStudio.editComponent', {
                    url: '/Components/{type}/:componentId',
                    templateUrl: 'ui/app/PolicyStudio/Component/editComponent.html',
                    params: {
                        parentComponent: null,
                        tab: null,
                        isReverted: false
                    }
                })
			    .state('PolicyStudio.PolicyModel', {
                    url: '/PolicyModel',
                    templateUrl: 'ui/app/PolicyStudio/Resource/resourceList.html',
                })
                .state('PolicyStudio.createPolicyModel', {
                    url: '/PolicyModel/create',
                    templateUrl: 'ui/app/PolicyStudio/Resource/createResource.html'
                })
				.state('PolicyStudio.editPolicyModel', {
                    url: '/PolicyModel/:resourceId',
                    templateUrl: 'ui/app/PolicyStudio/Resource/createResource.html'
                })
                .state('PolicyStudio.PolicyValidator', {
                   url: '/PolicyValidator/create',
                   templateUrl: 'ui/app/PolicyStudio/Tools/PolicyValidator/createRequest.html', 
                })
                .state('PolicyStudio.SecureStore', {
                    url: '/Tools/SecureStore',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/secureStore.html', 
                 })
                 .state('PolicyStudio.listSecureStore', {
                    url: '/Tools/SecureStore/list/:storeType',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/secureStoreList.html'
                 })
                 .state('PolicyStudio.viewKey', {
                    url: '/Tools/SecureStore/key/view/:storeName/:alias',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/key-editor.html'
                 })
                 .state('PolicyStudio.createKey', {
                    url: '/Tools/SecureStore/key/create',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/key-editor.html'
                 })
                 .state('PolicyStudio.renewKey', {
                    url: '/Tools/SecureStore/key/renew/:storeName/:alias',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/key-editor.html'
                 })
                 .state('PolicyStudio.viewCertificate', {
                    url: '/Tools/SecureStore/certificate/view/:storeName/:alias',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/certificate-editor.html'
                 })
                 .state('PolicyStudio.createCertificate', {
                    url: '/Tools/SecureStore/certificate/create',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/certificate-editor.html'
                 })
                 .state('PolicyStudio.renewCertificate', {
                    url: '/Tools/SecureStore/certificate/renew/:storeName/:alias',
                    templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/certificate-editor.html'
                 })
                 .state('PolicyStudio.PDPPlugin', {
                    url: '/Tools/PDPPlugin',
                    templateUrl: 'ui/app/PolicyStudio/Tools/PDPPlugin/pdpPluginList.html', 
                 })
                 .state('PolicyStudio.addPDPPlugin', {
                    url: '/Tools/PDPPlugin/create',
                    templateUrl: 'ui/app/PolicyStudio/Tools/PDPPlugin/partials/pdpPlugin-editor.html', 
                 })
                 .state('PolicyStudio.modifyPDPPlugin', {
                    url: '/Tools/PDPPlugin/modify/:id',
                    templateUrl: 'ui/app/PolicyStudio/Tools/PDPPlugin/partials/pdpPlugin-editor.html', 
                 })
                .state('PolicyStudio.Enrollment', {
                    url: '/Tools/EnrollmentManagement/password-encryption',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/enrollmentManagementTools.html', 
                 })
                 .state('PolicyStudio.enrolledDataViewer', {
                    url: '/Tools/EnrollmentManagement/EnrolledDataViewer',
                    templateUrl: 'ui/app/PolicyStudio/Tools/EnrolledDataViewer/enrolledDataViewer.html'
                 })
                 .state('PolicyStudio.Task', {
                    url: '/Tools/EnrollmentManagement/Enrollments',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/enrollmentList.html', 
                 })
                 .state('PolicyStudio.Locations', {
                    url: '/Tools/EnrollmentManagement/Locations/list',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/locationList.html', 
                    params: {
                        toolName: ""
                    }
                 })
                 .state('PolicyStudio.Property', {
                    url: '/Tools/EnrollmentManagement/Property/list',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/propertyList.html', 
                    params: {
                        toolName: ""
                    }
                 })
                 .state('PolicyStudio.createEnrollment', {
                    url: '/Tools/EnrollmentManagement/Enrollments/create',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/createEnrollment.html'
                 })
                 .state('PolicyStudio.editEnrollment', {
                    url: '/Tools/EnrollmentManagement/Enrollments/:taskId',
                    templateUrl: 'ui/app/PolicyStudio/Tools/Enrollment/createEnrollment.html'
                 })
                .state('PolicyStudio.XacmlPolicy', {
                    url: '/Tools/XacmlPolicy/list',
                    templateUrl: 'ui/app/PolicyStudio/Tools/XacmlPolicy/xacmlPolicyList.html',
                    params: {
                        toolName: ""
                    }
                })
                .state('PolicyStudio.AttributeProvider', {
                   url: '/AttributeProvider/list',
                   templateUrl: 'ui/app/PolicyStudio/Tools/AttributeProvider/attributeProviderList.html', 
                })
                .state('PolicyStudio.createAttributeProvider', {
                   url: '/AttributeProvider/create',
                   templateUrl: 'ui/app/PolicyStudio/Tools/AttributeProvider/createAttributeProvider.html', 
                })
                .state('PolicyStudio.SystemConfiguration', {
                    url: '/Configuration/System',
                    templateUrl: 'ui/app/PolicyStudio/SysConfig/sysConfigList.html',
                })
                .state('PolicyStudio.editSystemConfiguration', {
                    url: '/Configuration/System/:mainGroup',
                    templateUrl: 'ui/app/PolicyStudio/SysConfig/editSysConfig.html',
                    params: {
                        includeAdvanced: false
                    }
                })
                .state('PolicyStudio.LoggerConfiguration', {
                    url: '/Configuration/Log',
                    templateUrl: 'ui/app/PolicyStudio/LogConfig/logConfigList.html',
                })
                .state('PolicyStudio.EnvironmentConfiguration', {
                    url: '/Configuration/Environment',
                    templateUrl: 'ui/app/PolicyStudio/Environment/environmentList.html',
                })
                .state('PolicyStudio.CreateEnvironment', {
                    url: '/Configuration/Environment/Create',
                    templateUrl: 'ui/app/PolicyStudio/Environment/createEnvironment.html',
                })
                .state('PolicyStudio.editEnvironment', {
                    url: '/Configuration/Environment/:environmentId',
                    templateUrl: 'ui/app/PolicyStudio/Environment/editEnvironment.html',
                    params: {
                        environment: null
                    }
                });
    }])

