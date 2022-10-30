controlCenterConsoleApp.directive('scrollToTopWhen', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$on(attrs.scrollToTopWhen, function() {
                $timeout(function() {
                    angular.element(element)[0].scrollTop = 0;
                });
            });
        }
    };
}])