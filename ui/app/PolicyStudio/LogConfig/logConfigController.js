policyStudio.controller('LogConfigController', ['$scope', '$state', 'logConfigService', 'loggerService', '$filter', 'viewCacheService',
    'userService', 'configService', '$q', 'autoCloseOptionService', '$rootScope', 'dialogService',
    function ($scope, $state, logConfigService, loggerService, $filter, viewCacheService, userService, configService, $q, 
        autoCloseOptionService, $rootScope, dialogService) {
        $scope.instantSearch = configService.configObject.instantSearch;
        $scope.$parent.$parent.isCreatePage = false;
        var cachedCriteria = viewCacheService.getCachedView("PS-LOGCONFIG-LIST");
        $scope.logConfigTotal = 0;
        $scope.isTextView = true;
        var logger = loggerService.getLogger();
        $state.current.pageTitle = $filter('translate')("logconfiglist.title.logConfigManagement");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.LogConfiguration');

        if (!$rootScope.logConfigScope) {
            $rootScope.logConfigScope = $scope;
        }
        var searchReq = {};

        $scope.searchCriteria = $rootScope.logConfigScope.searchCriteria || {
            level: [],
            text: null
        };

        $scope.logConfigForm = {
            val: null,
        }

        $scope.refreshLogConfigList = function () {
            $scope.logConfigList = [];
            $scope.logConfigTotal = 0;
            searchReq = angular.copy($scope.searchCriteria)
            logConfigService.getLogConfigs(searchReq, 0, function (logConfigList) {
                $scope.logConfigList = logConfigList;
                $scope.logConfigTotal = logConfigList.length;
                $scope.logConfigForm.val.$setPristine();
                angular.forEach($scope.logConfigList, function (config) {
                    config.$dirty = false;
                });
            });
        }
        $scope.show_search = false;

        var criteriaPristine = function (criteria) {
            return !criteria.level.length && !criteria.text;
        }

        $scope.searchCriteria.pristine = true;
        var logConfigWithOpenOption = [];
        $scope.closeAllOpenOption = function () {
            if (logConfigWithOpenOption.length > 0) {
                angular.forEach(logConfigWithOpenOption, function (logConfig) {
                    logger.log(logConfig)
                    if (logConfig.optionOpen)
                        logConfig.optionOpen = false;
                });
                logConfigWithOpenOption = [];
            }
        }
        $scope.openOption = function (logConfig, open, $event) {
            if (angular.isDefined(open)) {
                logConfig.optionOpen = open;
                if (open) {
                    $scope.closeAllOpenOption();
                    autoCloseOptionService.close();
                    autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
                    logConfigWithOpenOption.push(logConfig);
                } else {
                    logConfigWithOpenOption = [];
                }
            } else return angular.isDefined(logConfig.optionOpen) ? logConfig.optionOpen : false;
        };

        $scope.applySearch = function () {
            loggerService.getLogger().log('manually refresh');
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
            $scope.refreshLogConfigList();
        }

        $scope.loadMore = function () {
            logConfigService.getLogConfigs(searchReq, $scope.logConfigList.length, function (logConfigList) {
                $scope.logConfigList = $scope.logConfigList.concat(logConfigList.data);
                $scope.logConfigTotal = logConfigList.totalNoOfRecords;
            });
        };

        var _windowResizeTimer = null;
        $(window).resize(function () {
            clearTimeout(_windowResizeTimer);
            _windowResizeTimer = setTimeout(function () {
                $scope.$apply(function () {
                    $scope.windowResizedPlaceHolder = !$scope.windowResizedPlaceHolder;
                });
            }, 200);
        });

        var resetSearchCriteria = function () {
            $scope.searchSet = null;
            angular.forEach($scope.searchOptions.levelOptions, function (level) {
                level.$_checked = false;
            });
            $scope.searchCriteria.text = null;
            $scope.levelChanged();
        };
        $scope.searchOptions = {
            levelOptions: [
                { "name": "ALL", "label": "ALL" },
                { "name": "TRACE", "label": "TRACE" },
                { "name": "DEBUG", "label": "DEBUG" },
                { "name": "INFO", "label": "INFO" },
                { "name": "WARN", "label": "WARN" },
                { "name": "ERROR", "label": "ERROR" },
                { "name": "OFF", "label": "OFF" }
            ],
            $allLevelChecked: false
        };
        $scope.searchOptions.levelLabel = '';
        var searchArgsPromises = [];
        $q.all(searchArgsPromises).then(function () {
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
            if (cachedCriteria) {
                $scope.setSearch(cachedCriteria);
            } else {
                resetSearchCriteria();
            }
            $scope.refreshLogConfigList();
        });

        $scope.clearSearch = function (notrefresh) {
            resetSearchCriteria();
            $scope.logConfigSearchForm && $scope.logConfigSearchForm.$setPristine();
            $scope.searchCriteria.pristine = true;
            !notrefresh && $scope.refreshLogConfigList();
        };
        $scope.setDirty = function () {
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
        };
        $scope.searchSet = null;
        $scope.setSearch = function (search) {
            loggerService.getLogger().log('setSearch:', search, 1)
            $scope.clearSearch(true);
            $scope.searchSet = search;
            angular.forEach(search.criteria.fields, function (field) {
                switch (field.field) {
                    case 'level':
                        angular.forEach($scope.searchOptions.levelOptions, function (level) {
                            level.$_checked = false;
                            switch (field.type) {
                                case 'MULTI':
                                    angular.forEach(field.value.value, function (fieldLevel) {
                                        if (level.name == fieldLevel) {
                                            level.$_checked = true;
                                        }
                                    });
                                    break;
                                case 'SINGLE':
                                    if (level.name == field.value.value) {
                                        level.$_checked = true;
                                    }
                                    break;
                            }
                        });
                        $scope.levelChanged();
                        break;
                    case 'text':
                        $scope.searchCriteria.text = field.value.value;
                        break;
                }
            });
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
        };

        $scope.updateLevel = function () {
            $scope.searchCriteria.level = [];
            angular.forEach($scope.searchOptions.levelOptions, function (level) {
                if (level.$_checked) $scope.searchCriteria.level.push(level);
            });
            if ($scope.searchOptions.$allLevelChecked) {
                $scope.searchOptions.levelLabel = $filter('translate')('logconfigsearch.label.allLevels');
            } else {
                $scope.searchOptions.levelLabel = '';
                angular.forEach($scope.searchCriteria.level, function (level, index) {
                    if (index > 0) $scope.searchOptions.levelLabel += ', ';
                    $scope.searchOptions.levelLabel += level.label;
                });
            }
        };
        $scope.allLevelChanged = function () {
            angular.forEach($scope.searchOptions.levelOptions, function (level) {
                level.$_checked = !$scope.searchOptions.$allLevelChecked;
            });
            $scope.levelChanged();
        };
        $scope.levelChanged = function () {

            var allLevelChecked = true;
            angular.forEach($scope.searchOptions.levelOptions, function (level) {
                allLevelChecked = allLevelChecked && !level.$_checked;
            });
            $scope.searchOptions.$allLevelChecked = allLevelChecked;
            $scope.updateLevel();
            $scope.level_search_open = false;

        };

        $scope.viewAsList = function(frm) {
            if(!frm.$pristine) {
                dialogService.confirm({
                    msg: $filter('translate')('common.discard.confirm'),
                    confirmLabel: $filter('translate')('Proceed'),
                    cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                    ok: function () {
                        getListView();
                    },
                    cancel: function () {
                    }
                });
            } else {
                getListView();
            }
        }

        var getListView = function() {
            $scope.isTextView = true;
            $scope.refreshLogConfigList();
        }

        $scope.viewAsXml = function(frm){
            if(!frm.$pristine) {
                dialogService.confirm({
                    msg: $filter('translate')('common.discard.confirm'),
                    confirmLabel: $filter('translate')('Proceed'),
                    cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                    ok: function () {
                        getXmlView();
                    },
                    cancel: function () {
                    }
                })
            } else {
                getXmlView();
            }
        }

        var getXmlView = function() {
            $scope.isTextView = false;
            logConfigService.getLogConfigsAsXml(function (logConfigXml) {
                $scope.logConfigXml = logConfigXml.data;
            });
        }

        var logConfigPayload = [];
        var preparePayload = function() {
            angular.forEach($scope.logConfigList, function(logConfig){
                if (logConfig.$dirty) {
                    var logConfigPayloadItem = {
                        "name": logConfig.name,
                        "displayName": logConfig.displayName,
                        "level": logConfig.level,
                        "appenders": logConfig.appenders
                    }
                    logConfigPayload.push(logConfigPayloadItem);
                }
            });
        }

        $scope.save = function (frm) {
            if($scope.isTextView) {
                preparePayload();
                logConfigService.updateLogConfig(logConfigPayload, function () {
                    frm.$setPristine();
                    $scope.logConfigForm.val.$setPristine();
                    var message = $filter('translate')('editlogconfig.saved.notify');
                    dialogService.notifyWithoutBlocking({
                        msg: message
                    });
                    $state.reload();
                });
            } else {
                logConfigService.saveLoggersAxXml($scope.logConfigXml , function () {
                    frm.$setPristine();
                    $scope.logConfigForm.val.$setPristine();
                    var message = $filter('translate')('editlogconfig.saved.notify');
                    dialogService.notifyWithoutBlocking({
                        msg: message
                    });
                    $state.reload();
                });
            }
        };

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
                $scope.logConfigForm.val.$setPristine();
                $state.reload();
                callback && callback();
            }
        }];


        $scope.xmlChanged = function(logConfig) {
            $scope.logConfigXml = logConfig;
        }

        $scope.discardLogConfigChanges = function (frm) {
            if (!frm.$pristine) {
                dialogService.confirm({
                    msg: $filter('translate')('createpolicy.reset.confirm'),
                    buttonList: buttonListForDiscarding
                });
            }
        };

        $scope.setDirty = function (frm, logConfig) {
            frm.$setDirty();
            logConfig.$dirty = true;
        }

        $rootScope.immediateStateChange = function () {
            return $scope.logConfigForm.val.$pristine;
        }

        $rootScope.stateChangeHook = function (state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function () {
                    $scope.logConfigForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function () {
                }
            })
        }

    }
]);