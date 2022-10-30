policyStudio.factory('toolEnrollmentService', ['$http', 'networkService', 'configService', 'loggerService', 'apiAssembleService', 'viewCacheService', '$q', function($http, networkService, configService, loggerService, apiAssembleService, viewCacheService, $q) {

  var PAGE_SIZE = configService.configObject.policyStudio['defaultUserListPageSize'];

    var executeCrypt = function(password, callback){
      networkService.post(configService.getUrl("tools.executeCrypt"), password, function(data){
        callback(data);
      })
    }

    var getEnrollments = function(callback){
      networkService.get(configService.getUrl("tools.enrollments"), function(data){
        callback(data);
      })
    };

    var saveEnrollment = function(data, callback){
      networkService.post(configService.getUrl("tools.saveEnrollments"), data, function(result){
        callback && callback(result);
      })
    }

    var validateEnrollment = function(data, callback){
      networkService.post(configService.getUrl("tools.validateEnrollments"), data, function(result){
        callback && callback(result);
      })
    }

    var findEnrollmentById = function(enrollmentId, callback){
      networkService.get(configService.getUrl("tools.findEnrollmentById") + enrollmentId, function(result){
        callback && callback(result);
      })
    }

    var syncEnrollment = function(enrollmentId, callback) {
      networkService.get(configService.getUrl("tools.syncEnrollments") + enrollmentId, function(data) {
        callback && callback(data);
      });
    }

    var deleteEnrollment = function(enrollmentId, callback) {
      networkService.del(configService.getUrl("tools.deleteEnrollments") + enrollmentId, null, function(data) {
        callback && callback(data);
      });
    }

    var uploadFileExtra = function(file, id, delta, callback) {
      var formData = new FormData();
      formData.append('delta', delta);
      formData.append('ldifFile', file);
      networkService.putWithFile(configService.getUrl("tools.uploadFileExtra") + id, formData, function(result) {
        callback & callback(result);
      });
    }

    var getFormattedDate = function(date){
      return date == null ? date : new Date(moment(date)).getTime();
    }

      /* ---------- Location Manager ---------- */
  var getLocations = function (searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, true);
    var cachedRequest = angular.copy(request);
    cachedRequest.name = searchCriteria.name;
    viewCacheService.cacheView("PS-LOCATION-LIST", cachedRequest);
    request.criteria.pageNo = startPos / PAGE_SIZE;
    request.criteria.pageSize = PAGE_SIZE;
    networkService.post(configService.getUrl("tools.location.search"), request, function (data) {
      callback(data);
    });
  };

  var buildSearchCriteriaForAPI = function(searchCriteria, includeOrder){

    var fields = [];
    var request = {
      criteria: {
        fields: fields
      }
    };

    if (searchCriteria.text) {
      var field = apiAssembleService.createSingleStringField('title', searchCriteria.text);
      fields.push(field);
    }
    
    if (includeOrder && searchCriteria.sortBy) {
      var field = {
        "field": searchCriteria.sortBy.name,
        "order": searchCriteria.sortBy.order
      };
      request.criteria.sortFields = [field];
    }
    return request;
    };

  var saveLocation = function (location, callback) {
    networkService.post(configService.getUrl("tools.location.save"), location, function (data) {
      callback(data);
    });
  };

  var updateLocation = function (location, callback) {
    networkService.post(configService.getUrl("tools.location.update"), location, function (data) {
      callback(data);
    });
  };

  var deleteLocation = function (location, callback) {
    networkService.del(configService.getUrl("tools.location.delete"), location, function (data) {
      callback & callback(data);
    }, {
      contentType: 'application/json'
    });
  };

  var bulkDeleteLocation = function(delLocList, callback){
    networkService.post(configService.getUrl("tools.location.bulkDelete"), delLocList, function (data) {
      callback(data);
    });
  }

  var retrieveSearchOption = function(callback) {
    var deferred = $q.defer();
    networkService.get(configService.getUrl("tools.location.fields"), function(data) {
      callback(data);
      deferred.resolve();
    });
    return deferred.promise;
  };

  var validateFile = function(file, callback){
    networkService.postWithFile(configService.getUrl("tools.location.validateImportFile"), {file: file}, function (data) {
      callback(data);
    });
  }

  var bulkImportLocation = function(file, callback){
    networkService.postWithFile(configService.getUrl("tools.location.bulkImport"), {file: file}, function (data) {
      callback(data);
    });
  }

  var getSavedSearch = function(callback) {
    networkService.get(configService.getUrl("tools.location.savedlist") + '?pageNo=0&pageSize=65535', callback, {
      forceCallback: true
    });
  };
  var delSavedSearch = function(search, callback) {
    networkService.del(configService.getUrl("tools.location.savedlist.del") + search.id, null, function(data) {
      callback(data);
    });
  };

  var saveSearch = function(searchCriteria, callback) {
    loggerService.getLogger().log(searchCriteria);
    var request = buildSearchCriteriaForAPI(searchCriteria, {
      includeOrder: false
    });
    request.name = searchCriteria.name;
    request.desc = searchCriteria.description;
    request.type = "LOCATION";
    loggerService.getLogger().log(request);
    networkService.post(configService.getUrl("tools.location.savesearch"), request, function(data) {
      // logGerservice.Getlogger().log(data);
      callback && callback(data);
    });
  };


  /* ------------------------------ */
    
    return {
      executeCrypt: executeCrypt,
      getEnrollments: getEnrollments,
      saveEnrollment: saveEnrollment,
      findEnrollmentById: findEnrollmentById,
      syncEnrollment: syncEnrollment,
      deleteEnrollment: deleteEnrollment,
      uploadFileExtra: uploadFileExtra,
      getFormattedDate: getFormattedDate,
      retrieveSearchOption: retrieveSearchOption,
      getLocations: getLocations,
      saveLocation: saveLocation,
      updateLocation: updateLocation,
      deleteLocation: deleteLocation,
      bulkDeleteLocation: bulkDeleteLocation,
      validateFile: validateFile,
      bulkImportLocation: bulkImportLocation,
      saveSearch: saveSearch,
      getSavedSearch: getSavedSearch,
      delSavedSearch: delSavedSearch,
      validateEnrollment: validateEnrollment
    }
  }]);