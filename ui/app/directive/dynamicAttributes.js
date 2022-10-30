// controlCenterConsoleApp.directive('uiSrefIf', function($compile) {
//   return {
//     scope: {
//       val: '@uiSrefVal',
//       if: '=uiSrefIf'
//     },
//     link: function($scope, $element, $attrs) {
//       $element.removeAttr('ui-sref-if');
//       $compile($element)($scope);
      
//       $scope.$watch('if', function(bool) {
//         if (bool) {
//           $element.attr('ui-sref', $scope.val);
//         } else {
//           $element.removeAttr('ui-sref');
//           $element.removeAttr('href');
//         }
//         $compile($element)($scope);
//       });
//     }
//   };
// });

controlCenterConsoleApp.directive('dynAttr', ['$compile', '$timeout', function($compile, $timeout) {
    return {
        scope: { 
            list: '=dynAttr',
            delAttr: '=dynAttrDel',
            unbind: '=dynAttrUnbind',
            dynAttrDelUnbindIf: '&'
        },
        replace:true,
        link: function(scope, elem, attrs){
            // console.log(elem);
            // console.log(scope.list);
            if(scope.list){
                for(index in scope.list.attr){
                    elem.attr(scope.list.attr[index].name, scope.list.attr[index].value);   
                }
                scope.list.style && angular.forEach(scope.list.style, function(val, key) {
                    elem.css(key, val);
                })
            }
            if(scope.dynAttrDelUnbindIf && scope.dynAttrDelUnbindIf() && scope.delAttr) {
                for(index in scope.delAttr){
                    elem.removeAttr(scope.delAttr[index]);   
                }
            }
            if(scope.dynAttrDelUnbindIf && scope.dynAttrDelUnbindIf() && scope.unbind) {
                for(index in scope.unbind){
                    elem.off(scope.unbind[index]);   
                }
            }
            elem.removeAttr('dyn-attr');
            elem.removeAttr('dyn-attr-del-unbind-if');
            elem.removeAttr('dyn-attr-del');
            elem.removeAttr('dyn-attr-unbind');
            // console.log(elem.html());   
            // $timeout(function(){
                // $compile(elem)(scope);        
            // },10)
            // scope.$digest();
        }
    };
}]);