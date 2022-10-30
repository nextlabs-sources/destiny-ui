controlCenterConsoleApp.directive('autoSize', ['$rootScope', '$window', function($rootScope, $window) {
  var preciseWidth = function(element, precision) {
    // if(element.length) element = element[0];
    // console.log(element)
    // console.log(window.getComputedStyle(element))
    var w = window.getComputedStyle(element).width;
    w = w.substring(0, w.length - 2);
    var width = parseFloat(w);
    if(precision) width = parseFloat(width.toFixed(precision));
    return width;
  }
  return {
    link: function(scope, element, attrs) {
      // angular.element($window).bind('resize', function() {
      $rootScope.$on('windowResize', function(){
        $(element).children('.auto-resize-target').css('width', 'auto'); // reset size setting for current element
        var parent = $(element).parent();
        var parentWidth = preciseWidth(parent[0], 3) + 0.001;
        if(isNaN(parentWidth)) return;
        if(parent.css('padding-left')) parentWidth -= parseInt(parent.css('padding-left').substring(0, parent.css('padding-left').length - 2))
        if(parent.css('padding-right')) parentWidth -= parseInt(parent.css('padding-right').substring(0, parent.css('padding-right').length - 2))
        if(parent.css('border-left-width')) parentWidth -= parseInt(parent.css('border-left-width').substring(0, parent.css('border-left-width').length - 2))
        if(parent.css('border-right-width')) parentWidth -= parseInt(parent.css('border-right-width').substring(0, parent.css('border-right-width').length - 2))
        var siblingsWidthTotal = 0;
          $(element).siblings().each(function() {
          var bro = $(this)
          // console.log(bro, bro.css('position'))
          if((bro.css('float') == 'left' || bro.css('float') == 'right' || bro.css('display') == 'table-cell') && bro.css('position') != 'absolute') {
            var width = preciseWidth(bro[0], 3);
            // console.log('bro-width', width)
            // if(bro.css('padding-left')) width += parseInt(bro.css('padding-left').substring(0, bro.css('padding-left').length - 2))
            // if(bro.css('padding-right')) width += parseInt(bro.css('padding-right').substring(0, bro.css('padding-right').length - 2))
            // if(bro.css('border-left-width')) width += parseInt(bro.css('border-left-width').substring(0, bro.css('border-left-width').length - 2))
            // if(bro.css('border-right-width')) width += parseInt(bro.css('border-right-width').substring(0, bro.css('border-right-width').length - 2))
            // console.log('bro-width', width)
            siblingsWidthTotal += width;
          }
        });
        // console.log(parentWidth, siblingsWidthTotal, parentWidth - siblingsWidthTotal)
        // console.log($(element).width())
        var selfPadding = 0;
        if($(element).css('padding-left')) selfPadding += parseInt($(element).css('padding-left').substring(0, $(element).css('padding-left').length - 2))
        if($(element).css('padding-right')) selfPadding += parseInt($(element).css('padding-right').substring(0, $(element).css('padding-right').length - 2))
        // $(element).width(parentWidth - siblingsWidthTotal - selfPadding);
        $(element).children('.auto-resize-target').width(parentWidth - siblingsWidthTotal - selfPadding);
        // scope.$digest();
      });
    }
  }
}]);