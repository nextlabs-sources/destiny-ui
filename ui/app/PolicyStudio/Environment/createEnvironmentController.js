policyStudio.controller('createEnvironmentController', ['$scope',
    '$stateParams', '$filter', 'dialogService', '$state', 'userService', 'secureStoreService', 'environmentService', '$rootScope', 'userManualTranslateService',
    function ($scope, $stateParams, $filter, dialogService, $state,
        userService, secureStoreService, environmentService, $rootScope, userManualTranslateService) {

        $scope.isEditMode = false
        $stateParams.environmentId && ($scope.isEditMode = true);

        userService.getPermissions('REMOTE_ENVIRONMENT', function (permissions) {
            $scope.permissions = permissions;
            (!permissions.CREATE_ENVIRONMENT_CONFIGURATION.pageLevel.result &&  !($scope.isEditMode)) && userService.showWarningAndGoBack()
        });

        $scope.environmentForm = {
            val: null
        }
        $scope.environmentTitle = null
        $scope.environment = {
            id: null,
            name: null,
            host: null,
            port: 443,
            username: null,
            password: null,
            clientId: null
        };

        let initialData = {}
        $scope.init = function () {
            let environmentId = parseInt($stateParams.environmentId)
            $scope.environments = []
            if ($scope.isEditMode) {
                environmentService.getEnvironmentbyId(environmentId, function (_environment) {
                    let environment = _environment.data
                    $scope.environment.id = environment.id
                    $scope.environment.name = environment.name
                    $scope.environment.host = environment.host
                    $scope.environment.port = environment.port
                    $scope.environment.username = environment.username
                    $scope.environment.password = environment.password
                    $scope.environment.clientId = environment.clientId
                    angular.copy($scope.environment, initialData)
                    $scope.environment = angular.copy(initialData)
                    $scope.environmentTitle = angular.copy(environment.name)
                });
            } else {
                $scope.environment.id = null
                $scope.environment.name = null
                $scope.environment.host = null
                $scope.environment.port = 443
                $scope.environment.username = null
                $scope.environment.password = null
                $scope.environment.clientId = null
                angular.copy($scope.environment, initialData)
                $scope.environment = angular.copy(initialData)
            }
        }

        $scope.reset = function () {
            dialogService.confirm({
                msg: $filter('translate')('createpolicy.reset.confirm'),
                confirmLabel: $filter('translate')('RESET'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    $scope.init()
                    $scope.saved = true
                }
            });
        }

        var stateChange = false
        $scope.backToEnvironmentList = function (form) {
            $scope.environmentForm.val = form
            if (!stateChange) {
                if (form.$pristine || $scope.saved) {
                    $state.go('PolicyStudio.EnvironmentConfiguration');
                } else {
                    dialogService.confirm({
                        msg: $filter('translate')('createEnvironment.discard.confirm'),
                        buttonList: buttonListForBackToList
                    });
                }
            }
        };

        $rootScope.immediateStateChange = function () {
            if (!$scope.saved) {
                stateChange = true
                document.getElementById("btn-add-environment-back-arrow").click();
                return $scope.environmentForm.val.$pristine;
            } else {
                return true
            }
        };

        $rootScope.stateChangeHook = function (state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function () {
                    $scope.environmentForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function () {
                }
            })
        }

        var buttonListForBackToList = [{
            label: $filter('translate')('STAY ON THIS PAGE'),
            class: 'cc-btn-discard',
            onClick: function (callback) {
                callback && callback();
            }
        }, {
            label: $filter('translate')('BACK TO ENVIRONMENT LIST'),
            class: 'cc-btn-primary',
            onClick: function (callback) {
                $scope.environmentForm.val.$setPristine();
                $state.go('PolicyStudio.EnvironmentConfiguration');
                callback && callback();
            }
        }];

        modalScope = $scope;
        $scope.addEventListener = function () {
            let element = document.getElementById('import-file');
            element.addEventListener('change', modalScope.fileChosen);
        };
        $scope.fileChosen = function ($event) {
            $scope.fileToImport = $event.target.files[0];
            $scope.fileToImportName = $scope.fileToImport.name;
            $scope.$digest();

            let payload = {
                storeName: 'cacerts',
                alias: $scope.environment.host,
                verifyTrustChain: 'true',
                aliasShouldExist: 'false',
                replaceIfAliasExist: 'true',
                file: $scope.fileToImport
            };

            importCertificate(payload)
        }
        let importCertificate = function (payload) {
            secureStoreService.importCertificate(payload, function (response) {
                dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')('secureStore.truststore.notification.certificateImported', { length: 1 }),
                    timeout: 5000
                });
            });
        };

        $scope.saved = false
        $scope.save = false
        $scope.showValidationMessage = false
        $scope.saveClicked = function (form) {
            $scope.showValidationMessage = true
            $scope.save = true
            if (form.$valid) {
                $scope.showValidationMessage = false
                $scope.testConnection(form)
            } else { $scope.save = false }
        }
        $scope.connection = {
            clicked: false,
            responseLabel: null,
            status: null
        }
        $scope.testAgain = false
        $scope.testConnection = function (form) {
            $scope.testAgain = true
            $scope.connection.clicked = true
            let environment = $scope.environment
            let message = ''
            environmentService.testConnection(environment, function (response) {
                message = response.message
                $scope.connection.responseLabel = message
                if (response.statusCode === 'success') {
                    $scope.connection.responseLabel = $filter('translate')('createEnvironment.environment.connectionTest.success')
                    $scope.connection.status = true
                    setTimeout(function(){
                        $scope.connection.responseLabel = ""
                        $scope.$digest()
                     }, 5000);
                    if ($scope.save) {
                        $scope.saveEnvironment(form)
                        $scope.save = false
                    }
                }
            });
        }
        $scope.saveEnvironment = function (form) {
            let environment = $scope.environment
            if ($scope.connection.status === true) {
                if (!$scope.isEditMode) {
                    environmentService.saveEnvironment(environment, function (response) {
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('createEnvironment.environment.add.success'),
                            backLink: "PolicyStudio.EnvironmentConfiguration",
                            backLabel: $filter('translate')('BACK TO ENVIRONMENT LIST'),
                            timeout: 5000
                        });
                        $scope.saved = true
                        $state.go('PolicyStudio.editEnvironment', {
                            environmentId: response.data
                        });
                    });
                } else {
                    environmentService.modifyEnvironment(environment, function (response) {
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('createEnvironment.environment.modify.success'),
                            backLink: "PolicyStudio.EnvironmentConfiguration",
                            backLabel: $filter('translate')('BACK TO ENVIRONMENT LIST'),
                            timeout: 5000
                        });
                        $scope.saved = true
                        $scope.init()
                        form.password.$touched = false
                    });
                }
            }
        };

        $scope.showUserManual = {};
        $scope.userManualOption = {
            app: 'Environment Administration',
            section: 'Remote Environment',
            page: 'Create Remote Environment'
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
        var watchPolicyExt = function () {
            $scope.$watch(function () {
                return $scope.policy;
            }, function (newValue, oldValue) {
                if (newValue == oldValue) return;
                $scope.setDirty($scope.policyForm.val);
            }, true);
        }


    }
]);
