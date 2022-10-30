controlCenterConsoleApp.factory('viewCacheService', [function() {
  var cachedInfo = {};
  var cacheView = function(view, scope) {
    cachedInfo[view] = scope;
  }
  var getCachedView = function(view) {
    return cachedInfo[view];
  }
  return {
    cacheView: cacheView,
    getCachedView: getCachedView,
  }
}]);