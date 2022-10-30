controlCenterConsoleApp.directive('autoResizeTextarea', ['$rootScope', '$window', function($rootScope, $window) {
  return {
    link: function(scope, element, attrs) {
      $ele = $(element)
      $ele.css('resize', 'none')
      $ele.css('max-height', '100px')
      $ele.css('overflow-y', 'auto')
      var $parent = $ele.parent()
      var paddingTop = $ele.css('padding-top')
      var paddingBottom = $ele.css('padding-bottom')
      var padding = 0
      if(paddingTop.length) padding += parseInt(paddingTop)
      if(paddingBottom.length) padding += parseInt(paddingBottom)
      $parent.on( 'change keyup keydown paste cut', 'textarea', function (){
        $(this).height(0).height(this.scrollHeight - padding);
      });
      $ele.height(0).height(element.scrollHeight - padding);
    }
  }
}]);