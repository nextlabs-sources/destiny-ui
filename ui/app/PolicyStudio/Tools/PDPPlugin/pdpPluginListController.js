policyStudio.controller('pdpPluginListController', 
    ['$scope', '$state', '$rootScope', '$filter', '$stateParams', 'userService', 'dialogService', 'pdpPluginService',
    function($scope, $state, $rootScope, $filter, $stateParams, userService, dialogService, pdpPluginService) {
        $state.current.pageTitle = $filter('translate')("plugin.title");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.PDPPlugin');
        $scope.isEditMode = angular.isDefined($stateParams.id);
        $scope.pluginList = [];

        $scope.checkStatus = {
            allPluginsChecked: false, 
            hasPluginChecked: false
        };

        $scope.sortOptions = [
            {"name": "modifiedDate", "label": "Last Updated", "order": "DESC"},
            {"name": "name", "label": "Name (A-Z)", "order": "ASC"},
            {"name": "name", "label": "Name (Z-A)", "order": "DESC"}
        ];

        $scope.sortBy = localStorage.getItem('pdp.sortBy') === null ? $scope.sortOptions[0] : JSON.parse(localStorage.getItem('pdp.sortBy'));
      
        $rootScope.stateChangeHook = function(state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function() {
                    $scope.configForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function() {
                }
            });
        };

        $scope.refreshPlugins = function() {
            $scope.checkStatus.allPluginsChecked = false;
            $scope.checkStatus.hasEntryChecked = false;
            pdpPluginService.list(function(resp){
                $scope.pluginList = resp.data;
            });
        };

        $scope.changeSortBy = function(sortOption) {
            localStorage.setItem('pdp.sortBy', JSON.stringify(sortOption));
            $scope.sortBy = sortOption;
        };

        $scope.delete = function(plugin) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deleteConfirmation'),
                confirmLabel: $filter('translate')('DELETE'),
                ok: function() {
                    pdpPluginService.remove(plugin.id, function() {
                        $scope.refreshPlugins();
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('pdpPlugin.message.deleted', {length : 1}),
                            timeout:5000
                        });
                    });
                }
            });
        };

        $scope.bulkDelete = function($event) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deleteConfirmation'),
                confirmLabel: $filter('translate')('DELETE'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    let selectedPluginList = [];
                    let containsItem = false;
                    angular.forEach($scope.pluginList, function (item) {
                        if(item.checked) {
                            selectedPluginList.push(item.id);
                            containsItem = true;
                        }
                    });
                    
                    if (containsItem) {
                        pdpPluginService.bulkDelete(selectedPluginList, function () {
                            $scope.refreshPlugins();
                            dialogService.notifyWithoutBlocking({
                                msg: $filter('translate')('pdpPlugin.message.deleted', { length: selectedPluginList.length }),
                                timeout: 5000
                            });
                        });
                    }
                }
            });

            $event.stopPropagation();
        };

        $scope.deploy = function(plugin) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deployConfirmation'),
                confirmLabel: $filter('translate')('DEPLOY'),
                ok: function() {
                    pdpPluginService.deploy(plugin.id, function() {
                        $scope.refreshPlugins();
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('pdpPlugin.message.deployed', {length : 1}),
                            timeout:5000
                        });
                    });
                }
            });
        };

        $scope.bulkDeploy = function($event) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deployConfirmation'),
                confirmLabel: $filter('translate')('DEPLOY'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    let selectedPluginList = [];
                    let containsItem = false;
                    angular.forEach($scope.pluginList, function (item) {
                        if(item.checked) {
                            selectedPluginList.push(item.id);
                            containsItem = true;
                        }
                    });
                    
                    if (containsItem) {
                        pdpPluginService.bulkDeploy(selectedPluginList, function () {
                            $scope.refreshPlugins();
                            dialogService.notifyWithoutBlocking({
                                msg: $filter('translate')('pdpPlugin.message.deployed', { length: selectedPluginList.length }),
                                timeout: 5000
                            });
                        });
                    }
                }
            });

            $event.stopPropagation();
        };

        $scope.deactivate = function(plugin) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deactivateConfirmation'),
                confirmLabel: $filter('translate')('DEACTIVATE'),
                ok: function() {
                    pdpPluginService.deactivate(plugin.id, function() {
                        $scope.refreshPlugins();
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('pdpPlugin.message.deactivated', {length : 1}),
                            timeout:5000
                        });
                    });
                }
            });
        };

        $scope.bulkDeactivate = function($event) {
            dialogService.confirm({
                msg: $filter('translate')('pdpPlugin.message.deactivateConfirmation'),
                confirmLabel: $filter('translate')('DEACTIVATE'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    let selectedPluginList = [];
                    let containsItem = false;
                    angular.forEach($scope.pluginList, function (item) {
                        if(item.checked) {
                            selectedPluginList.push(item.id);
                            containsItem = true;
                        }
                    });
                    
                    if (containsItem) {
                        pdpPluginService.bulkDeactivate(selectedPluginList, function () {
                            $scope.refreshPlugins();
                            dialogService.notifyWithoutBlocking({
                                msg: $filter('translate')('pdpPlugin.message.deactivated', { length: selectedPluginList.length }),
                                timeout: 5000
                            });
                        });
                    }
                }
            });

            $event.stopPropagation();
        };

        $scope.checkAllPlugins = function(checked) {
            $scope.checkStatus.hasEntryChecked = checked;

            angular.forEach($scope.pluginList, function(item) {
                item.checked = checked;
            });

            $scope.pluginCheckStatusChanged();
        };

        $scope.pluginCheckStatusChanged = function() {
            var allPluginsChecked = true;
            var hasPluginChecked = false;

            angular.forEach($scope.pluginList, function(item) {
                allPluginsChecked = allPluginsChecked && item.checked;
                hasPluginChecked = hasPluginChecked || item.checked;
            });
            
            $scope.checkStatus.allPluginsChecked = allPluginsChecked;
            $scope.checkStatus.hasPluginChecked = hasPluginChecked;
        };

        $scope.refreshPlugins();

        $scope.edit = function(plugin) {
            $state.go('PolicyStudio.modifyPDPPlugin', {
                id: plugin.id
            });
        }
    }
]);