controlCenterConsoleApp.directive('ccVideo', [function () {
  return {
    scope: {
      videos: '=',
    },
    link: function (scope, element, attrs) {
      angular.forEach(scope.videos, function (video) {
        if (scope.$root.installMode == video.mode) {
          $(element).append('<a href="' + video.src + '" data-video="true"><img src="' + video.thumbnail + '" border="0" /> </a>')
        }
      });
      $(element).addClass('fotorama');
      $.getScript('ui/lib/fotorama-4.6.4/fotorama.js');
    }
  };
}]);