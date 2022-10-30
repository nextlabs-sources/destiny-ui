policyStudio.controller('editSysConfigController', ['$timeout', '$scope', '$http', 'constants', 'sysConfigService', 'loggerService',
    '$uibModal', '$location', '$anchorScroll', '$stateParams', '$filter', 'dialogService', '$state', 'autoCloseOptionService', '$window',
    'userManualTranslateService', '$rootScope', 'moment', '$q', 'userService', 'versionService',
    function ($timeout, $scope, $http, constants, sysConfigService, loggerService, $uibModal, $location, $anchorScroll, $stateParams, $filter,
        dialogService, $state, autoCloseOptionService, $window, userManualTranslateService, $rootScope, moment, $q, userService, versionService) {
        'use strict';
        var logger = loggerService.getLogger();
        $scope.showUserManual = {};
        $scope.userManualOption = {
            app: 'Console',
            section: 'Policy Studio',
            page: 'Edit System Configuration',
        }
        $scope.pageOptionList = {};
        $scope.$parent.transition = "fade-in";
        $scope.$parent.$parent.isCreatePage = true;
        userService.goBackIfAccessDeniedToApp('PolicyStudio.SysConfiguration');
        $scope.mainGroup = $stateParams.mainGroup;
        $scope.includeAdvanced = $stateParams.includeAdvanced;
        $scope.inputTypePassword = 'password';
        $scope.inputTypeCheckbox = 'checkbox';
        $scope.inputTypeNumber = 'number';
        $scope.inputTypeText = 'text';
        sysConfigService.getSysConfigsByMainGroup($stateParams.mainGroup, $stateParams.includeAdvanced, function (sysConfig) {
            if (!sysConfig) {
                dialogService.notify({
                    msg: $filter('translate')('editsysconfig.sysconfig.unavailable'),
                    ok: function () {
                        $window.history.back();
                        return;
                    }
                })
            }
            $scope.sysConfig = sysConfig;
            angular.forEach($scope.sysConfig, function (configs) {
                angular.forEach($filter('orderBy')(configs, 'configOrder'), function (config) {
                    if(!$scope.pageOptionList[config.configKey] && config.description !== "") {
                        $scope.pageOptionList[config.configKey] = config.description;
                        $scope.showUserManual[config.configKey] = false;
                    }
                    config.options = (config.options === null || config.options === "") ? config.options : config.options.split(",").map(function (option) {
                        return option.trim();
                    });
                    config.value = (config.fieldType === $scope.inputTypeNumber && config.value !== "") ? Number(config.value) : config.value;
                    config.value = (config.fieldType === $scope.inputTypeCheckbox) ? (config.value === 'true') : config.value;
                    if(config.fieldType === $scope.inputTypePassword) {
                        config.value =  config.valueEmpty ? "" : $filter('translate')('sysconfig.password.mask');
                        config.inputType = config.fieldType;
                        config.showHideClass = "glyphicon glyphicon-eye-open";
                        config.showEye = false;
                    } 
                    config.$dirty = false;
                })
            });
        });

        var invalidChars = [
            "-",
            "+",
            "e",
            "."
          ];

        $scope.preventNonNumericalInput = function($event, type) {
            if (type === $scope.inputTypeNumber && invalidChars.includes($event.key)) {
                $event.preventDefault();
              }
        }

        var buttonListForBackToList = [{
            label: $filter('translate')('STAY ON THIS PAGE'),
            class: 'cc-btn-discard',
            onClick: function (callback) {
                // logger.log('stay');
                callback && callback();
            }
        }, {
            label: $filter('translate')('BACK TO CONFIGURATION LIST'),
            class: 'cc-btn-primary',
            onClick: function (callback) {
                $scope.sysConfigForm.val.$setPristine();
                $state.go('PolicyStudio.SystemConfiguration');
                callback && callback();
            }
        }];
        var buttonListForDiscarding = [{
            label: $filter('translate')('CANCEL'),
            class: 'cc-btn-discard',
            onClick: function (callback) {
                callback && callback();
            }
        }, {
            label: $filter('translate')('RESET'),
            class: 'cc-btn-primary',
            onClick: function (callback) {
                $scope.sysConfigForm.val.$setPristine();
                $state.reload();
                callback && callback();
            }
        }];


        $scope.discardSysConfigChanges = function (frm) {
            if (!frm.$pristine) {
                dialogService.confirm({
                    msg: $filter('translate')('createpolicy.reset.confirm'),
                    buttonList: buttonListForDiscarding
                });
            }
        };
        $scope.backToSysConfigList = function (frm) {
            if (frm.$pristine) {
                $scope.sysConfigForm.val.$setPristine();
                $state.go('PolicyStudio.SystemConfiguration');
            } else {
                dialogService.confirm({
                    msg: $filter('translate')('sysconfig.discard.confirm'),
                    buttonList: buttonListForBackToList
                });
            }
        };
        $scope.setDirty = function (frm, config) {
            frm.$setDirty();
            config.$dirty = true;
        }

        $rootScope.immediateStateChange = function () {
            return $scope.sysConfigForm.val.$pristine;
        }
        $rootScope.stateChangeHook = function (state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function () {
                    $scope.sysConfigForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function () {
                }
            })
        }

        var sysConfigPayLoad = [];
        var isRestartRequired = false;
        var prepareSysConfigPayload = function () {
            for (var configSubCategory in $scope.sysConfig) {
                var configList = $scope.sysConfig[configSubCategory];
                angular.forEach(configList, function (config) {
                    if (config.$dirty) {
                        var sysConfigPayloadItem = {
                            "application": config.application,
                            "configKey": config.configKey,
                            "value": config.value === undefined || config.value === null? "" : config.value
                        }
                        sysConfigPayLoad.push(sysConfigPayloadItem);
                        if (config.restartRequired) {
                            isRestartRequired = true;
                        }
                    }
                });
            }
        }

        $scope.save = function (frm) {
            $scope.model_error = false;
            $scope.restartRequired = false;
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
            prepareSysConfigPayload();
            sysConfigService.updateSysConfig(sysConfigPayLoad, function () {
                frm.$setPristine();
                $scope.sysConfigForm.val.$setPristine();
                var message = $filter('translate')('editsysconfig.saved.notify');
                dialogService.notifyWithoutBlocking({
                    msg: message,
                    backLink: 'PolicyStudio.SystemConfiguration',
                    backLabel: $filter('translate')('BACK TO SYSTEM CONFIGURATION LIST')
                });
                if(isRestartRequired){
                    dialogService.notifyWithoutBlocking({
                        type: 'info',
                        msg: $filter('translate')('editsysconfig.restart.notify')
                    });
                }
                $state.reload();
            });
            sysConfigPayLoad = [];
            resetFieldsDirty();
        };

        var currentTarget = "";

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

        var resetFieldsDirty = function () {
            angular.forEach($scope.sysConfig, function (configs) {
                angular.forEach(configs, function (config) {
                    config.$dirty = false;
                })
            });
            $scope.restartRequired = false;
        }

        $scope.dropdownClicked = function ($event) {
            if ($($event.target).attr('data-propagation') != 'true') $event.stopPropagation();
        };

        $scope.removeDummyMask = function(config) {
            if(config.fieldType === $scope.inputTypePassword) {
                if(/^\*+$/.test(config.value)) {
                    config.value = "";
                }
            }
        }

        $scope.addDummyMask = function(config) {
            if(config.fieldType === $scope.inputTypePassword && !config.passwordDeleted) {
                if((config.value.trim().length === 0 || /^\*+$/.test(config.value))) {
                    config.value = !config.valueEmpty ? $filter('translate')('sysconfig.password.mask') : "";
                    config.$dirty = false;
                    config.showEye = false;
                    config.inputType = config.fieldType;
                }
            }
        }

        $scope.removePassword = function(config) {
            config.passwordDeleted = true;
            config.value = "";
            config.$dirty = true;
            config.showEye = false;
            config.inputType = config.fieldType;
        }

        $scope.showEyeIcon = function(config) {
            config.showEye = true;
            config.$dirty = true;
        }

        $scope.toggleShowPassword = function(config) {
            if (config.inputType === $scope.inputTypePassword) {
                config.inputType = $scope.inputTypeText;
                config.showHideClass = 'glyphicon glyphicon-eye-close';
            }
            else {
                config.inputType = $scope.inputTypePassword;
                config.showHideClass = 'glyphicon glyphicon-eye-open';
            }
        } 
        var showAllManual = function (show) {
            for (var key in $scope.showUserManual) {
                $scope.showUserManual[key] = show;
            }
        }
        $scope.closeManual = function(key) {
            $scope.showUserManual[key] = false;
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
        var watchSysConfigExt = function () {
            $scope.$watch(function () {
                return $scope.sysConfig;
            }, function (newValue, oldValue) {
                if (newValue == oldValue) return;
                $scope.setDirty($scope.sysConfigForm.val);
            }, true);
        }
    }
]);
