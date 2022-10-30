policyStudio.factory('xacmlPolicyService', ['networkService', 'configService', function(networkService, configService) {
    'use strict';

    var getXacmlPolicies = function(callback) {
        networkService.post(configService.getUrl('xacmlpolicylist.searchpolicy'), {}, function(data) {
            callback(data);
        });
    };

    var saveXacmlPolicy = function(xacmlFile, callback){
        var formData = new FormData();
        formData.append('xacmlFile', xacmlFile);
        networkService.postWithFile(configService.getUrl('xacmlpolicy.addpolicy'), formData, function (data) {
            callback(data);
        });
    };

    var getXacmlPolicyExportFilename = function(policyIdList, callback){
        var options = {'contentType': 'application/json'};
        networkService.post(configService.getUrl('xacmlpolicy.exportpolicy'), policyIdList, function (data) {
            callback(data);
        }, options);
    };

    var bulkDelPolicy = function(policyIdList, callback){
        var options = {"contentType": "application/json"};
        networkService.del(configService.getUrl('xacmlpolicy.bulkdeletepolicy'), policyIdList, function (data) {
            callback(data);
        }, options);
    };
    return {
        getXacmlPolicies: getXacmlPolicies,
        saveXacmlPolicy: saveXacmlPolicy,
        bulkDelPolicy: bulkDelPolicy,
        getXacmlPolicyExportFilename: getXacmlPolicyExportFilename
    };

}]);
