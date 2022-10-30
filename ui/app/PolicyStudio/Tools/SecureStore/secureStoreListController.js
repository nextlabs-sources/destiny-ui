policyStudio.controller('secureStoreListController', 
    ['$scope', '$state', '$rootScope', '$filter', '$stateParams', '$uibModal', 'userService', 'dialogService', 'secureStoreService',
    function($scope, $state, $rootScope, $filter, $stateParams, $uibModal, userService, dialogService, secureStoreService) {
        $state.current.pageTitle = $filter('translate')("secureStore.title");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.SecureStore');
        
        $scope.storeType = $stateParams.storeType;
        $scope.storeEntries = [];
        $scope.csrHovering = 'disabled';
        $scope.importHovering = 'disabled';
        $scope.exportHovering = 'disabled';
        $scope.checkStatus = {
            allEntriesChecked: false, 
            hasEntryChecked: false
        }
      
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

        $scope.refreshEntries = function() {
            $scope.checkStatus.allEntriesChecked = false;
            $scope.checkStatus.hasEntryChecked = false;
            secureStoreService.getEntries($scope.storeType.toUpperCase(), function(data) {
                $scope.storeEntries = data;
            });
        };

		$scope.changePassword = function(newPassword) {
            var payload = {};
            payload.storeType = $scope.storeType;
            payload.newPassword = newPassword;

            secureStoreService.changePassword(payload, function(response) {
                dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')('secureStore.' + $scope.storeType + '.notification.changePasswordSuccess'),
                    backLink: 'PolicyStudio.SecureStore',
                    backLabel: $filter('translate')('BACK TO MANAGER LIST')
                });

                dialogService.notifyWithoutBlocking({
                    type: 'info',
                    msg: $filter('translate')('editsysconfig.restart.notify')
                });
            });
		}

        $scope.openChangePasswordModal = function(callback) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/change-password-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
                    $scope.data = {
                        newPassword: '',
                        confirmNewPassword: ''
                    }

                    $scope.ok = function() {
                        $uibModalInstance.close($scope.data);
                    };
                    
					$scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            }).result
              .then(function(data) {
                    $scope.changePassword(data.newPassword);
                    callback && callback();
              }, function () {
                    callback && callback();
                });
        };

        $scope.openImportKeyPairModal = function(callback) {
            var modalScope;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/import-key-pair-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
					modalScope = $scope;
                    $scope.data = {
                        allChecked: false,
                        hasChecked: false,
                        storeNames: [],
                        storeName: '',
                        format: 'PEM',
                        aliases: [],
                        overwriteEntry: true,
                        certificateFileName: '',
                        privateKeyFileName: '',
                        pkcs12FileName: '',
                        pkcs12FilePassword: '',
                        errorMessage: null,
                        formValidated: false
                    };
                    
                    secureStoreService.getStoreNames("keystore").then(function(data) {
                        angular.forEach(data, function(storeName) {
                            $scope.data.storeNames.push(storeName);
                        });
                        
                        $scope.data.storeName = $scope.data.storeNames[0];
                    });

                    $scope.setFormat = function(format) {
                        $scope.data.formValidated = false;
                        if(format == 'PEM') {
                            $scope.data.pkcs12File = null;
                            $scope.data.pkcs12FileName = '';
                            $scope.data.pkcs12FilePassword = '';
                            $scope.data.aliases = [];
                        } else {
                            $scope.data.certificateFile = null;
                            $scope.data.certificateFileName = '';
                            $scope.data.privateKeyFile = null;
                            $scope.data.privateKeyFileName = '';
                            $scope.data.alias = '';
                        }
                    }

                    $scope.certificateFileChosen = function($event) {
                        $scope.data.certificateFile = $event.target.files[0];
                        $scope.data.certificateFileName = $scope.data.certificateFile.name;
                        $scope.$digest();
                        $scope.validateForm();
                        $scope.$apply();
                    };

                    $scope.privateKeyFileChosen = function($event) {
                        $scope.data.privateKeyFile = $event.target.files[0];
                        $scope.data.privateKeyFileName = $scope.data.privateKeyFile.name;
                        $scope.$digest();
                        $scope.validateForm();
                        $scope.$apply();
                    };

                    $scope.pkcs12FileChosen = function($event) {
                        $scope.data.pkcs12File = $event.target.files[0];
                        $scope.data.pkcs12FileName = $scope.data.pkcs12File.name;
                        $scope.$digest();
                        $scope.data.aliases = [];
                        $scope.validateForm();
                        $scope.$apply();
                    };
                    
                    $scope.validateForm = function() {
                        if($scope.data.format == 'PEM') {
                            $scope.data.formValidated = $scope.data.certificateFile && $scope.data.privateKeyFile && $scope.data.alias;
                        } else {
                            var missingAlias = false;

                            angular.forEach($scope.data.aliases, function(item) {
                                if(item.checked) {
                                    if(item.destinationAlias == '') {
                                        missingAlias = true;
                                    }
                                }
                            });

                            $scope.data.formValidated = $scope.data.hasChecked && !missingAlias;
                        }
                    };

                    $scope.listAllKeys = function() {
                        if(!($scope.data.pkcs12FilePassword && $scope.data.pkcs12File)) {
                            return;
                        }

                        $scope.data.aliases = [];
                        var payload = {
                            pkcs12FilePassword: $scope.data.pkcs12FilePassword,
                            pkcs12File: $scope.data.pkcs12File
                        };

                        secureStoreService.listKeyPair(payload, function(response) {
                            angular.forEach(response.data, function(keyPair){
                                var entry = {
                                    checked: false,
                                    sourceAlias: keyPair.alias,
                                    destinationAlias: keyPair.alias
                                };

                                $scope.data.aliases.push(entry);
                                $scope.data.hasChecked = false;
                            });
                        });
                    };

                    $scope.allEntriesStatusChanged = function(checked) {
                        $scope.data.hasChecked = checked;

                        angular.forEach($scope.data.aliases, function(item) {
                            item.checked = checked;
                        });

                        $scope.entryStatusChanged();
                    };

                    $scope.entryStatusChanged = function() {
                        var allChecked = true;
                        var hasChecked = false;

                        angular.forEach($scope.data.aliases, function(item) {
                            allChecked = allChecked && item.checked;
                            hasChecked = hasChecked || item.checked;
                        });

                        $scope.data.hasChecked = hasChecked;
                        $scope.data.allChecked = allChecked;
                        $scope.validateForm();
                    };

                    $scope.import = function() {
                        $uibModalInstance.dismiss('cancel');

                        var payload = {
                            targetStore: $scope.data.storeName,
                            overwrite: $scope.data.overwriteEntry ? 'true' : 'false'
                        };

                        if($scope.data.format == 'PEM') {
                            payload.alias = $scope.data.alias;
                            payload.certificateFile = $scope.data.certificateFile;
                            payload.privateKeyFile = $scope.data.privateKeyFile;
                        } else {
                            payload.pkcs12FilePassword = $scope.data.pkcs12FilePassword;
                            payload.aliasEntries = '';
                            payload.pkcs12File = $scope.data.pkcs12File;
                            
                            angular.forEach($scope.data.aliases, function(item) {
                                if(item.checked) {
                                    if(payload.aliasEntries.length == 0) {
                                        payload.aliasEntries = item.sourceAlias + '::' + item.destinationAlias;
                                    } else {
                                        payload.aliasEntries += ';' + item.sourceAlias + '::' + item.destinationAlias;
                                    }
                                }
                            });
                        }

                        importKeyPair($scope.data.format, payload);
                    };
                    
					$scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });

            modal.result
                .then(function(data) {
                    callback && callback();
                }, function () {
                    callback && callback();
                });
            
            modal.rendered
                .then(function() {
                    var certificateFile = document.getElementById('certificate-file');
                    certificateFile.addEventListener('change', modalScope.certificateFileChosen);

                    var privateKeyFile = document.getElementById('private-key-file');
                    privateKeyFile.addEventListener('change', modalScope.privateKeyFileChosen);

                    var pkcs12File = document.getElementById('pkcs12-file');
                    pkcs12File.addEventListener('change', modalScope.pkcs12FileChosen);

                    var passwordField = document.getElementById('pkcs12FilePassword');
                    passwordField.addEventListener('keyup', function(event) {
                        if(event.keyCode === 13) {
                            modalScope.listAllKeys();
                        }
                    });
                }, function () {
                    callback && callback();
                });
        };

        $scope.openImportCertificateReplyModal = function(storeEntry, callback) {
			var modalScope;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/import-reply-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
					modalScope = $scope;
                    $scope.data = {
                        storeName: storeEntry.storeName,
                        alias: storeEntry.alias,
                        verifyTrustChain: true,
                        fileToImportName: ''
                    };
                    
                    $scope.fileChosen = function($event) {
                        $scope.data.fileToImport = $event.target.files[0];
                        $scope.data.fileToImportName = $scope.data.fileToImport.name;
                        $scope.$digest();
                    };
            
                    $scope.ok = function() {
                        $uibModalInstance.dismiss('cancel');

                        var payload = {
                            storeName: $scope.data.storeName,
                            alias: $scope.data.alias,
                            verifyTrustChain: $scope.data.verifyTrustChain ? 'true' : 'false',
                            aliasShouldExist: 'true',
                            replaceIfAliasExist: 'false',
                            file: $scope.data.fileToImport
                        };
						
						importCertificate(payload);
                    };
                    
					$scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
			
            modal.result
                .then(function(data) {
                    callback && callback();
                }, function () {
                    callback && callback();
                });
            
            modal.rendered
                .then(function() {
                    var element = document.getElementById('import-file');
                    element.addEventListener('change', modalScope.fileChosen);
                }, function () {
                    callback && callback();
                });
        };

        $scope.openImportCertificateModal = function(callback) {
			var modalScope;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/import-certificate-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
					modalScope = $scope;
                    $scope.data = {
                        storeNames: [],
                        storeName: '',
                        alias: '',
                        verifyTrustChain: true,
                        fileToImportName: ''
                    };
                    
                    secureStoreService.getStoreNames("truststore").then(function(data) {
                        angular.forEach(data, function(storeName) {
                            $scope.data.storeNames.push(storeName);
                        });
                        
                        $scope.data.storeName = $scope.data.storeNames[0];
                    });

                    $scope.fileChosen = function($event) {
                        $scope.data.fileToImport = $event.target.files[0];
                        $scope.data.fileToImportName = $scope.data.fileToImport.name;
                        $scope.$digest();
                    };
                    
                    $scope.ok = function() {
                        $uibModalInstance.dismiss('cancel');

                        var payload = {
                            storeName: $scope.data.storeName,
                            alias: $scope.data.alias,
                            verifyTrustChain: $scope.data.verifyTrustChain ? 'true' : 'false',
                            aliasShouldExist: 'false',
                            replaceIfAliasExist: 'false',
                            file: $scope.data.fileToImport
                        };
						
						importCertificate(payload);
                    };
                    
					$scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
			
            modal.result
                .then(function(data) {
                    callback && callback();
                }, function () {
                    callback && callback();
                });
            
            modal.rendered
                .then(function() {
                    var element = document.getElementById('import-file');
                    element.addEventListener('change', modalScope.fileChosen);
                }, function () {
                    callback && callback();
                });
        };

        $scope.viewEntry = function(storeEntry) {
            if($scope.storeType == 'keystore') {
                $state.go('PolicyStudio.viewKey', {
                    storeName: storeEntry.storeName,
                    alias: storeEntry.alias
                });
            } else {
                $state.go('PolicyStudio.viewCertificate', {
                    storeName: storeEntry.storeName,
                    alias: storeEntry.alias
                });
            }
        };

        $scope.removeEntry = function(storeEntry) {
            dialogService.confirm({
                msg: $filter('translate')('secureStore.delete.confirm'),
                confirmLabel: $filter('translate')('DELETE'),
                ok: function() {
                    secureStoreService.removeEntry(storeEntry.storeName, storeEntry.alias, function() {
                        dialogService.notifyWithoutBlocking({
                            msg: $filter('translate')('secureStore.delete.notify', {length : 1}),
                            timeout:5000
                        });

                        $scope.refreshEntries();
                    });
                }
            });
        };

        $scope.bulkDelete = function($event) {
            dialogService.confirm({
                msg: $filter('translate')('secureStore.delete.confirm'),
                confirmLabel: $filter('translate')('DELETE'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    let secureEntryList = {};
                    let containsItem = false;
                    angular.forEach($scope.storeEntries, function (item) {
                        if(item.checked) {
							secureEntryList[item.storeName] = secureEntryList[item.storeName] || [];
                            secureEntryList[item.storeName].push(item.alias);
                            containsItem = true;
                        }
                    });
                    
                    if (containsItem) {
                        secureStoreService.bulkDelete(secureEntryList, function () {
                            $scope.refreshEntries();
                            dialogService.notifyWithoutBlocking({
                                msg: $filter('translate')('secureStore.delete.notify', { length: secureEntryList.length }),
                                timeout: 5000
                            });
                        });
                    }
                }
            });

            $event.stopPropagation();
        };

        $scope.generateCsr = function(storeEntry) {
            var payload = {storeName: storeEntry.storeName, alias: storeEntry.alias};

            secureStoreService.generateCsr(payload, function (url) {
                if (navigator.msSaveBlob) {
                    secureStoreService.getFileAsBlob(url, function (data) {
                        navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
                    });
                } else {
                    $('#csr-download').remove();
                    $('<iframe/>', { src: url, id: 'csr-download' }).hide().appendTo('body');
                }
            });
        };

        $scope.exportCertificate = function(storeEntry) {
            secureStoreService.exportCertificate(storeEntry.storeName, storeEntry.alias, function (url) {
                if (navigator.msSaveBlob) {
                    secureStoreService.getFileAsBlob(url, function (data) {
                        navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
                    });
                } else {
                    $('#certificate-export-download').remove();
                    $('<iframe/>', { src: url, id: 'certificate-export-download' }).hide().appendTo('body');
                }
            });
        };

        $scope.checkAllEntries = function(checked) {
            $scope.checkStatus.hasEntryChecked = checked;

            angular.forEach($scope.storeEntries, function(item) {
                item.checked = checked;
            });

            $scope.storeEntryCheckStatusChanged();
        };

        $scope.storeEntryCheckStatusChanged = function() {
            var allEntriesChecked = true;
            var hasEntryChecked = false;

            angular.forEach($scope.storeEntries, function(item) {
                allEntriesChecked = allEntriesChecked && item.checked;
                hasEntryChecked = hasEntryChecked || item.checked;
            });
            
            $scope.checkStatus.allEntriesChecked = allEntriesChecked;
            $scope.checkStatus.hasEntryChecked = hasEntryChecked;
        };

        $scope.refreshEntries();
		
		var importCertificate = function(payload) {
			secureStoreService.importCertificate(payload, function(response) {
				dialogService.notifyWithoutBlocking({
					msg: $filter('translate')('secureStore.truststore.notification.certificateImported', {length : 1}),
					timeout:5000
				});

				$scope.refreshEntries();
			});
        };
        
        var importKeyPair = function(format, payload) {
            if(format == "PEM") {
                secureStoreService.importPemKeyPair(payload, function(response) {
                    dialogService.notifyWithoutBlocking({
                        msg: $filter('translate')('secureStore.truststore.notification.keyPairImported', {length : 1}),
                        timeout:5000
                    });
    
                    $scope.refreshEntries();
                });
            } else {
                secureStoreService.importPkcs12KeyPair(payload, function(response) {
                    dialogService.notifyWithoutBlocking({
                        msg: $filter('translate')('secureStore.truststore.notification.keyPairImported', {length : 1}),
                        timeout:5000
                    });
    
                    $scope.refreshEntries();
                });
            }
		};
    }
]);