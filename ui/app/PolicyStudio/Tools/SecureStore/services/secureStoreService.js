policyStudio.factory('secureStoreService', ['$http', '$q', 'networkService', 'configService',
    function($http, $q, networkService, configService) {

        var getStoreNames = function(storeType) {
            var deferred = $q.defer();
			
            networkService.get(configService.getUrl("secureStore.list.storeNames") + storeType, function(data) {
                deferred.resolve(data);
            });
			
            return deferred.promise;
        };

        var getEntries = function(storeType, callback) {
            networkService.get(configService.getUrl("secureStore.list.entries") + storeType, function(resp) {
                callback && callback(resp);
            });
        };

        var getStoreFiles = function() {
            var deferred = $q.defer();

            networkService.get(configService.getUrl("secureStore.list.storeFiles"), function(data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        var getDigestAlgorithms = function() {
            var deferred = $q.defer();

            networkService.get(configService.getUrl("secureStore.list.digestAlgorithms"), function(data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        var getKeyAlgorithms = function() {
            var deferred = $q.defer();

            networkService.get(configService.getUrl("secureStore.list.keyAlgorithms"), function(data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        var getSignatureAlgorithms = function(keyAlgorithm) {
            var deferred = $q.defer();

            networkService.get(configService.getUrl("secureStore.list.signatureAlgorithms") + keyAlgorithm, function(data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        var getEntryDetails = function(storeName, alias, callback) {
            networkService.get(configService.getUrl("secureStore.entry.details") + storeName + "/" + alias, function(resp) {
                callback && callback(resp);
            });
        };

        var changePassword = function(data, callback) {
            networkService.put(configService.getUrl("secureStore.changePassword"), data, function(data) {
                callback && callback(data);
            });
        };

        var generateKey = function(payload, callback) {
            networkService.post(configService.getUrl("secureStore.generateKey"), payload, function(result){
                callback && callback(result);
            });
        };

        var generateCsr = function(payload, callback) {
            networkService.post(configService.getUrl("secureStore.generateCsr"), payload, function(response) {
                callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/SecureStore/' + response.data);
            });
        };

        var removeEntry = function(storeName, alias, callback) {
            networkService.del(configService.getUrl("secureStore.remove") + storeName + "/" + alias, null, function(data) {
                callback && callback(data);
            });
        };

        var bulkDelete = function(payload, callback) {
            networkService.del(configService.getUrl("secureStore.bulkDelete"), payload, function(data) {
                callback && callback(data);
            }, {
                contentType: 'application/json'
            });
        };

        var importCertificate = function(payload, callback) {
            networkService.postWithFile(configService.getUrl("secureStore.importCertificate"), payload, function(data) {
                callback && callback(data);
            });
        };

        var importPkcs12KeyPair = function(payload, callback) {
            networkService.postWithFile(configService.getUrl("secureStore.importPkcs12KeyPair"), payload, function(data) {
                callback && callback(data);
            });
        };

        var importPemKeyPair = function(payload, callback) {
            networkService.postWithFile(configService.getUrl("secureStore.importPemKeyPair"), payload, function(data) {
                callback && callback(data);
            });
        };

        var exportCertificate = function(storeName, alias, callback) {
            networkService.get(configService.getUrl("secureStore.exportCertificate") + storeName + "/" + alias, function(response) {
                callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/SecureStore/' + response.data);
            });
        };

        var exportAll = function(callback) {
            networkService.get(configService.getUrl("secureStore.exportAll"), function (response) {
                callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/SecureStore/' + response.data);
            });
        };

        var replaceStoreFile = function(payload, callback) {
            networkService.postWithFile(configService.getUrl("secureStore.replaceStoreFile"), payload, function(data) {
                callback && callback(data);
            });
        };

        var listKeyPair = function(payload, callback) {
            networkService.postWithFile(configService.getUrl("secureStore.listKeyPair"), payload, function(data) {
                callback && callback(data);
            });
        };

        var getFileAsBlob = function (url, callback) {
            networkService.get(url, function (response) {
                callback && callback(response);
            }, { responseType: "blob" });
        };

        return {
            getStoreNames : getStoreNames,
            getEntries : getEntries,
            getEntryDetails : getEntryDetails,
            getStoreFiles : getStoreFiles,
            getDigestAlgorithms : getDigestAlgorithms,
            getKeyAlgorithms : getKeyAlgorithms,
            getSignatureAlgorithms : getSignatureAlgorithms,
            changePassword : changePassword,
            generateKey : generateKey,
            generateCsr : generateCsr,
            removeEntry : removeEntry,
            bulkDelete : bulkDelete,
            importCertificate : importCertificate,
            importPkcs12KeyPair: importPkcs12KeyPair,
            importPemKeyPair: importPemKeyPair,
            exportCertificate : exportCertificate,
            exportAll : exportAll,
            replaceStoreFile: replaceStoreFile,
            listKeyPair: listKeyPair,
            getFileAsBlob: getFileAsBlob
        };
    }
]);