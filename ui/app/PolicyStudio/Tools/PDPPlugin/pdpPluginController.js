policyStudio.controller('pdpPluginController', 
    ['$scope', '$state', '$rootScope', '$filter', '$stateParams', '$window', 'userService', 'dialogService', 'userManualTranslateService', 'pdpPluginService',
    function($scope, $state, $rootScope, $filter, $stateParams, $window, userService, dialogService, userManualTranslateService, pdpPluginService) {
        $state.current.pageTitle = $filter('translate')("plugin.title");
        $scope.isEditMode = angular.isDefined($stateParams.id);
        userService.goBackIfAccessDeniedToApp('PolicyStudio.PDPPlugin');
        
        $scope.pluginForm = {
            val: null,
        };

        $rootScope.immediateStateChange = function() {
            return $scope.pluginForm.val.$pristine;
        };

        $scope.userManualOption = {
            app: 'PDP Plugin',
            section: 'Configuration',
            page: 'Plugin Details',
        };
          
        $scope.pageOptionList = null;
        $scope.showUserManual = {};
        
        userManualTranslateService.pageOptionList($scope.userManualOption, function (pageOptionList) {
            $scope.pageOptionList = pageOptionList;
            $rootScope.hasUserManual = pageOptionList;
            
            for (var key in pageOptionList) {
                $scope.showUserManual[key] = false;
            }

            for (var key in $scope.showUserManual) {
                if (!pageOptionList[key])
                    delete $scope.showUserManual[key];
            }
        });
        
        var showAllManual = function (show) {
            for (var key in $scope.showUserManual) {
                $scope.showUserManual[key] = show;
            }
        };
        
        $scope.$watch(function () {
            return $rootScope.showAboutPage;
        }, function (newValue, oldValue) {
            if (newValue == oldValue) 
                return;
            
            showAllManual(newValue);
        });
        $scope.disablePolicyName = false;
        $scope.$watch(function () {
            return $scope.showUserManual;
        }, function (newValue, oldValue) {
            if (newValue == oldValue)
                return;
            
            var showAboutPage = false;
            for (var key in $scope.showUserManual) {
                showAboutPage = showAboutPage || $scope.showUserManual[key];
            }
            $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
        }, true);

        $rootScope.stateChangeHook = function(state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function() {
                    $scope.pluginForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function() {
                }
            })
        };
        
        $scope.setDirty = function() {
            $scope.pluginForm.val && $scope.pluginForm.val.$setDirty();
        };

        $scope.plugin = {
            name: "",
            description: "",
            propertiesFile: null,
            propertiesFileObject: {
                id: 0,
                name: ""
            },
            mainJarFile: null,
            mainJarFileObject: {
                id: 0,
                name: ""
            },
            thirdPartyJarFiles: [],
            thirdPartyJarFilesObject: [],
            otherFiles: [],
            otherFilesObject: []
        };

        $scope.filesToRemove = [];

        $scope.addEventListener = function () {
            let propertiesFileElement = document.getElementById('selectPropertiesFile');
            if(propertiesFileElement) {
                propertiesFileElement.addEventListener('change', $scope.setPropertiesFile);
            }
    
            let mainJarFileElement = document.getElementById('selectMainJarFile');
            if(mainJarFileElement) {
                mainJarFileElement.addEventListener('change', $scope.setMainJarFile);
            }

            let thirdPartyJarFileElement = document.getElementById('selectThirdPartyJarFile');
            if(thirdPartyJarFileElement) {
                thirdPartyJarFileElement.addEventListener('change', $scope.setThirdPartyJarFile);
            }

            let otherFileElement = document.getElementById('selectOtherFile');
            if(otherFileElement) {
                otherFileElement.addEventListener('change', $scope.setOtherFile);
            }
        };
        
        $scope.setPropertiesFile = function($event) {
            if($event.target.files[0]) {
                $scope.plugin.propertiesFile = $event.target.files[0];
                $scope.plugin.propertiesFileObject.id = 0;
                $scope.plugin.propertiesFileObject.name = $scope.plugin.propertiesFile.name;
                $scope.propertiesFileRequired = false;
                $scope.setDirty();
                $scope.$digest();
            }
        };
        
        $scope.setMainJarFile = function($event) {
            if($event.target.files[0]) {
                $scope.plugin.mainJarFile = $event.target.files[0];
                $scope.plugin.mainJarFileObject.id = 0;
                $scope.plugin.mainJarFileObject.name = $scope.plugin.mainJarFile.name;
                $scope.mainJarFileRequired = false;
                $scope.setDirty();
                $scope.$digest();
            }
        };

        $scope.setThirdPartyJarFile = function($event) {
            angular.forEach($event.target.files, function(selectedFile) {
                let removeIndex = -1;
                angular.forEach($scope.plugin.thirdPartyJarFilesObject, function(thirdPartyJarFileObject) {
                    removeIndex += 1;
                    if(thirdPartyJarFileObject.name == selectedFile.name) {
                        if(thirdPartyJarFileObject.id != 0) {
                            $scope.filesToRemove.push(thirdPartyJarFileObject.id);
                        }
                        
                        $scope.plugin.thirdPartyJarFilesObject.splice(removeIndex, 1);
                    }
                });

                removeIndex = -1;
                angular.forEach($scope.plugin.thirdPartyJarFiles, function(thirdPartyJar) {
                    removeIndex += 1;
                    if(thirdPartyJar.name == selectedFile.name) {
                        $scope.plugin.thirdPartyJarFiles.splice(removeIndex, 1);
                    }
                });

                $scope.plugin.thirdPartyJarFiles.push(selectedFile);
                let file = {
                    id: 0,
                    name: selectedFile.name
                }
                $scope.plugin.thirdPartyJarFilesObject.push(file);
            });

            $scope.$digest();
        };


        $scope.setOtherFile = function($event) {
            angular.forEach($event.target.files, function(selectedFile) {
                let removeIndex = -1;
                angular.forEach($scope.plugin.otherFilesObject, function(otherFileObject) {
                    removeIndex += 1;
                    if(otherFileObject.name == selectedFile.name) {
                        if(otherFileObject.id != 0) {
                            $scope.filesToRemove.push(otherFileObject.id);
                        }

                        $scope.plugin.otherFilesObject.splice(removeIndex, 1);
                    }
                });

                removeIndex = -1;
                angular.forEach($scope.plugin.otherFiles, function(other) {
                    removeIndex += 1;
                    if(other.name == selectedFile.name) {
                        $scope.plugin.otherFiles.splice(removeIndex, 1);
                    }
                });

                $scope.plugin.otherFiles.push(selectedFile);
                let file = {
                    id: 0,
                    name: selectedFile.name
                }
                $scope.plugin.otherFilesObject.push(file);
            });

            $scope.$digest();
        };

        $scope.removeThirdPartyJarFile = function(index, fileId) {
            if(fileId != 0) {
                $scope.filesToRemove.push(fileId);
            }

            $scope.plugin.thirdPartyJarFiles.splice(index, 1);
            $scope.plugin.thirdPartyJarFilesObject.splice(index, 1);
        };

        $scope.removeOtherFile = function(index, fileId) {
            if(fileId != 0) {
                $scope.filesToRemove.push(fileId);
            }

            $scope.plugin.otherFiles.splice(index, 1);
            $scope.plugin.otherFilesObject.splice(index, 1);
        };


        $scope.reset = function() {
            if ($scope.pluginForm.val.$pristine) {
                $state.reload();
            } else {
                dialogService.confirm({
                    msg: $filter('translate')('pdpPlugin.message.resetConfirmation'),
                    buttonList: [{
                        label: $filter('translate')('CANCEL'),
                        class: 'cc-btn-discard',
                        onClick: function(callback) {
                            callback && callback();
                        }
                    }, {
                        label: $filter('translate')('RESET'),
                        class: 'cc-btn-primary',
                        onClick: function(callback) {
                            $scope.pluginForm.val.$setPristine();
                            $state.reload();
                            callback && callback();
                        }
                    }]
                }).then({});
            }
        };

        $scope.savePlugin = function(frm, deploy) {
            let formError = false;
            if (frm.$invalid) {
                frm.$setDirty();
                for (var field in frm) {
                    if (field[0] == '$')
                        continue;
                    frm[field].$touched = true;
                }

                $scope.$broadcast('scrollto');
                formError = true;
            }

            if(!validatePluginFiles()) {
                formError = true;
            }

            if(formError) {
                return;
            }

            let payload = {
                id: $scope.plugin.id,
                name: $scope.plugin.name,
                description: $scope.plugin.description,
                deploy: deploy,
                filesToRemove: $scope.filesToRemove
            }
            
            var action = $scope.isEditMode ? pdpPluginService.modify : pdpPluginService.add;
            
            action(payload, $scope.plugin.propertiesFile, $scope.plugin.mainJarFile, $scope.plugin.thirdPartyJarFiles, $scope.plugin.otherFiles).then(function(response) {
                frm.$setPristine();
                $scope.plugin.id = response.data;
                $scope.filesToRemove = [];
                $state.go('PolicyStudio.modifyPDPPlugin', {id:$scope.plugin.id});

                dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')($scope.isEditMode ? 'pdpPlugin.message.modified' : 'pdpPlugin.message.added'),
                    backLink: 'PolicyStudio.PDPPlugin',
                    backLabel: $filter('translate')('BACK TO PDP PLUGIN LIST')
                });
            });
        };

        var validatePluginFiles = function() {
            let success = true;
            $scope.propertiesFileRequired = false;
            $scope.mainJarFileRequired = false;

            if(!$scope.isEditMode && $scope.plugin.propertiesFile == null) {
                success = false;
                $scope.propertiesFileRequired = true;
            }

            if(!$scope.isEditMode && $scope.plugin.mainJarFile == null) {
                success = false;
                $scope.mainJarFileRequired = true;
            }

            return success;
        };

        if($scope.isEditMode) {
            pdpPluginService.get($stateParams.id, function(response) {
                if(!response.data) {
                    dialogService.notify({
                        msg: $filter('translate')('pdpPlugin.message.unavailable'),
                        ok: function() {
                            $window.history.back();
                            return;
                        }
                    });
    
                    return;
                }
                
                $scope.plugin.id = response.data.id;
                $scope.plugin.name = response.data.name;
                $scope.plugin.description = response.data.description;
                $scope.plugin.activeFrom = response.data.activeFrom;
                $scope.plugin.activeTo = response.data.activeTo;
                $scope.disablePolicyName = true;
                angular.forEach(response.data.pdpPluginFileDTOs, function(pluginFile) {
                    if(pluginFile.type == 'PROPERTIES') {
                        $scope.plugin.propertiesFileObject.id = pluginFile.id;
                        $scope.plugin.propertiesFileObject.name = pluginFile.name;
                    } else if(pluginFile.type == 'PRIMARY_JAR') {
                        $scope.plugin.mainJarFileObject.id = pluginFile.id;
                        $scope.plugin.mainJarFileObject.name = pluginFile.name;
                    } else if(pluginFile.type == 'THIRD_PARTY_JAR') {
                        let thirdPartyJarFileObject = {
                            id: pluginFile.id,
                            name: pluginFile.name
                        };
                        $scope.plugin.thirdPartyJarFilesObject.push(thirdPartyJarFileObject);
                    } else if(pluginFile.type == 'OTHER') {
                          let otherFileObject = {
                              id: pluginFile.id,
                              name: pluginFile.name
                          };
                          $scope.plugin.otherFilesObject.push(otherFileObject);
                    }
                });
            });
        }

        $scope.downloadFileResource = function(plugin, file, mimeType) {
            pdpPluginService.getFileAsBlob(plugin.id, file.id, function (data) {
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(data, file.name);
                } else {
                    var blob = new Blob([data], {type: mimeType});
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href',window.URL.createObjectURL(blob));
                    downloadLink.attr('download', file.name);
                    downloadLink[0].click();
                }
            });
        };
    }
]);