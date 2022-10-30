controlCenterConsoleApp.factory('folderService', ['networkService', 'configService', '$q', '$uibModal', '$filter', 'dialogService',
    function (networkService, configService, $q, $uibModal, $filter, dialogService) {
        var policyFolders = {
            tree: [],
            list: [],
            open: false,
            selectedFolder: null
        }
        var getPolicyFoldersTree = function () {
            return policyFolders.tree;
        }

        var getPolicyFoldersList = function () {
            return policyFolders.list;
        }
        var isPolicyFoldersOpen = function () {
            return policyFolders.open;
        }
        var setPolicyFoldersOpen = function (open) {
            policyFolders.open = open;
        }
        var getSelectedPolicyFolder = function () {
            return policyFolders.selectedFolder;
        }
        var setSelectedPolicyFolder = function (selectedFolder) {
            policyFolders.selectedFolder = selectedFolder;
        }

        var componentFolders = {
            tree: [],
            list: [],
            open: false,
            selectedFolder: null
        }
        var getComponentFoldersTree = function () {
            return componentFolders.tree;
        }

        var getComponentFoldersList = function () {
            return componentFolders.list;
        }
        var isComponentFoldersOpen = function () {
            return componentFolders.open;
        }
        var setComponentFoldersOpen = function (open) {
            componentFolders.open = open;
        }
        var getSelectedComponentFolder = function () {
            return componentFolders.selectedFolder;
        }
        var setSelectedComponentFolder = function (selectedFolder) {
            componentFolders.selectedFolder = selectedFolder;
        }

        var refreshFolders = function (type, callback) {
            getFolders(type, function (folders) {
                if (type == 'policy') {
                    policyFolders.tree = folders;
                    policyFolders.list = createFolderList(policyFolders.tree);
                    if (policyFolders.selectedFolder) {
                        let selectedFolders = policyFolders.list.filter(function (folder) {
                            return folder.id == policyFolders.selectedFolder.id;
                        });
                        if (policyFolders.selectedFolder && selectedFolders.length > 0) {
                            policyFolders.selectedFolder = selectedFolders[0];
                        }
                    }
                    if(!policyFolders.selectedFolder) {
                        policyFolders.selectedFolder = policyFolders.tree.filter(function(folder) { return folder.id < 0})[0]; 
                    }
                } else {
                    componentFolders.tree = folders;
                    componentFolders.list = createFolderList(componentFolders.tree);
                    if (componentFolders.selectedFolder) {
                        let selectedFolders = componentFolders.list.filter(function (folder) {
                            return folder.id == componentFolders.selectedFolder.id;
                        });
                        if (componentFolders.selectedFolder && selectedFolders.length > 0) {
                            componentFolders.selectedFolder = selectedFolders[0];
                        }
                    }
                    if(!componentFolders.selectedFolder) {
                        componentFolders.selectedFolder = componentFolders.tree.filter(function(folder) { return folder.id < 0})[0]; 
                    }
                }
                callback && callback();
            });
        }

        var rename = function (folder, type) {
            $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'ui/app/partials/folder-rename-modal.html',
                controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
                    $scope.data = {
                        id: folder.id,
                        name: folder.name
                    }
                    $scope.ok = function () {
                        $uibModalInstance.close($scope.data)
                    }
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel')
                    }
                }]
            }).result
                .then(function (data) {
                    networkService.put(configService.getUrl("folders") + "/rename/" + type + "/" + folder.id, data.name, function (response) {
                        if (response.statusCode == 1000) {
                            folder.name = data.name;
                        }
                    });
                }, function () {
                })
        }

        var createFolder = function (type, folder, callback) {
            $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'ui/app/partials/folder-create-modal.html',
                controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
                    $scope.data = {
                        name: 'folder'
                    }
                    $scope.ok = function () {
                        $uibModalInstance.close($scope.data)
                    }
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel')
                    }
                }]
            }).result
                .then(function (data) {
                    networkService.post(configService.getUrl("folders") + "/save/" + type, { name: data.name, type: type, parentId: folder && folder.id > -1 ? folder.id : null }, function (response) {
                        callback && callback(response.statusCode == 1000);
                    });
                }, function () {
                    callback && callback(false);
                })
        }

        var move = function (type, folderIds, entityIds, folderReload, entityReload) {
            getFolders(type, function (folders) {
                let rootFolder = folders.filter(function(folder) {return folder.id === -1})[0];
                createFolderList(folders).forEach(function (folder) {
                    let hasFolderCreatePermission = folderIds.length == 0;
                    let hasEntityCratePermission = entityIds.length == 0;
                    folder.authorities.forEach(function (authority) {
                        if(type == 'policy') {
                            if(authority.authority == 'CREATE_POLICY_FOLDER') {
                                hasFolderCreatePermission = true;
                            }
                            if(authority.authority == 'CREATE_POLICY') {
                                hasEntityCratePermission = true;
                            }
                        } else {
                            if(authority.authority == 'CREATE_COMPONENT_FOLDER') {
                                hasFolderCreatePermission = true;
                            }
                            if(authority.authority == 'CREATE_COMPONENT') {
                                hasEntityCratePermission = true;
                            }
                        }
                    });
                    if (folderIds.indexOf(folder.id) > -1 || !hasFolderCreatePermission || !hasEntityCratePermission) {
                        folder.disabled = true;
                    }
                });
                $uibModal.open({
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'ui/app/partials/folder-move-modal.html',
                    controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
                        $scope.folders = {
                            list: folders,
                            selectedFolder: rootFolder.disabled ? null : rootFolder
                        }
                        $scope.collapseAll = function (folderId) {
                            if (folderId === -1) {
                                $scope.$broadcast('angular-ui-tree:collapse-all');
                            }
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.folders)
                        }
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel')
                        }
                        $scope.openFolder = function (folder) {
                            $scope.folders.selectedFolder = folder;
                        }
                    }]
                }).result
                    .then(function (folders) {
                        let actions = [];
                        if (folderIds.length > 0) {
                            let deferred = $q.defer();
                            networkService.put(configService.getUrl('folders') + '/move/' + type.toUpperCase() + '/folder/' + folders.selectedFolder.id, folderIds, function (data) {
                                if (data.statusCode == 1000) {
                                    deferred.resolve(true);
                                    folderReload && folderReload();
                                }
                            });
                            actions.push(deferred.promise);
                        }
                        if (entityIds.length > 0) {
                            let deferred = $q.defer();
                            networkService.put(configService.getUrl('folders') + '/move/' + type.toUpperCase() + '/' + type + '/' + folders.selectedFolder.id, entityIds, function (data) {
                                if (data.statusCode == 1000) {
                                    deferred.resolve(true);
                                    entityReload && entityReload();
                                }
                            });
                            actions.push(deferred.promise);
                        }
                        $q.all(actions)
                            .then(function (results) {
                                if (results.every(function (result) {
                                    return result;
                                })) {
                                    dialogService.notifyWithoutBlocking({
                                        msg: $filter('translate')('policylist.moved.notify', { length: folderIds.length + entityIds.length }),
                                        timeout: 5000
                                    });
                                }
                            });
                    });
            });
        }

        var parseAuthorities = function (folder, permissions) {
            if (folder.authorities && angular.isArray(folder.authorities)) {
                var authoritiesParsed = {};
                angular.forEach(folder.authorities, function (auth) {
                    var authorityName = auth.authority;
                    if (permissions[authorityName]) {
                        authoritiesParsed[auth.authority] = permissions[authorityName].rowLevel.result;
                    } else {
                        authoritiesParsed[auth.authority] = true;
                    }
                })
                return authoritiesParsed;
            }
        }

        var deleteFolders = function (type, folderIds, callback) {
            networkService.put(configService.getUrl("folders") + "/delete/" + type, folderIds, function (data) {
                callback && callback(data);
            });
        }

        var getFolders = function (type, callback) {
            networkService.get(configService.getUrl("folders") + '/all/' + type, function (data) {
                callback(data);
            });
        };

        var createFolderList = function (folders) {
            var folderList = [];
            folders.forEach(function (folder) {
                folderList.push(folder);
                if (Array.isArray(folder.children)) {
                    folderList = folderList.concat(createFolderList(folder.children));
                }
            });
            return folderList;
        }

        return {
            createFolder: createFolder,
            deleteFolders: deleteFolders,
            getComponentFoldersList: getComponentFoldersList,
            getComponentFoldersTree: getComponentFoldersTree,
            getFolders: getFolders,
            getPolicyFoldersList: getPolicyFoldersList,
            getPolicyFoldersTree: getPolicyFoldersTree,
            getSelectedComponentFolder: getSelectedComponentFolder,
            getSelectedPolicyFolder: getSelectedPolicyFolder,
            isComponentFoldersOpen: isComponentFoldersOpen,
            isPolicyFoldersOpen: isPolicyFoldersOpen,
            move: move,
            parseAuthorities: parseAuthorities,
            refreshFolders: refreshFolders,
            rename: rename,
            setComponentFoldersOpen: setComponentFoldersOpen,
            setPolicyFoldersOpen: setPolicyFoldersOpen,
            setSelectedComponentFolder: setSelectedComponentFolder,
            setSelectedPolicyFolder: setSelectedPolicyFolder,
        }
    }
]);