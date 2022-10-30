dashboardApp.factory('dashboardService', ['networkService', 'configService', 'loggerService', 
	function(networkService, configService, loggerService) {
  
	  var getPolicyEffectChart = function(callback) {
	    networkService.get(configService.getUrl("dashboard.policyEffect"), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getPolicyStatusChart = function(callback) {
	    networkService.get(configService.getUrl("dashboard.policyStatus"), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getPolicyStatusChartPeriod = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.policyStatus") + '/' + from.getTime() + '/' + to.getTime(), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getRequestChart = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.policyEvaluation") + from.getTime() + '/' + to.getTime(), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getPdpChart = function(callback) {
	    networkService.get(configService.getUrl("dashboard.pdpData"), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getAlertChart = function(from, to, unit, callback) {
	    networkService.get(configService.getUrl("dashboard.monitorsAlerts") + from.getTime() + '/' + to.getTime() + '/' + unit, function(data) {
	     // networkService.get(configService.getUrl("dashboard.monitorsAlerts") +  '1456329600000/1456848000000' , function(data) {
	      callback && callback(data);
	    });
	  };
	  var getMonitors = function(callback) {
	    networkService.get(configService.getUrl("dashboard.monitors"), function(data) {
	      callback && callback(data);
	    });
	  };
	  var getSystemConfigStatus = function(callback) {
	    networkService.get(configService.getUrl("dashboard.sysConfigStatus"), callback);
	  };
	  var getSystemDetails = function(callback) {
	    networkService.get(configService.getUrl("dashboard.sysDetails"), callback);
	  };
	  var getNotMatchingPolicies = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.notMatchingPolicies") + from.getTime() + '/' + to.getTime(), callback);
	  };
	  var getPdpThroughput = function(from, to, unit, callback) {
	    networkService.get(configService.getUrl("dashboard.pdpThroughput") + from.getTime() + '/' + to.getTime() + '/' + unit, callback);
	  };
	  var getAllowUserActivities = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.userActivities") + from.getTime() + '/' + to.getTime() + '/A', callback);
	  };
	  var getDenyUserActivities = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.userActivities") + from.getTime() + '/' + to.getTime() + '/D', callback);
	  };
	  var getActivitiesByResource = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.activityByResources") + from.getTime() + '/' + to.getTime(), callback);
	  };
	  var getActivityByPolicies = function(from, to, callback) {
	    networkService.get(configService.getUrl("dashboard.activityByPolicies") + from.getTime() + '/' + to.getTime(), callback);
	  };
	  var getPolicyByTags = function(callback) {
	    networkService.get(configService.getUrl("dashboard.policyByTags"), callback);
	  };
	  var getActivityStream = function(callback) {
	    networkService.get(configService.getUrl("dashboard.activityStream"), callback);
	  };
	  var getEnrollmentDetails = function(callback) {
	    networkService.get(configService.getUrl("dashboard.enrollmentDetails"), callback);
	  };
	  return {
	    getPolicyEffectChart : getPolicyEffectChart,
	    getPolicyStatusChart: getPolicyStatusChart,
	    getPolicyStatusChartPeriod: getPolicyStatusChartPeriod,
	    getRequestChart: getRequestChart,
	    getPdpChart:getPdpChart,
	    getAlertChart:getAlertChart,
	    getMonitors:getMonitors,
	    getSystemConfigStatus: getSystemConfigStatus,
	    getSystemDetails: getSystemDetails,
	    getNotMatchingPolicies: getNotMatchingPolicies,
	    getPdpThroughput: getPdpThroughput,
	    getAllowUserActivities: getAllowUserActivities,
	    getDenyUserActivities: getDenyUserActivities,
	    getActivitiesByResource: getActivitiesByResource,
	    getActivityByPolicies: getActivityByPolicies,
	    getPolicyByTags: getPolicyByTags,
	    getActivityStream: getActivityStream,
	    getEnrollmentDetails: getEnrollmentDetails,
	  }
}]);