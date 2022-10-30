policyStudio.factory('environmentService', [ 'networkService', 'configService', 'loggerService', 'apiAssembleService', function ( networkService, configService, loggerService, apiAssembleService) {

  let getEnvironment = function (searchCriteria, startPos, callback) {
    loggerService.getLogger().log(searchCriteria);
    if (searchCriteria && searchCriteria) {
      let request = buildSearchCriteriaForAPI(searchCriteria, true);
      networkService.post(configService.getUrl("environment.search"), request, function (data) {
        callback && callback(data);
      });
    }
  };

  let getEnvironmentbyId = function(id, callback) {
      networkService.get(configService.getUrl("environment.get") + id, function(data) {
        callback && callback(data);
      });
  };

  let saveEnvironment = function (environment, callback) {
    networkService.post(configService.getUrl("environment.add"), environment, function (data) {
      callback && callback(data);
    });
  };

  let testConnection = function (environment, callback) {
    networkService.post(configService.getUrl("environment.validate.connection"), environment, function (data) {
      callback && callback(data);
    });
  };

  let modifyEnvironment = function (environment, callback) {
    networkService.put(configService.getUrl("environment.modify"), environment, function (data) {
      callback && callback(data);
    });
  };

  let deleteEnvironment = function (environmentId, callback) {
    networkService.del(configService.getUrl("environment.remove") + environmentId, null, function (data) {
      callback && callback(data);
    });
  };

  let buildSearchCriteriaForAPI = function(searchCriteria, includeOrder) {
    let fields = [];
    let request = {
      criteria: {
        fields: fields
      }
    };
    if (searchCriteria.modifiedDate && searchCriteria.modifiedDate.name) {
      if (searchCriteria.modifiedDate.name != 'CUSTOM') {
        try {
          let fromAndTo = apiAssembleService.getFromAndToDate(searchCriteria.modifiedDate.name)
          let field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', fromAndTo[0], fromAndTo[1], searchCriteria.modifiedDate.name);
          fields.push(field);
        } catch (TypeError) {
          loggerService.getLogger().log(searchCriteria.modifiedDate.name + ' is not defined');
        }
      }
      if (searchCriteria.modifiedDate.name == 'CUSTOM' && searchCriteria.modifiedFrom && searchCriteria.modifiedTo) {
        let nextDay = angular.copy(searchCriteria.modifiedTo);
        nextDay.setDate(nextDay.getDate() + 1);
        let field = apiAssembleService.createSingleDateRangeField('lastUpdatedDate', searchCriteria.modifiedFrom, nextDay, searchCriteria.modifiedDate.name);
        fields.push(field);
      }
    }
    if (searchCriteria.text) {
      let field = apiAssembleService.createSingleTextField(['name', 'description'], searchCriteria.text);
      fields.push(field);
    }
    if (includeOrder && searchCriteria.sortBy) {
      let field = {
        "field": searchCriteria.sortBy.name,
        "order": searchCriteria.sortBy.order
      };
      request.criteria.sortFields = [field];
    }
    return request;
  }

  return {
    getEnvironment: getEnvironment,
    getEnvironmentbyId: getEnvironmentbyId,
    testConnection: testConnection,
    saveEnvironment: saveEnvironment,
    modifyEnvironment: modifyEnvironment,
    deleteEnvironment: deleteEnvironment,
  }
}]);
