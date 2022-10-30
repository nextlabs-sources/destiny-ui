controlCenterConsoleApp.factory('tagService', ['networkService', 'configService', '$q',
  function(networkService, configService, $q) {
    var getAllMatchingTags = function(type, label) {
      
      var deferred = $q.defer();
      networkService.post(configService.getUrl("tags"), {
        tag: {
          type: type,
          label: label
        },
        pageNo: 0,
        pageSize: 65535
      }, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise
    }
    return {
      getAllMatchingTags: getAllMatchingTags,
    }
  }
]);