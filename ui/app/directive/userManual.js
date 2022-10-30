controlCenterConsoleApp.directive('userManual', ['$filter', 'userManualTranslateService', function($filter, userManualTranslateService) {
  return {
    restrict: "AE",
    scope: {
      ngModel: '=',
      ngModelName: '=ngModel',
      app: '@',
      section: '@',
      page: '@',
      key: '@'
    },
    replace: !0,
    transclude: !0,
    template: "<div data-ng-show=\"ngModelName\" class=\"cc-user-manual\" data-ng-if1=\"{{content}}\"><span><span data-ng-bind-html=\"content\"></span> <span class=\"cc-user-manual-close\">\
    <i class=\"fa fa-times-circle\" data-ng-click=\"closeManual()\"></i></span> </span></div>",
    link: function(scope, element, attrs) {
      scope.$watch(function() {
        return scope.ngModelName;
      }, function(newValue, oldValue) {
        if(scope.content || newValue == oldValue) return;
        userManualTranslateService.translate({
          app: scope.app,
          section: scope.section,
          page: scope.page,
          key: scope.key
        }, function(content) {
          scope.content = content;
        });
      })
      scope.closeManual = function() {
        scope.ngModel = false;
      }
    }
  };
}]);
controlCenterConsoleApp.filter('userManualTranslateFilter', ['userManualTranslateService', function(userManualTranslateService) {
  return function(option) {
    return userManualTranslateService.translate(option);
  };
}]);