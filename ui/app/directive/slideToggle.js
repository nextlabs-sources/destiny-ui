controlCenterConsoleApp.directive('slideToggle', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            scope.$watch(attr['ngModel'], function (state) {
                var slideBox = angular.element(attr.slideToggle);
                if (state) {
                    slideBox.slideDown({
                        duration: 500,
                        start: function () {
                            slideBox.css('overflow', 'hidden');
                        },
                        complete: function () {
                            slideBox.css('overflow', 'visible');
                        }
                    });
                } else {
                    slideBox.slideUp({
                        duration: 500,
                        start: function () {
                            slideBox.css('overflow', 'hidden');
                        },
                        complete: function () {
                            slideBox.css('overflow', 'visible');
                        }
                    });
                }
            });
        }
    };
}]);