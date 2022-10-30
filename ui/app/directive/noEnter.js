controlCenterConsoleApp.directive('noEnter', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
  return {
    require: ['ngModel'],
    transclude: true,
    // scope: {
      // ngModel: '&'
    // },
    link: function(scope, element, attrs) {
      $(element).keypress(function(e) {
        if (e.key == 'Enter') {
          e.preventDefault();
        }
      })
      $(element).on('paste', function(e) {
        $timeout(function() {
           console.log($(element).val())
           if($(element).val().indexOf('\n') > -1) {
            $(element).val($(element).val().replace(/\n/g, ' '))
            // scope.ngModel = $(element).val().replace(/\n/g, '')
            // scope.$apply();
            // console.log(scope)
           }
         }, 0)
      })
    }
  }
}]);