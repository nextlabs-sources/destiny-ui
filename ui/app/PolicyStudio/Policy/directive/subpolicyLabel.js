policyStudio.directive('ccPsSubpolicyLabel', ['loggerService', function(loggerService) {
  return {
    scope: {
      subpolicies: '@',
      // maxwidth: '@',
    },
    template: '<div class="cc-ps-subpolicy-title{{hide}} cc-inline">{{content}}</div><div class="cc-ps-subpolicy-title-more{{hide}} cc-inline">{{more}}</div>',
    link: function(scope, element, attrs) {
      var temp = $('<span/>').attr('id', 'cc-ps-subpolicy-title-temp').css('background-color', 'transparent').css('color', 'transparent');
      $('.cc-layout').append(temp);
      var subpolicies = JSON.parse(scope.subpolicies);
      loggerService.getLogger().log('width',temp.css('width'));
      // var maxwidth = parseInt(scope.maxwidth);
      var length = 0;
      var content = '';
      var remaining = subpolicies.length;
      angular.forEach(subpolicies, function(subPolicy) {
        var lengthAfter = length + subPolicy.title.length;
        if (length > 0) {
          temp.text(temp.text() + ', ');
          content += ', ';
        }
        // if (temp.width() < maxwidth) remaining--;
        content += subPolicy.title;
        temp.text(temp.text() + subPolicy.title);
        length = lengthAfter;
      });
      temp.remove();
      scope.hide = '-hide';
      if (remaining > 0) {
        scope.more = '+' + remaining + ' more';
        scope.hide = null;
      }
      scope.content = content;
    }
  };
}]);