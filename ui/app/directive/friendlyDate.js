controlCenterConsoleApp.directive('friendlyDate', ['$filter', function($filter) {
  return {
    scope: {
      date: '@',
      prefix: '@',
      fullFormat: '@',
      shortFormat: '@',
      titleClass: '@',
      contentClass: '@',
      dateType: '@',
      friendlyDateId: '@'
    },
    template: "<span class=\"{{titleClass}}\">{{title}}</span>\
     <span id=\"{{friendlyDateId}}\" class=\"{{contentClass}}\">{{content}}</span>",
    link: function(scope, element, attrs) {
      var prefix = scope.prefix;
      var date = null;
      date = new Date(parseInt(scope.date));
      // var date = new Date(Date.parse(scope.date));
      var now = new Date();
      var title = '';
      var content = '';
      if (prefix) title = prefix;
      if (now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate()) {
        // today
        var nowMS = now.getTime();
        var updateTimeMS = date.getTime();
        if (nowMS - updateTimeMS > 3600 * 1000) {
          var hrPassed = parseInt((nowMS - updateTimeMS) / (3600 * 1000));
          content = hrPassed + ' ' + (hrPassed == 1 ? 'hour' : 'hours') + ' ago'
        } else if (nowMS - updateTimeMS > 60 * 1000) {
          var minPassed = parseInt((nowMS - updateTimeMS) / (60 * 1000));
          content = minPassed + ' ' + (minPassed == 1 ? 'min' : 'mins') + ' ago'
        } else {
          content = 'a moment ago';
        }
      } else {
        var yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate() + 1) {
          // yesterday
          content = 'yesterday, ' + $filter('date')(date, scope.shortFormat);
        } else {
          content = $filter('date')(date, scope.fullFormat)
        }
      }
      scope.title = title;
      scope.content = content;
      // loggerService.getLogger().log(scope.content);
    }
  };
}]);