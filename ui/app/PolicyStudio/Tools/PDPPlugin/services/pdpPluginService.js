policyStudio.factory('pdpPluginService', ['$http', '$q', 'networkService', 'configService',
    function($http, $q, networkService, configService) {

        var get = function(id, callback) {
            networkService.get(configService.getUrl("pdpPlugin.getById") + id, function(resp) {
                callback && callback(resp);
            });
        };

        var add = function(payload, propertiesFile, mainJarFile, thirdPartyJarFiles, otherFiles) {
            var deferred = $q.defer();

            const json = JSON.stringify(payload);
            const blob = new Blob([json], {
              type: 'application/json'
            });
            var hybridPayload = {
              "config": blob,
              "properties": propertiesFile,
              "mainJar": mainJarFile,
              "externalLibs": thirdPartyJarFiles,
              "externalFiles": otherFiles
            };

            networkService.postWithFile(configService.getUrl("pdpPlugin.add"), hybridPayload, function(data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        var modify = function(payload, propertiesFile, mainJarFile, thirdPartyJarFiles, otherFiles) {
            var deferred = $q.defer();

            if(propertiesFile || mainJarFile || thirdPartyJarFiles || otherFiles) {
                const json = JSON.stringify(payload);
                const blob = new Blob([json], {
                  type: 'application/json'
                });
                var hybridPayload = {
                  "config": blob
                };

                if(propertiesFile) {
                    hybridPayload.properties = propertiesFile;
                }

                if(mainJarFile) {
                    hybridPayload.mainJar = mainJarFile;
                }

                if(thirdPartyJarFiles) {
                    hybridPayload.externalLibs = thirdPartyJarFiles;
                }

                if(otherFiles) {
                    hybridPayload.externalFiles = otherFiles;
                }

                networkService.postWithFile(configService.getUrl("pdpPlugin.modifyWithAttachment"), hybridPayload, function(data) {
                    deferred.resolve(data);
                });
            } else {
                networkService.put(configService.getUrl("pdpPlugin.modify"), payload, function(data) {
                    deferred.resolve(data);
                });
            }

            return deferred.promise;
        };

        var remove = function(id, callback) {
            networkService.del(configService.getUrl("pdpPlugin.delete") + id, null, function(data) {
                callback && callback(data);
            });
        };

        var bulkDelete = function(payload, callback) {
            networkService.del(configService.getUrl("pdpPlugin.bulkDelete"), payload, function(data) {
                callback && callback(data);
            }, {
                contentType: 'application/json'
            });
        };

        var deploy = function(id, callback) {
            networkService.put(configService.getUrl("pdpPlugin.deploy") + id, null, function(data) {
                callback && callback(data);
            });
        };

        var bulkDeploy = function(payload, callback) {
            networkService.put(configService.getUrl("pdpPlugin.bulkDeploy"), payload, function(data) {
                callback && callback(data);
            }, {
                contentType: 'application/json'
            });
        };

        var deactivate = function(id, callback) {
            networkService.put(configService.getUrl("pdpPlugin.deactivate") + id, null, function(data) {
                callback && callback(data);
            });
        };

        var bulkDeactivate = function(payload, callback) {
            networkService.put(configService.getUrl("pdpPlugin.bulkDeactivate"), payload, function(data) {
                callback && callback(data);
            }, {
                contentType: 'application/json'
            });
        };

        var list = function(payload, callback) {
            networkService.get(configService.getUrl("pdpPlugin.list"), payload, function(data) {
                callback && callback(data);
            });
        };

        var getFileAsBlob = function (pluginId, fileId, callback) {
            networkService.get(configService.getUrl("pdpPlugin.downloadFile") + pluginId + "/" + fileId, function (response) {
                callback && callback(response);
            }, { responseType: "blob" });
        };

        return {
            list: list,
            get: get,
            add: add,
            modify: modify,
            remove: remove,
            bulkDelete: bulkDelete,
            deploy: deploy,
            bulkDeploy: bulkDeploy,
            deactivate: deactivate,
            bulkDeactivate: bulkDeactivate,
            getFileAsBlob: getFileAsBlob
        };
    }
]);