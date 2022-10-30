controlCenterConsoleApp.directive('restrictInput', ['$compile', '$timeout', function($compile, $timeout) {
  return {
    scope: {
      charListNotAllowed: '=restrictInput',
      behavior: '@',
      ngModel: '&',
      ngModelName: '@ngModel'
    },
    link: function(scope, elem, attrs) {
      if (scope.charListNotAllowed && angular.isArray(scope.charListNotAllowed) && scope.charListNotAllowed.length) {
        var charListNotAllowedRE = new RegExp('[' + scope.charListNotAllowed.map(function(item) {
          switch (item) {
            case '\\':
            case '^':
            case '-':
              return '\\' + item;
              break;
            default:
              return item;
          }
        }).join('') + ']', 'g');
        scope.$watch(scope.ngModel, function(newVal, oldVal) {
          if (!newVal || newVal == oldVal) return;
          if(charListNotAllowedRE.test(newVal)) {
            // console.log('not allowed chars found in', newVal)
            var valCharsNotAllowedRemoved = newVal.replace(charListNotAllowedRE, '');
            // console.log('not allowed chars removed', valCharsNotAllowedRemoved)
            valCharsNotAllowedRemoved = valCharsNotAllowedRemoved.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
            // console.log('scope.$parent.' + scope.ngModelName + '="' + valCharsNotAllowedRemoved + '"');
            eval('scope.$parent.' + scope.ngModelName + '="' + valCharsNotAllowedRemoved + '"');
          }
        });
      }
    }
  };
}]);