controlCenterConsoleApp.directive("folderView", ['$rootScope', '$window', '$filter', "loggerService", "$timeout", 'autoCloseOptionService', '$filter', 
  function($rootScope, $window, $filter, loggerService, $timeout, autoCloseOptionService , $filter) {
    var hiddenField = "selected";
    var stayIdleTimer = 500;
    angular.element($window).bind('resize', function() {
      $rootScope.$broadcast('windowResize');
    });
    return {
      restrict: "AE",
      replace: !0,
      transclude: !0,
      templateUrl: 'ui/app/partials/folder-view.html',
      scope: {
        dataSetSaveTo: '=',
        dataSetSaveToOnChange: '=',
        dataSet: '<',
        dataSetFilter: '=',
        itemLabel: '@',
        itemSubLabel: '@',
        itemSubLabelArray: '=',
        autoResizeWidth: '@',
        itemKeyField: '@',
        refreshOnfocus: '=',
        required: '=',
        placeholder: '@',
        inputMax: '@',
        applyBtnLabel: '@',
        staticDataSet: '=',
        onfocus: '@',
        showDetail: '&',
        __itemFilterValueModel: '<',
        filters: '<',
        initSelectedFilters: '@',
        showSelectAll: "@",
        itemErrorField: '@',
        folderViewId: "@"
      },
      link: function(scope, element, attrs) {
        scope.__itemFilterValueModel = "";
        scope.dataSet = scope.dataSet || [];
        scope.filters = scope.filters || [];
        scope.filterSelection = scope.initSelectedFilters ? scope.$eval(scope.initSelectedFilters) : scope.filters.map(function (filter) {
          return filter.key;
        });
        scope.optionSelection = { all: false };
        scope.listItemLabel = function(item) {
          return eval('item.' + scope.itemLabel)
        }
        scope.listItemSubLabel = function(item) {
          var labels = [];
          if(scope.itemSubLabelArray){
            angular.forEach(scope.itemSubLabelArray, function(label) {
              if(item[label]) {
                labels.push(eval('item.' + label).toLowerCase().replace("_", " "));
              }
            });
            return labels.join(", ");
          }
          return eval('item.' + scope.itemSubLabel)
        }
  
        if(scope.showDetail) {
          scope.callShowDetail = function(item) {
            scope.showDetail()(item)
          }
        }

        scope.dataSetAttrFilter = function(data) {
          return true;
        }
  
        scope.toggleSelectAll = function () {
          scope.optionSelection.all = false;
        };
  
        scope.selectAllOptions = function () {
          var stack = [];
          angular.forEach(scope.dataSet, function (rootFolder) {
            stack.push(rootFolder);
            while (stack.length !== 0) {
              var folder = stack.pop();
              folder[hiddenField] = !scope.optionSelection.all;
              if (folder.children.length > 0) {
                for (var i = folder.children.length - 1; i >= 0; i--) {
                  stack.push(folder.children[i]);
                }
              } 
            }
          });
        };

        scope.toggleSelectSubFolders = function(folder) {
          if(folder.selected && !folder.disabled) {
            folder.disabled = !folder.disabled;
          } else {
            folder.selected = !folder.selected;
            folder.disabled = !folder.disabled;
          }
          if(!folder.disabled && folder.folderPath.indexOf('/**') > -1) {
            folder.folderPath = folder.folderPath.substring(0, folder.folderPath.length - 3);
          } else if(folder.disabled) {
            folder.folderPath += "/**";
          }
          if(folder.disabled) {
            deselectSubfolders(folder);
          }
        }

        function deselectSubfolders(parentFolder) {
          var stack = [];
          angular.forEach(parentFolder.children, function (rootFolder) {
            stack.push(rootFolder);
            while (stack.length !== 0) {
              var folder = stack.pop();
              if (folder.children.length === 0) {
                visitSubFolderNode(folder);
              } else {
                visitSubFolderNode(folder);
                for (var i = folder.children.length - 1; i >= 0; i--) {
                  stack.push(folder.children[i]);
                }
              }
            }
          });
        }

        function visitSubFolderNode(node) {
          node[hiddenField] = false;
          node.includeSubFolders = false;
          node.disabled = false;
          if (node.folderPath.indexOf('/**') > -1) {
            node.folderPath = node.folderPath.substring(0, node.folderPath.length - 3);
          }
        }
  
        scope.noInputTimeout = false;
        !scope.dataSet && (scope.dataSet = []);

        var root = element;
        scope.clearSelection = function() {
          angular.forEach(scope.dataSet, function(item) {
            item[hiddenField] = false;
          });
        }

        var noInputTimer = null;
        scope.setNoInputTimer = function() {
          loggerService.getLogger().log('setNoInputTimer')
          if(scope.__itemFilterValueModel && scope.__itemFilterValueModel.length) return;
          noInputTimer = $timeout(function() {
            if(!scope.__itemFilterValueModel) {
              scope.__itemFilterValueModel = '';
            }
            scope.nameChanged();
            scope.noInputTimeout = true;
          }, stayIdleTimer);
        }
        scope.clearNoInputTimer = function() {
          $timeout.cancel(noInputTimer);
        }
        scope.deleteItem = function(item, $event, index){
          item[hiddenField] = false;
          convertTreeToList(true, item);
          $event.stopPropagation();
          autoCloseOptionService.closeOption();
        }
        scope.deselectItem = function(index) {
          var deleted = scope.dataSetSaveTo.splice(index, 1);
          scope.toggleSelectAll();
          $timeout(function() {
            $rootScope.$broadcast('windowResize');
          }, 10)
        };

        scope.inputClicked = function () {
          if ($(root).hasClass('open')) {
            return
          };
          if (scope.__itemFilterValueModel || scope.noInputTimeout) {
            $timeout(function () {
              (scope.__itemFilterValueModel || scope.noInputTimeout) && !$(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
            }, 50);
          }
        }

        scope.mapSelectedFolders = function() {
          var stack = [];
          angular.forEach(scope.dataSet, function (rootFolder) {
            stack.push(rootFolder);
            while (stack.length !== 0) {
              var folder = stack.pop();
              if (folder.children.length === 0) {
                visitFolder(folder);
              } else {
                visitFolder(folder);
                for (var i = folder.children.length - 1; i >= 0; i--) {
                  stack.push(folder.children[i]);
                }
              }
            }
          });
        }

        function visitFolder(folder) {
          angular.forEach(scope.dataSetSaveTo, function (selectedfolder) {
            if (folder.id === selectedfolder.id) {
              folder[hiddenField] = true;
              folder.includeSubFolders = selectedfolder.includeSubFolders;
              folder.disabled = selectedfolder.includeSubFolders;
            }
          });
        }

        scope.applyBtnClicked = function() {
            scope.dataSetSaveTo = [];
            convertTreeToList(false, null);
            $timeout(function() {
              $rootScope.$broadcast('windowResize');
              $(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
            }, 10);
        }

        scope.notselected = function() {
          return function(item) {
            var selected = false;
            var filter = {};
            filter[scope.itemKeyField] = item[scope.itemKeyField];
            return $filter('filter')(scope.dataSetSaveTo, filter).length == 0;
          };
        };
  
        scope.nameChanged = function() {
          $timeout.cancel(noInputTimer);
          scope.mapSelectedFolders();
          if (!$(root).hasClass('open')) $timeout(function() {
            !$(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
          }, 500);
        }
  
  
        scope.refreshOptions = function(){
          if(scope.refreshOnfocus){
            scope.nameChanged();
          }
          scope.mapSelectedFolders();
        }
  
        scope.isErrorItem = function (item) {
          return scope.itemErrorField && item[scope.itemErrorField];
        };

        function convertTreeToList(deselectFlag, item) {
          var stack = [];
          angular.forEach(scope.dataSet, function (rootFolder) {
            stack.push(rootFolder);
            while (stack.length !== 0) {
              var folder = stack.pop();
              if (folder.children.length === 0) {
                visitFolderNode(folder, deselectFlag, item);
              } else {
                visitFolderNode(folder, deselectFlag, item);
                for (var i = folder.children.length - 1; i >= 0; i--) {
                  stack.push(folder.children[i]);
                }
              }
            }
          });
        }

        function visitFolderNode(node, deselectFlag, item) {
          if (deselectFlag) {
            if (node.id === item.id) {
              node[hiddenField] = false;
              node.includeSubFolders = false;
              node.disabled = false;
              if (node.folderPath.indexOf('/**') > -1) {
                node.folderPath = node.folderPath.substring(0, node.folderPath.length - 3);
              }
            }
          } else {
            if (!node.disabled && node.folderPath.indexOf('/**') > -1) {
              node.folderPath = node.folderPath.substring(0, node.folderPath.length - 3);
            } else if (node.disabled && !(node.folderPath.indexOf('/**') > -1)) {
              node.folderPath = node.folderPath + "/**";
            }
            node[hiddenField] && scope.dataSetSaveTo.push(node);
          }
        }
      }
    };
  }]);