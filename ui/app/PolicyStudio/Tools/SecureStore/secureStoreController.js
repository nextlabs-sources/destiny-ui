policyStudio.controller('secureStoreController', 
    ['$scope', '$state', '$rootScope', '$filter', '$stateParams', '$uibModal', 'userService', 'dialogService', 'secureStoreService',
    function($scope, $state, $rootScope, $filter, $stateParams, $uibModal, userService, dialogService, secureStoreService) {
        $state.current.pageTitle = $filter('translate')("secureStore.title");

        userService.goBackIfAccessDeniedToApp('PolicyStudio.SecureStore');
        
        $scope.storeType = $stateParams.storeType;
        $scope.show_search = false;

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

        $scope.listSecureStore = function(storeType) {
            $state.go('PolicyStudio.listSecureStore', {
                storeType: storeType
            });
        };

        $scope.exportAll = function(callback) {
            secureStoreService.exportAll(function (url) {
                if (navigator.msSaveBlob) {
                    secureStoreService.getFileAsBlob(url, function (data) {
                        navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
                    });
                } else {
                    $('#stores-export-download').remove();
                    $('<iframe/>', { src: url, id: 'stores-export-download' }).hide().appendTo('body');
                }
            });
        };

        $scope.openReplaceStoreFileModal = function(callback) {
			var modalScope;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/SecureStore/partials/replace-store-file-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
                    modalScope = $scope;
                    $scope.data = {
                        filesToReplace: []
                    };

                    $scope.fileChosen = function($event) {
                        angular.forEach($event.target.files, function(selectedFile) {
                            $scope.data.filesToReplace.push(selectedFile);
                        });
                        $scope.$digest();
                    };
                    
                    $scope.removeAttachment = function(index) {
                        $scope.data.filesToReplace.splice(index, 1);
                    };

                    $scope.ok = function() {
                        $uibModalInstance.dismiss('cancel');

                        var payload = {
                            storeFile: $scope.data.filesToReplace
                        };
						
						replaceStoreFile(payload);
                    };
                    
					$scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
			
            modal.result
                .then(function() {
                    callback && callback();
                }, function () {
                    callback && callback();
                });
            
            modal.rendered
                .then(function() {
                    var element = document.getElementById('replace-file');
                    element.addEventListener('change', modalScope.fileChosen);
                }, function () {
                    callback && callback();
                });
        };

        var replaceStoreFile = function(payload) {
			secureStoreService.replaceStoreFile(payload, function(response) {
				dialogService.notifyWithoutBlocking({
					msg: $filter('translate')('secureStore.storeFile.replaced.msg'),
					timeout:5000
				});
			});
        };
    }
]);