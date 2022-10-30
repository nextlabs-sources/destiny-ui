controlCenterConsoleApp.directive('autoScrollTo', ['$filter', function($filter) {
    var displayElementRecursively = function(ele) {
        ele.removeClass('ng-hide');
        if(ele.parent().filter(':visible').length) return;
        displayElementRecursively(ele.parent());
    }
    return {
        scope: {
            scrollTargetSelector: '@',
            scrollTopMargin: '@',
        },
        link: function(scope, element, attrs) {
            scope.$on('scrollto', function() {
                // if (newVal == oldVal) return;
                setTimeout(function() {
                    var target = $(element).find(scope.scrollTargetSelector);
                    if (!target.length) return;
                    if(target.filter(':visible').length == 0) displayElementRecursively($(target[0]));
                    var scrollTop = $(element).scrollTop() + target.offset().top - $(element).offset().top - (scope.scrollTopMargin ? scope.scrollTopMargin : 0);
                    // console.log('scrollTop', scrollTop)
                    $(element).animate({
                        scrollTop: scrollTop
                    }, 100)
                }, 10)
            })
        }
    };
}]);