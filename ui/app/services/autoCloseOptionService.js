/*
  This service enables option auto close when web page is clicked
*/
controlCenterConsoleApp.factory('autoCloseOptionService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;
  var closeFunction = null;
  
  var registerOpen = function(targetScope, targetCloseFunction) {
    if (!openScope) {
      setTimeout(function(){
        $document.on('click', closeOption);
      }, 5);
    }
    openScope = targetScope;
    closeFunction = targetCloseFunction;
  };
  var close = function(){
    openScope = null;
    $document.off('click', closeOption);
  };
  var closeOption = function() {
    if (!openScope) { return; }
    closeFunction();
    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
    openScope = null;
    $document.off('click', closeOption);
  };
  
  return {
    registerOpen: registerOpen,
    closeOption: closeOption,
    close: close
  }
}]);