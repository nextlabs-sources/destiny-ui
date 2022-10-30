policyStudio.controller('keyStoreController', 
    ['$scope', '$state', '$rootScope', '$filter', '$stateParams', '$anchorScroll', '$timeout', 'userService', 'dialogService', 'userManualTranslateService', 'secureStoreService',
    function($scope, $state, $rootScope, $filter, $stateParams, $anchorScroll, $timeout, userService, dialogService, userManualTranslateService, secureStoreService) {
        $state.current.pageTitle = $filter('translate')("secureStore.title");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.SecureStore');
        
        $scope.storeType = 'keystore';
        $scope.storeEntry = {
            storeName: null,
            alias: null,
            issuer: null,
            keyAlgorithm: 'RSA',
            keySize: 1024,
            selfSign: true,
            signatureAlgorithm: null,
            validity: 60,
            validFrom: new Date(),
            nameFields: [],
            thumbprints: [],
            subjectDN: null,
            namedExtensions: []
        };
        $scope.isViewMode = false;
        $scope.storeNames = [];
        $scope.keyAlgorithms = [];
        $scope.signatureAlgorithms = [];
        $scope.keySizeMinimum = 512;
        $scope.keySizeMaximum = 16384;
        $scope.keySizeStep = 1;
        $scope.keySizeRegex = "";
        $scope.storeEntry.validFrom.setSeconds(0);
        $scope.currentDate = new Date();
        $scope.nameFields = ["Common Name (CN)",
                             "Organization Unit (OU)",
                             "Organization Name (O)",
                             "Locality Name (L)",
                             "State Name (ST)",
                             "Country (C)",
                             "Surname (SURNAME)",
                             "Domain Component (DC)",
                             "User ID (UID)"];
        $scope.namedExtensions = ["SubjectAlternativeName"];
        $scope.nameFieldTable = {
            dirty: false,
            success: true,
            error: false,
            notify: false,
            message: ''
        };
        $scope.namedExtensionTable = {
            dirty: false,
            success: true,
            error: false,
            notify: false,
            message: ''
        };

        $scope.keyPairForm = {
            val: null,
        };

        $rootScope.immediateStateChange = function() {
            return $scope.keyPairForm.val.$pristine;
        };

        $scope.userManualOption = {
            app: 'Secure Store',
            section: 'Key Store',
            page: 'Key Details',
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

        $scope.dnEditItem = {$$hashKey:0};
        $scope.extEditItem = {$$hashKey:0};
        var itemBeforeEdit = null;

        $stateParams.storeName && $stateParams.alias && ($scope.isViewMode = true);

        var currentTarget = 'storeName';
        $scope.scrollTo = function(target) {
            $anchorScroll(target);
            currentTarget = target;
        };

        $scope.isActive = function(newTarget) {
            return currentTarget == newTarget;
        };
        
        $scope.highlightGrammar = function(target) {
            currentTarget = target;
        };
  
        $scope.setDirty = function() {
            $scope.keyPairForm.val && $scope.keyPairForm.val.$setDirty();
        };

        $scope.reset = function() {
            if ($scope.keyPairForm.val.$pristine) {
                $state.reload();
            } else {
                dialogService.confirm({
                    msg: $filter('translate')('secureStore.reset.confirm'),
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
                            $scope.keyPairForm.val.$setPristine();
                            $state.reload();
                            callback && callback();
                        }
                    }]
                }).then({});
            }
        };

        secureStoreService.getStoreNames($scope.storeType).then(function(data) {
            angular.forEach(data, function(storeName) {
                $scope.storeNames.push(storeName);
            });

            if(!$scope.storeEntry.storeName && $scope.storeNames.length) {
                $scope.storeEntry.storeName = $scope.storeNames[0];
            }
        });

        secureStoreService.getKeyAlgorithms().then(function(data) {
            angular.forEach(data, function(algorithm) {
                $scope.keyAlgorithms.push(algorithm);
            });
        });

        $rootScope.stateChangeHook = function(state) {
            dialogService.confirm({
                msg: $filter('translate')('common.discard.confirm'),
                confirmLabel: $filter('translate')('Proceed'),
                cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
                ok: function() {
                    $scope.keyPairForm.val.$setPristine();
                    $state.go(state.name, state.params)
                },
                cancel: function() {
                }
            });
        };

        $scope.getSignatureAlgorithms = function(keyAlgorithm) {
            $scope.signatureAlgorithms = [];
            secureStoreService.getSignatureAlgorithms(keyAlgorithm).then(function(data) {
                angular.forEach(data, function(algorithm) {
                    $scope.signatureAlgorithms.push(algorithm);
                });

                if($scope.storeEntry.signatureAlgorithm == null && data.length > 0) {
                    $scope.storeEntry.signatureAlgorithm = data[0];
                }

                $scope.setMaximumKeySize($scope.storeEntry.keyAlgorithm);
            });
        };

        $scope.changeStoreName = function(storeName) {
            $scope.storeEntry.storeName = storeName;
        };

        $scope.changeKeyAlgorithm = function(keyAlgorithm) {
            $scope.storeEntry.signatureAlgorithm = null;
            $scope.storeEntry.keyAlgorithm = keyAlgorithm;
            $scope.getSignatureAlgorithms(keyAlgorithm);

            if(keyAlgorithm == 'DSA') {
                $scope.keySizeStep = 64;
            } else {
                $scope.keySizeStep = 1;
            }

            $scope.setMaximumKeySize($scope.storeEntry.keyAlgorithm);
        };

        $scope.changeSignatureAlgorithm = function(signatureAlgorithm) {
            $scope.storeEntry.signatureAlgorithm = signatureAlgorithm;
            $scope.setMaximumKeySize($scope.storeEntry.keyAlgorithm);
        };
        
        if(!$scope.isViewMode && $scope.storeEntry.keyAlgorithm != null) {
            $scope.getSignatureAlgorithms($scope.storeEntry.keyAlgorithm);
        };

        $scope.addNameField = function() {
            var nameField = {field: "", value: ""};
            if(!nameField.$$hashKey) 
                nameField.$$hashKey = 100 + $scope.storeEntry.nameFields.length;

            $scope.storeEntry.nameFields.push(nameField);
            $scope.dnEditItem = nameField;
            $scope.dnEditItem.isEdit = false;
        };

        $scope.addNamedExtension = function() {
            var namedExtension = {field: "", value: ""};
            if(!namedExtension.$$hashKey) 
                namedExtension.$$hashKey = 100 + $scope.storeEntry.namedExtensions.length;

            $scope.storeEntry.namedExtensions.push(namedExtension);
            $scope.extEditItem = namedExtension;
            $scope.extEditItem.isEdit = false;
        };

        $scope.saveNameField = function(nameField) {
            $scope.nameFieldTable.error = false;
            $scope.nameFieldTable.notify = false;
      
            var nameFieldErrMsg = validateNameField(nameField);

            if(nameFieldErrMsg){
                $scope.nameFieldTable.error = true;
                $scope.nameFieldTable.success = false;
                setNotification($scope.nameFieldTable);
                $scope.nameFieldTable.message = nameFieldErrMsg;
            } else {
                if(!$scope.nameFieldTable.error) {
                    $scope.dnEditItem = {$$hashKey:0};
                    $scope.nameFieldTable.success = true;
                    $scope.nameFieldTable.error = false;
                    $scope.nameFieldTable.message = 'Name field added to the table successfully';
                    setNotification($scope.nameFieldTable); 
                    setSubjectDN();
                }
            }
        };

        $scope.saveNamedExtension = function(namedExtension) {
            $scope.namedExtensionTable.error = false;
            $scope.namedExtensionTable.notify = false;
      
            var namedExtensionErrMsg = validateNamedExtension(namedExtension);

            if(namedExtensionErrMsg){
                $scope.namedExtensionTable.error = true;
                $scope.namedExtensionTable.success = false;
                setNotification($scope.namedExtensionTable);
                $scope.namedExtensionTable.message = namedExtensionErrMsg;
            } else {
                if(!$scope.namedExtensionTable.error) {
                    $scope.extEditItem = {$$hashKey:0};
                    $scope.namedExtensionTable.success = true;
                    $scope.namedExtensionTable.error = false;
                    $scope.namedExtensionTable.message = 'Named extension added to the table successfully';
                    setNotification($scope.namedExtensionTable); 
                    setSubjectDN();
                }
            }
        };

        $scope.setMaximumKeySize = function(keyAlgorithm) {
            if(keyAlgorithm == 'DSA') {
                $scope.keySizeMaximum = 2048;
                $scope.keySizeRegex = "(51[2-9]|5[2-9][0-9]|[6-9][0-9]{2}|10[01][0-9]|102[0-4]|2048)";
            } else if(keyAlgorithm == 'RSA') {
                $scope.keySizeMaximum = 4096;
                $scope.keySizeRegex = "(51[2-9]|5[2-9][0-9]|[6-9][0-9]{2}|[1-3][0-9]{3}|40[0-8][0-9]|409[0-6])";
            }
        };

        var validateNameField = function(nameField) {
            if (!nameField.field) {
                return $filter('translate')('secureStore.keystore.validation.requireField');
            }

            if (!nameField.value) {
                return $filter('translate')('secureStore.keystore.validation.requireValue');
            }
        };

        var validateNamedExtension = function(namedExtension) {
            if (!namedExtension.field) {
                return $filter('translate')('secureStore.keystore.validation.requireField');
            }

            if (!namedExtension.value) {
                return $filter('translate')('secureStore.keystore.validation.requireValue');
            }
        };

        var notificationTimer = null;
        var setNotification = function(table) {
            table.notify = true;
            notificationTimer && $timeout.cancel(notificationTimer);
            notificationTimer = $timeout(function(){
                table.notify = false;
            }, 3000);
        };
      
        $scope.editNameField = function(nameField) {
            if($scope.dnEditItem.$$hashKey){
                $scope.abortEditNameField();
                if($scope.nameFieldTable.error)
                    return;
             }

             itemBeforeEdit = angular.copy(nameField);
             $scope.dnEditItem = nameField;
             $scope.dnEditItem.$$hashKey = nameField.$$hashKey;
             $scope.dnEditItem.isEdit = true;
             $scope.nameFieldTable.dirty = true;
        };

        $scope.editNamedExtension = function(namedExtension) {
            if($scope.extEditItem.$$hashKey){
                $scope.abortEditNamedExtension();
                if($scope.namedExtensionTable.error)
                    return;
             }

             itemBeforeEdit = angular.copy(namedExtension);
             $scope.extEditItem = namedExtension;
             $scope.extEditItem.$$hashKey = namedExtension.$$hashKey;
             $scope.extEditItem.isEdit = true;
             $scope.namedExtensionTable.dirty = true;
        };

        $scope.abortEditNameField = function() {
            if($scope.dnEditItem.isEdit) {
                angular.copy(itemBeforeEdit, $scope.dnEditItem);
            } else {
                $scope.storeEntry.nameFields.splice($scope.storeEntry.nameFields.length - 1, 1);
            }

            $scope.dnEditItem = {$$hashKey:0};
        };

        $scope.abortEditNamedExtension = function() {
            if($scope.extEditItem.isEdit) {
                angular.copy(itemBeforeEdit, $scope.extEditItem);
            } else {
                $scope.storeEntry.namedExtensions.splice($scope.storeEntry.namedExtensions.length - 1, 1);
            }

            $scope.extEditItem = {$$hashKey:0};
        };

        $scope.removeNameField = function(index) {
            $scope.storeEntry.nameFields.splice(index, 1);
            $scope.nameFieldTable.notify = false;

            angular.forEach($scope.storeEntry.nameFields, function(nameField, index) {
                nameField.$$hashKey = 100 + index;
            });

            setSubjectDN();
        };

        $scope.removeNamedExtension = function(index) {
            $scope.storeEntry.namedExtensions.splice(index, 1);
            $scope.namedExtensionTable.notify = false;

            angular.forEach($scope.storeEntry.namedExtensions, function(namedExtension, index) {
                namedExtension.$$hashKey = 100 + index;
            });
        };

        var setSubjectDN = function() {
            var distinguishedName = '';

            angular.forEach($scope.storeEntry.nameFields, function(nameField) {
                if(distinguishedName.length)
                    distinguishedName += ',';

                if(nameField.field == 'Common Name (CN)') {
                    distinguishedName += 'CN=' + nameField.value.trim();
                } else if(nameField.field == 'Organization Unit (OU)') {
                    distinguishedName += 'OU=' + nameField.value.trim();
                } else if(nameField.field == 'Organization Name (O)') {
                    distinguishedName += 'O=' + nameField.value.trim();
                } else if(nameField.field == 'Locality Name (L)') {
                    distinguishedName += 'L=' + nameField.value.trim();
                } else if(nameField.field == 'State Name (ST)') {
                    distinguishedName += 'ST=' + nameField.value.trim();
                } else if(nameField.field == 'Country (C)') {
                    distinguishedName += 'C=' + nameField.value.trim();
                } else if(nameField.field == 'Surname (SURNAME)') {
                    distinguishedName += 'SURNAME=' + nameField.value.trim();
                } else if(nameField.field == 'Domain Component (DC)') {
                    distinguishedName += 'DC=' + nameField.value.trim();
                } else if(nameField.field == 'User ID (UID)') {
                    distinguishedName += 'UID=' + nameField.value.trim();
                }
            });

            $scope.storeEntry.subjectDN = distinguishedName;
        };

        var dissectDistinguishName = function() {
            if($scope.storeEntry.subjectDN.length) {
                var nameFields = [];
                angular.forEach($scope.storeEntry.subjectDN.split(","), function(item){
                    var content = item.split("=");
                    var nameField = {$$hashKey: 100 + nameFields.length, field: '', value: content[1]};

                    content[0] = content[0].trim();
                    if(content[0].trim() == 'CN') {
                        nameField.field = 'Common Name (CN)';
                    } else if(content[0] == 'OU') {
                        nameField.field = 'Organization Unit (OU)';
                    } else if(content[0] == 'O') {
                        nameField.field = 'Organization Name (O)';
                    } else if(content[0] == 'L') {
                        nameField.field = 'Locality Name (L)';
                    } else if(content[0] == 'ST') {
                        nameField.field = 'State Name (ST)';
                    } else if(content[0] == 'C') {
                        nameField.field = 'Country (C)';
                    } else if(content[0] == 'SURNAME') {
                        nameField.field = 'Surname (SURNAME)';
                    } else if(content[0] == 'DC') {
                        nameField.field = 'Domain Component (DC)';
                    } else if(content[0] == 'UID') {
                        nameField.field = 'User ID (UID)';
                    }

                    nameFields.push(nameField);
                });

                $scope.storeEntry.nameFields = nameFields;
            }
        };

        $scope.createKeyPair = function(frm) {
            if (frm.$invalid) {
                frm.$setDirty();
                for (var field in frm) {
                    if (field[0] == '$')
                        continue;
                    frm[field].$touched = true;
                }

                $scope.$broadcast('scrollto');
                return;
            }

            if(!validateStoreEntry()) {
                return;
            }
            
            secureStoreService.generateKey(createPayload(), function(response){
                frm.$setPristine();

                dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')('secureStore.keystore.notification.keyAdded'),
                    backLink: "PolicyStudio.listSecureStore({storeType:'keystore'})",
                    backLabel: $filter('translate')('BACK TO KEY LIST')
                });
                
                $scope.dnEditItem = {$$hashKey:0};
                $scope.extEditItem = {$$hashKey:0};
                populateEntryDetails($scope.storeEntry.storeName, $scope.storeEntry.alias);
            });
        };

        var validateStoreEntry = function() {
            if($scope.storeEntry.nameFields.length == 0) {
                $scope.nameFieldTable.error = true;
                $scope.nameFieldTable.success = false;
                setNotification($scope.nameFieldTable);
                $scope.nameFieldTable.message = $filter('translate')('secureStore.keystore.validation.requireDN');
                $scope.$broadcast('scrollto');
                return false;
            }

            for(var i=0; i < $scope.storeEntry.nameFields.length; i++) {
                var nameFieldEntry = $scope.storeEntry.nameFields[i];

                if(!nameFieldEntry.field) {
                    $scope.nameFieldTable.error = true;
                    $scope.nameFieldTable.success = false;
                    setNotification($scope.nameFieldTable);
                    $scope.nameFieldTable.message = $filter('translate')('secureStore.keystore.validation.requireField');
                    $scope.$broadcast('scrollto');
    
                    return false;
                }

                if(!nameFieldEntry.value) {
                    $scope.nameFieldTable.error = true;
                    $scope.nameFieldTable.success = false;
                    setNotification($scope.nameFieldTable);
                    $scope.nameFieldTable.message = $filter('translate')('secureStore.keystore.validation.requireValue');
                    $scope.$broadcast('scrollto');
    
                    return false;
                }
            }

            return true;
        };

        var createPayload = function() {
            var payload = {};
            setSubjectDN();

            payload.storeName = $scope.storeEntry.storeName;
            payload.type = "KEY_PAIR";
            payload.alias = $scope.storeEntry.alias;
            payload.keyAlgorithmName = $scope.storeEntry.keyAlgorithm;
            payload.keySize = $scope.storeEntry.keySize;
            $scope.storeEntry.selfSign ? payload.signatureAlgorithmName = $scope.storeEntry.signatureAlgorithm.name : null;
            payload.validity = $scope.storeEntry.validity;
            payload.validFrom = $scope.storeEntry.validFrom.getTime();
            payload.subjectDN = $scope.storeEntry.subjectDN;
            payload.namedExtensions = {};
            angular.forEach($scope.storeEntry.namedExtensions, function(extension) {
                payload.namedExtensions[extension.field] = extension.value;
            });

            return payload;
        };

        var populateEntryDetails = function(storeName, alias) {
            secureStoreService.getEntryDetails(storeName, alias, function(response) {
                if(response.data) {
                    var details = response.data;

                    $scope.storeEntry.storeName = details.storeName;
                    $scope.storeEntry.alias = details.alias;
                    $scope.storeEntry.issuer = details.issuer;
                    $scope.storeEntry.version = details.version;
                    $scope.storeEntry.subjectDN = details.subjectDN;
                    $scope.storeEntry.serialNumber = details.serialNumber;
                    $scope.storeEntry.keyAlgorithm = details.keyAlgorithmName;
                    $scope.storeEntry.keySize = details.keySize;
                    if($scope.storeEntry.keyAlgorithm != null) {
                        $scope.signatureAlgorithms = [];
                        secureStoreService.getSignatureAlgorithms($scope.storeEntry.keyAlgorithm).then(function(data) {
                            angular.forEach(data, function(algorithm) {
                                $scope.signatureAlgorithms.push(algorithm);

                                if(algorithm.name == details.signatureAlgorithmName) {
                                    $scope.storeEntry.signatureAlgorithm = algorithm;
                                }
                            });
                        });
                    };
                    $scope.storeEntry.validity = details.validity;
                    $scope.storeEntry.validFrom = new Date(details.validFrom);
                    $scope.storeEntry.validUntil = new Date(details.validUntil);
                    
                    $scope.storeEntry.namedExtensions = [];
                    angular.forEach(details.namedExtensions, function(val, fld) {
                        $scope.storeEntry.namedExtensions.push({field: fld, value: val});
                    });

                    $scope.storeEntry.thumbprints = [];
                    angular.forEach(details.thumbprints, function(algo, val) {
                        $scope.storeEntry.thumbprints.push({algorithm: val, value: algo});    
                    });
                    
                    dissectDistinguishName();
                    $scope.isViewMode = true;
                }
            });
        };

        if($scope.isViewMode) {
            populateEntryDetails($stateParams.storeName, $stateParams.alias);
        }
    }
]);