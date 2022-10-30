policyStudio.controller('environmentListController', ['$scope','environmentService', 'loggerService', '$filter', 'dialogService', '$state', 'autoCloseOptionService', 'userService', 'networkService', 'autoCloseOptionService',
    function ($scope, environmentService, loggerService, $filter, dialogService, $state,
        autoCloseOptionService, userService, networkService, autoCloseOptionService) {
        let logger = loggerService.getLogger();

        userService.getPermissions('REMOTE_ENVIRONMENT', function (permissions) {
            $scope.permissions = permissions;
            userService.goBackIfAccessDeniedToApp('PolicyStudio.RemoteEnvironment');
        });

        $scope.checkStatus = {
            allEnvironmentsChecked: false,
            hasEnvironmentChecked: false,
        }
    
        $scope.searchCriteria = {
            status: [],
            effect: [],
            modifiedDate: {},
            modifiedFrom: null,
            modifiedTo: null,
            text: null,
            otherOption: null,
            sortBy: null
          };

        $scope.sortOptions = [
            {
                label: "Last Updated",
                name: "lastUpdatedDate",
                order: "DESC",
            },
            {
                label: "Name (A to Z)",
                name: "name",
                order: "ASC"
            },
            {
                label: "Name (Z to A)",
                name: "name",
                order: "DESC"
            }
        ]

        let searchReq = {}
        $scope.searchCriteria.sortBy = localStorage.getItem('environment.sortBy') === null ? $scope.sortOptions[0] : JSON.parse(localStorage.getItem('environment.sortBy'));

        $scope.refreshEnvironmentList = function () {
            $scope.environmentList = [];
            $scope.isEnvironmentExist = false
            var environmentTotal = 0
            $scope.checkStatus.allEnvironmentsChecked = false;
            $scope.checkStatus.hasEnvironmentChecked = false;
            searchReq = angular.copy($scope.searchCriteria)
            environmentService.getEnvironment(searchReq, 0, function (environmentList) {
                $scope.environmentList = environmentList.data;
                environmentTotal = environmentList.data.length
                if (environmentTotal !== 0) {
                    $scope.isEnvironmentExist = true
                }
            });
        }

        $scope.refreshSearch = function (searchOption) {
            $scope.searchCriteria.sortBy = searchOption
            localStorage.setItem('environment.sortBy', JSON.stringify(searchOption));
            $scope.refreshEnvironmentList()
        }

        $scope.environmentCheckStatusChange = function () {
            let allEnvironmentChecked = true;
            let hasEnvironmentChecked = false;

            angular.forEach($scope.environmentList, function (item) {
                allEnvironmentChecked = allEnvironmentChecked && item.checked;
                hasEnvironmentChecked = hasEnvironmentChecked || item.checked;
            });
            $scope.checkStatus.allEnvironmentChecked = allEnvironmentChecked;
            $scope.checkStatus.hasEnvironmentChecked = hasEnvironmentChecked;
        }

        let environmentWithOpenOption = [];
        $scope.closeAllOpenOption = function () {
            if (environmentWithOpenOption.length > 0) {
                angular.forEach(environmentWithOpenOption, function (environment) {
                    logger.log(environment)
                    if (environment.optionOpen)
                        environment.optionOpen = false;
                });
                environmentWithOpenOption = [];
            }
        }

        $scope.openOption = function (environment, open, $event) {
            if (angular.isDefined(open)) {
                environment.optionOpen = open;
                if (open) {
                    $scope.closeAllOpenOption();
                    autoCloseOptionService.close();
                    autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
                    environmentWithOpenOption.push(environment);
                } else {
                    environmentWithOpenOption = [];
                }
            } else return angular.isDefined(environment.optionOpen) ? environment.optionOpen : false;
        };

        $scope.editEnvironment = function (environment) {
            $state.go('PolicyStudio.editEnvironment', {
                environmentId: environment.id
            });
        }

        $scope.deleteEnvironments = function () {
            let environments = $scope.environmentList
            let ids = []
            networkService.onlyGet = true

            if (environments) {
                angular.forEach(environments, function(environment){
                    if (environment.checked) {
                        ids.push(environment.id)
                    }
                });
                dialogService.confirm({
                    msg: $filter('translate')('policylist.del.confirm'),
                    confirmLabel: $filter('translate')('DELETE'),
                    cancelLabel: $filter('translate')('CANCEL'),
                    ok: function () {
                        angular.forEach(ids, function(id){
                            environmentService.deleteEnvironment(id, function (response) {
                                 $scope.refreshEnvironmentList()
                                 angular.forEach($scope.environmentList, function(environment){
                                    environment.checked = false
                                });
                                $scope.checkStatus.allEnvironmentChecked = false
                            });
                        });
                    }
                })
            }
        }

        $scope.deleteCurrentEnvironment = function (environment) {
            dialogService.confirm({
                msg: $filter('translate')('policylist.del.confirm'),
                confirmLabel: $filter('translate')('DELETE'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    environmentService.deleteEnvironment(environment.id, function (response) {
                        $scope.refreshEnvironmentList()
                    });
                }
            })
        }

        $scope.checkAllEnvironment = function (checked) {
            if ($scope.environmentList) {
                angular.forEach($scope.environmentList, function(environment){
                    environment.checked = checked
                });
            }
            this.environmentCheckStatusChange()
        };
    }
]);
