delegationApp.factory('loginConfigService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q',
  function($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {
    var getLoginConfig = function() {
      var deferred = $q.defer();
      // networkService.get(configService.getUrl("loginconfig.list"), function(data) {
      //   deferred.resolve(data);
      // });
      var data = {
        data: [{
          id: 1,
          name: "Some AD Service"
        }, {
          id: 2,
          name: "Some AD Service 2"
        }, {
          id: 3,
          name: "Customized MySQL"
        }]
      }
      deferred.resolve(data);
      return deferred.promise;
    }
    var listLoginConfig = function() {
      var deferred = $q.defer();
      networkService.get(configService.getUrl("loginconfig.list"), function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var getLoginConfig = function(id) {
      var deferred = $q.defer();
      networkService.get(configService.getUrl("loginconfig.getById") + id, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var addLoginConfig = function(config, loginImage, idpMetadata) {
      var deferred = $q.defer();
      if(loginImage && idpMetadata) {
        const json = JSON.stringify(config);
        const blob = new Blob([json], {
          type: 'application/json'
        });
        var hybridPayload = {
          "config": blob,
          "loginImage": loginImage,
          "idpMetadata": idpMetadata
        };
        networkService.postWithFile(configService.getUrl("loginconfig.addWithAttachment"), hybridPayload, function(data) {
          deferred.resolve(data);
        });
      } else {
        networkService.post(configService.getUrl("loginconfig.add"), config, function(data) {
          deferred.resolve(data);
        });
      }
      return deferred.promise;
    }
    var verifyLoginConfig = function(config) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("loginconfig.verify"), config, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var getAttributeList = function(config) {
      var deferred = $q.defer();
      networkService.post(configService.getUrl("loginconfig.getAttributes"), config, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var getExistingAttributeList = function(config) {
      var deferred = $q.defer();
      networkService.get(configService.getUrl("loginconfig.listuserattr") + config.id, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var modifyLoginConfig = function(config, loginImage, idpMetadata) {
      var deferred = $q.defer();
      if(loginImage || idpMetadata) {
        const json = JSON.stringify(config);
        const blob = new Blob([json], {
          type: 'application/json'
        });
        var hybridPayload = {
          "config": blob,
          "loginImage": loginImage,
          "idpMetadata": idpMetadata
        };
        networkService.postWithFile(configService.getUrl("loginconfig.modifyWithAttachment"), hybridPayload, function(data) {
          deferred.resolve(data);
        });
      } else {
        networkService.put(configService.getUrl("loginconfig.modify"), config, function(data) {
          deferred.resolve(data);
        });
        }
      return deferred.promise;
    }
    var removeLoginConfig = function(id) {
      var deferred = $q.defer();
      networkService.del(configService.getUrl("loginconfig.remove") + id, null, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
    var downloadFileResource = function(resourceKey, callback) {
      networkService.get(configService.getUrl("loginconfig.downloadFileResource") + resourceKey, function (response) {
          callback(configService.configObject['policyStudio'].url['online'].rootContext + 'exports/LoginConfig/' + response.data);
      });
    };
    var getFileAsBlob = function (url, callback) {
      networkService.get(url, function (response) {
          callback && callback(response);
      }, { responseType: "blob" });
    }
    return {
      listLoginConfig: listLoginConfig,
      getLoginConfig: getLoginConfig,
      addLoginConfig: addLoginConfig,
      verifyLoginConfig: verifyLoginConfig,
      modifyLoginConfig: modifyLoginConfig,
      removeLoginConfig: removeLoginConfig,
      getAttributeList: getAttributeList,
      getExistingAttributeList: getExistingAttributeList,
      downloadFileResource: downloadFileResource,
      getFileAsBlob: getFileAsBlob
    }
  }
]);