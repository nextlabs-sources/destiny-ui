policyStudio.controller('SysConfigListController', ['$scope', '$state', 'sysConfigService', 'loggerService', '$filter', 'viewCacheService',
    'userService', 'configService', '$q', 'autoCloseOptionService', '$rootScope',
    function ($scope, $state, sysConfigService, loggerService, $filter, viewCacheService, userService, configService, $q, autoCloseOptionService, $rootScope) {
        $scope.instantSearch = configService.configObject.instantSearch;
        $scope.$parent.$parent.isCreatePage = false;
        var cachedCriteria = viewCacheService.getCachedView("PS-SYSCONFIG-LIST");
        $scope.sysConfigTotal = 0;
        var logger = loggerService.getLogger();
        $state.current.pageTitle = $filter('translate')("sysconfiglist.title.sysConfigManagement");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.SysConfiguration');

        if(!$rootScope.sysConfigScope){
            $rootScope.sysConfigScope = $scope;
        }
        var searchReq = {};
        $scope.searchCriteria = $rootScope.sysConfigScope.searchCriteria || {
            group: [],
            text: null,
            includeAdvanced: false,
            sortBy: null
        };

        $scope.refreshSysConfigList = function () {
            $scope.sysConfigList = [];
            $scope.sysConfigTotal = 0;
            searchReq = angular.copy($scope.searchCriteria)
            sysConfigService.getSysConfigs(searchReq, 0, function (sysConfigList) {
                angular.forEach($filter('orderBy')(sysConfigList, 'mainGroupOrder'), function (sysConfig) {
                    sysConfig.lastModifiedOn = sysConfig.lastModifiedOn === null ? sysConfig.lastModifiedOn : new Date(moment(sysConfig.lastModifiedOn)).getTime();
                });
                $scope.sysConfigList = sysConfigList;
                $scope.sysConfigTotal = sysConfigList.length;
            });
        }
        $scope.show_search = false;

        var criteriaPristine = function (criteria) {
            return !criteria.group.length && !criteria.text;
        }

        $scope.searchCriteria.pristine = true;
        var sysConfigWithOpenOption = [];
        $scope.closeAllOpenOption = function () {
            if (sysConfigWithOpenOption.length > 0) {
                angular.forEach(sysConfigWithOpenOption, function (sysConfig) {
                    logger.log(sysConfig)
                    if (sysConfig.optionOpen)
                        sysConfig.optionOpen = false;
                });
                sysConfigWithOpenOption = [];
            }
        }
        $scope.openOption = function (sysConfig, open, $event) {
            if (angular.isDefined(open)) {
                sysConfig.optionOpen = open;
                if (open) {
                    $scope.closeAllOpenOption();
                    autoCloseOptionService.close();
                    autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
                    sysConfigWithOpenOption.push(sysConfig);
                } else {
                    sysConfigWithOpenOption = [];
                }
            } else return angular.isDefined(sysConfig.optionOpen) ? sysConfig.optionOpen : false;
        };
        $scope.editSysConfig = function (sysConfig) {
            loggerService.getLogger().log('edit system configuration:', sysConfig, 1);
            $state.go('PolicyStudio.editSystemConfiguration', {
                mainGroup: sysConfig.group,
                includeAdvanced: $scope.searchCriteria.includeAdvanced
            });
        };

        $scope.applySearch = function () {
            loggerService.getLogger().log('manually refresh');
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
            $scope.refreshSysConfigList();
        }

        $scope.loadMore = function () {
            sysConfigService.getSysConfigs(searchReq, $scope.sysconfigList.length, function (sysconfigList) {
                $scope.sysconfigList = $scope.sysconfigList.concat(sysconfigList.data);
                $scope.sysConfigTotal = policyList.totalNoOfRecords;
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
            $scope.searchCriteria.sortBy = $scope.searchOptions.sortOptions[0];
            $scope.searchSet = null;
            angular.forEach($scope.searchOptions.groupOptions, function (group) {
                group.$_checked = false;
            });
            $scope.searchCriteria.text = null;
            $scope.groupChanged();
        };
        $scope.searchOptions = {
            groupOptions: [],
            sortOptions: [],
            $allGroupChecked: false
        };
        $scope.searchOptions.groupLabel = '';
        var searchArgsPromises = [];
        searchArgsPromises.push(sysConfigService.retrieveSearchOption(function (searchOptions) {
            $scope.searchOptions.groupOptions = searchOptions.data.groupOptions;
            $scope.searchOptions.sortOptions = searchOptions.data.sortOptions;
        }));
        $q.all(searchArgsPromises).then(function () {
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
            if (cachedCriteria) {
                $scope.setSearch(cachedCriteria);
            } else { 
                resetSearchCriteria();
            }
            $scope.refreshSysConfigList();
            $scope.$watch(function () {
                return $scope.instantSearch ? $scope.searchCriteria : $scope.searchCriteria.sortBy
            }, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return
                }
                loggerService.getLogger().log('should get new system configuration list now.', 1);
                $scope.refreshSysConfigList();
            }, true);
        });

        $scope.clearSearch = function (notrefresh) {
            resetSearchCriteria();
            $scope.sysConfigSearchForm && $scope.sysConfigSearchForm.$setPristine();
            $scope.searchCriteria.pristine = true;
            !notrefresh && $scope.refreshSysConfigList();
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
                    case 'group':
                        angular.forEach($scope.searchOptions.groupOptions, function (group) {
                            group.$_checked = false;
                            switch (field.type) {
                                case 'MULTI':
                                    angular.forEach(field.value.value, function (fieldGroup) {
                                        if (group.name == fieldGroup) {
                                            group.$_checked = true;
                                        }
                                    });
                                    break;
                                case 'SINGLE':
                                    if (group.name == field.value.value) {
                                        group.$_checked = true;
                                    }
                                    break;
                            }
                        });
                        $scope.groupChanged();
                        break;
                    case 'text':
                        $scope.searchCriteria.text = field.value.value;
                        break;
                }
            });
            $scope.searchCriteria.pristine = criteriaPristine($scope.searchCriteria);
        };

        $scope.updateGroup = function () {
            $scope.searchCriteria.group = [];
            angular.forEach($scope.searchOptions.groupOptions, function (group) {
                if (group.$_checked) $scope.searchCriteria.group.push(group);
            });
            if ($scope.searchOptions.$allGroupChecked) {
                $scope.searchOptions.groupLabel = $filter('translate')('sysconfigsearch.label.allGroups');
            } else {
                $scope.searchOptions.groupLabel = '';
                angular.forEach($scope.searchCriteria.group, function (group, index) {
                    if (index > 0) $scope.searchOptions.groupLabel += ', ';
                    $scope.searchOptions.groupLabel += ($filter('translate')('sysconfig.' + group.label));
                });
            }
        };
        $scope.allGroupChanged = function () {
            angular.forEach($scope.searchOptions.groupOptions, function (group) {
                group.$_checked = !$scope.searchOptions.$allGroupChecked;
            });
            $scope.groupChanged();
        };
        $scope.groupChanged = function () {

            var allGroupChecked = true;
            angular.forEach($scope.searchOptions.groupOptions, function (group) {
                allGroupChecked = allGroupChecked && !group.$_checked;
            });
            $scope.searchOptions.$allGroupChecked = allGroupChecked;
            $scope.updateGroup();
            $scope.group_search_open = false;

        };

        $scope.toggleAdvancedConfigs = function() {
            $scope.refreshSysConfigList();
        };

    }
]);