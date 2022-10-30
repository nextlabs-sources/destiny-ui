policyStudio.controller('xacmlPolicyListController', ['$scope', '$http', 'xacmlPolicyService', 'policyService', 'dialogService', '$filter',
    '$uibModal', 'loggerService', 'autoCloseOptionService', 'configService',
    function($scope, $http, xacmlPolicyService, policyService, dialogService, $filter, $uibModal, loggerService, autoCloseOptionService,
             configService) {
        'use strict';

        let logger = loggerService.getLogger();

        $scope.$on('$viewContentLoaded', function(){
            $scope.refreshPolicyList();
        });

        $scope.refreshPolicyList = function() {
            $scope.xacmlPoliciesList = [];
            $scope.checkStatus.allPolicyChecked = false;
            $scope.checkStatus.hasPolicyChecked = false;
            xacmlPolicyService.getXacmlPolicies(function (response) {
                $scope.xacmlPoliciesList = response.data;
            });
        };

        var saveXacmlPolicy = function (xacmlFile) {
            xacmlPolicyService.saveXacmlPolicy(xacmlFile,
                function (response) {
                    var msg = response.message;
                    // $scope.refreshLocationList(0);
                    if (response.statusCode == '1000') { //Success
                        dialogService.notifyWithoutBlocking({
                            msg: msg,
                            html: true,
                            timeout: 5000
                        });
                        $scope.refreshPolicyList();
                    } else {
                        dialogService.notify({
                            msg: msg,
                            html: true,
                            timeout: 5000
                        });
                    }
                });
        };

        $scope.openImportModal = function() {
            var modalScope;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'ui/app/PolicyStudio/Tools/XacmlPolicy/partials/xacmlpolicyimport-modal.html',
                controller: ['$uibModalInstance', '$scope', function($uibModalInstance, $scope) {
                    modalScope = $scope;
                    $scope.fileChosen = function($event) {
                        $scope.fileToImport = $event.target.files[0];
                        $scope.fileToImportName = $scope.fileToImport.name;
                        $scope.$digest();
                    };
                    $scope.import = function() {
                        $uibModalInstance.dismiss('cancel');
                        saveXacmlPolicy($scope.fileToImport);
                    };
                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
            modal.rendered.then(function() {
                var element = document.getElementById('import-file');
                logger.log(element);
                element.addEventListener('change', modalScope.fileChosen);
            });
        };


        var taskWithOpenOption = [];
        $scope.closeAllOpenOption = function() {
            if (taskWithOpenOption.length > 0) {
                angular.forEach(taskWithOpenOption, function(xacmlPolicy) {
                    logger.log(xacmlPolicy)
                    if (xacmlPolicy.optionOpen) {
                        xacmlPolicy.optionOpen = false;
                    }
                });
                taskWithOpenOption = [];
            }
        };
        $scope.openOption = function(xacmlPolicy, open) {
            if (angular.isDefined(open)) {
                xacmlPolicy.optionOpen = open;
                if (open) {
                    $scope.closeAllOpenOption();
                    autoCloseOptionService.close();
                    autoCloseOptionService.registerOpen($scope, $scope.closeAllOpenOption);
                    taskWithOpenOption.push(xacmlPolicy);
                } else {
                    taskWithOpenOption = [];
                }
            } else {
                return angular.isDefined(xacmlPolicy.optionOpen) ? xacmlPolicy.optionOpen : false;
            }
        };

        $scope.checkStatus = {
            allPolicyChecked: false,
            hasPolicyChecked: false,
        };
        $scope.checkAllPolicy = function(checked) {
            $scope.checkStatus.hasPolicyChecked = checked;
            angular.forEach($scope.xacmlPoliciesList, function(xacmlPolicy) {
                xacmlPolicy.checked = checked;
            });
            $scope.policyCheckStatusChange();
        };
        $scope.policyCheckStatusChange = function() {
            var allPolicyChecked = true;
            var hasPolicyChecked = false;
            angular.forEach($scope.xacmlPoliciesList, function(item) {
                allPolicyChecked = allPolicyChecked && item.checked;
                hasPolicyChecked = hasPolicyChecked || item.checked;
            });
            $scope.checkStatus.allPolicyChecked = allPolicyChecked;
            $scope.checkStatus.hasPolicyChecked = hasPolicyChecked;
        };

        $scope.bulkDelete = function ($event, xacmlPolicy) {
            dialogService.confirm({
                msg: $filter('translate')('xacmlPolicyList.del.confirm'),
                confirmLabel: $filter('translate')('DELETE'),
                cancelLabel: $filter('translate')('CANCEL'),
                ok: function () {
                    let policyIdList = [];
                    if (xacmlPolicy){
                        policyIdList.push(xacmlPolicy.id);
                    } else {
                        angular.forEach($scope.xacmlPoliciesList, function (item) {
                            item.checked && policyIdList.push(item.id);
                        });
                    }
                    if (policyIdList.length > 0) {
                        xacmlPolicyService.bulkDelPolicy(policyIdList, function () {
                            $scope.refreshPolicyList();
                            dialogService.notifyWithoutBlocking({
                                msg: $filter('translate')('policylist.deleted.notify', { length: policyIdList.length }),
                                timeout: 5000
                            });
                        });
                    }
                }
            });
            $event.stopPropagation();
        };

        var downloadFile = function (fileName){
            var url = configService.configObject['policyStudio'].url['online'].rootContext + 'exports/XacmlPolicy/' + fileName;
            policyService.getFileAsBlob(url, function (data) {
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(data, fileName);
                } else {
                    var blob = new Blob([data], {type: "application/xml"});
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href',window.URL.createObjectURL(blob));
                    downloadLink.attr('download', fileName);
                    downloadLink[0].click();
                }
            });
        };
        $scope.exportSelectedPolicies = function ($event) {
            let policyIdList = [];
            angular.forEach($scope.xacmlPoliciesList, function (item) {
                item.checked && policyIdList.push(item.id);
            });
            if (policyIdList.length > 0) {
                xacmlPolicyService.getXacmlPolicyExportFilename(policyIdList, function (response) {
                    response.data.forEach(function(fileName) {
                        downloadFile(fileName);
                    });
                });
            }
        };

        $scope.exportSelectedPolicy = function (xacmlPolicy) {
            xacmlPolicyService.getXacmlPolicyExportFilename([xacmlPolicy.id], function (response) {
                var fileName = response.data[0];
                downloadFile(fileName);
            });
        };
    }
]);
