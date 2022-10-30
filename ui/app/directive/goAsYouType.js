// var index = 3;
controlCenterConsoleApp.directive("goAsYouType", ['$rootScope', '$window', '$filter', "networkService", "configService", "$compile", "loggerService", "$timeout", 'autoCloseOptionService', '$filter', function($rootScope, $window, $filter, networkService, configService, $compile, loggerService, $timeout, autoCloseOptionService , $filter) {
  var newItemInline = false;
  var hiddenField = "$selected";
  // var stayIdleTimer = configService.configObject['goAsYouType.stayIdleTimer'];
  var stayIdleTimer = 500; // goAsYouType.stayIdleTimer
  // newItemInline = false;
  angular.element($window).bind('resize', function() {
    // $emit('windowResize')
    $rootScope.$broadcast('windowResize');
  });
  return {
    restrict: "AE",
    replace: !0,
    transclude: !0,
    templateUrl: 'ui/app/partials/go-as-you-type.html',
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
      getLatestOptions: '&',
      refreshOnfocus: '=',
      retrieveUrl: '@',
      retrieveUrlSuffix: '@',
      required: '=',
      placeholder: '@',
      inputMax: '@',
      applyBtnLabel: '@',
      addNewBtnLabel: '@',
      // checkAndGo: '@',
      newitemFunction: '&',
      createNew: '=',
      staticDataSet: '=',
      ngDisabledCc: '=',
      onfocus: '@',
      charListNotAllowed: '=',
      showDetail: '&',
      __itemFilterValueModel: '<',
      filters: '<',
      initSelectedFilters: '@',
      showSelectAll: "@",
      itemErrorField: '@',
      goAsYouTypeId: "@",
      enableLookup: "@",
      enableFolderView: '@'
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
        // loggerService.getLogger().log('item.' + scope.itemLabel)
        return eval('item.' + scope.itemLabel)
      }
      scope.existInDataSetSavedTo = function(item) {
        for (var savedItem of scope.dataSetSaveTo) {
          if (savedItem.id === item.id) {
            return true;
          }
        }
        return false;
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
      // loggerService.getLogger().log(scope, element, attrs);
      // declare local __itemFilterValueModel variable instead of using parent's, otherwise would be error if there are more than 1 directive
      var charListNotAllowedRE = null;
      scope.dataSetAttrFilter = function(data) {
        return true;
      }

      scope.selectAllOptions = function (eventParameter) {
        angular.forEach(scope.dataSet, function (item) {
          item.$selected = eventParameter.target.checked;
        });
      };

      scope.toggleSelectAll = function (eventParameter, keyFieldValue) {
        scope.optionSelection.all = eventParameter.target.checked && scope.dataSet.every(function (option) {
          return option[scope.itemKeyField] == keyFieldValue || !(scope.notselected()(option) && (!scope.dataSetFilter || scope.dataSetFilter()(option))) || option.$selected;
        });
      };

      // loggerService.getLogger().log('charListNotAllowedRE:', charListNotAllowedRE)
      if (scope.charListNotAllowed && angular.isArray(scope.charListNotAllowed) && scope.charListNotAllowed.length) {
        var reLiteral = '[' + scope.charListNotAllowed.map(function(item) {
          switch (item) {
            case '\\':
            case '^':
            case '-':
            case '*':
            case '.':
            case '{':
            case '}':
            case '|':
              return '\\' + item;
              break;
            default:
              return item;
          }
        }).join('') + ']';
        charListNotAllowedRE = new RegExp(reLiteral, 'g');
        var specialAttrItemRE = new RegExp(reLiteral + '+');
        scope.dataSetAttrFilter = function(data) {
          return !specialAttrItemRE.test(data[scope.itemLabel]);
        }
      }
      scope.newItemChecked = {checked:false};
      scope.noInputTimeout = false;
      !scope.dataSet && (scope.dataSet = []);
      //scope.__itemFilterValueModel = null;
      scope.perfectMatchedFirst = function(item) {
        return scope.__itemFilterValueModel && scope.__itemFilterValueModel.length && scope.__itemFilterValueModel.toLowerCase() == item[scope.itemLabel] ? 0 : item[scope.itemLabel].toLowerCase();
      }
      var root = element;
      scope.clearSelection = function() {
        scope.newItemChecked.checked = false;
        angular.forEach(scope.dataSet, function(item) {
          item[hiddenField] = false;
        });
      }
      var noInputTimer = null;
      scope.setNoInputTimer = function() {
        loggerService.getLogger().log('setNoInputTimer')
        if(scope.__itemFilterValueModel && scope.__itemFilterValueModel.length) return;
        noInputTimer = $timeout(function() {
          // scope.$apply();
          if(!scope.__itemFilterValueModel) {
            scope.__itemFilterValueModel = '';
            // !scope.noInputTimeout && fetchLatestOptions();
            // $('#go-as-you-type-toggle-btn-' + scope.$id).click();
          }
          scope.nameChanged();
          scope.noInputTimeout = true;
        }, stayIdleTimer);
      }
      scope.clearNoInputTimer = function() {
        $timeout.cancel(noInputTimer);
      }
      scope.noMatchedTag = function(){
        var noMatched = true;
        angular.forEach(scope.dataSet, function(option){
          if(option[scope.itemLabel].toLowerCase() == scope.__itemFilterValueModel.toLowerCase())
            noMatched = false;
        })
        return noMatched;
      }
      scope.deleteItem = function(item, $event){
        item.deleted = true;
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
      scope.inputClicked = function() {
        if ($(root).hasClass('open')) return;
        if (scope.__itemFilterValueModel || scope.noInputTimeout) $timeout(function() {
          (scope.__itemFilterValueModel || scope.noInputTimeout) && !$(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
        }, 50);
      }
      scope.addNewBtnClicked = function(callback) {
        // loggerService.getLogger().log(scope.newitemFunction)
/*        if (scope.newitemFunction.indexOf('(') == -1) scope.$parent[scope.newitemFunction](scope.__itemFilterValueModel, callback);
        else {
          var toCall = scope.newitemFunction.replace('__value', "'" + scope.__itemFilterValueModel + "'");
          eval("scope.$parent." + toCall);
        }*/
        scope.newitemFunction()(scope.__itemFilterValueModel, callback)
        // scope.__itemFilterValueModel = null;
        // loggerService.getLogger().log(scope);
      };
      scope.applyBtnClicked = function() {
        // loggerService.getLogger().log(attrs.dataSetSaveTo);
        // loggerService.getLogger().log(scope.newItemChecked);
        var applyBtnCallback = function(newItem){
          // $(root).find('input:checkbox:checked').each(function(index, ele) {
          //   // loggerService.getLogger().log($(ele).val());
          //   angular.forEach(scope.dataSet, function(item) {
          //     if (item[scope.itemKeyField] == $(ele).val()) //getField(scope.$parent, attrs.dataSetSaveTo).push(item);
          //       scope.dataSetSaveTo.push(item);
          //   });
          // });
          if (newItem) {
            newItem[hiddenField] = true;
            if (scope.dataSet.filter(function (item) { return item[scope.itemKeyField] == newItem[scope.itemKeyField]; }).length == 0) {
              scope.dataSet.push(newItem);
            }
          }
          angular.forEach($filter('filter')(scope.dataSet, scope.notselected()), function(item) {
            item[hiddenField] && scope.dataSetSaveTo.push(item);
          })
          // loggerService.getLogger().log($filter('filter')($filter('filter')(scope.dataSet, scope.notselected), {hiddenField:true}));
          scope.__itemFilterValueModel = '';
          scope.nameChanged()
          updateHiddenField();
          $timeout(function() {
            $rootScope.$broadcast('windowResize');
            $(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
          }, 10)
        };
        if(scope.newItemChecked.checked) scope.addNewBtnClicked(applyBtnCallback);
        else applyBtnCallback();
        // loggerService.getLogger().log(scope.$parent[attrs.dataSetSaveTo]);
        // loggerService.getLogger().log('applyBtnClicked');
      }
      scope.notselected = function() {
        return function(item) {
          var selected = false;
          var filter = {};
          filter[scope.itemKeyField] = item[scope.itemKeyField];
          return $filter('filter')(scope.dataSetSaveTo, filter).length == 0;
        };
      };

      var fetchLatestOptions = function() {
        scope.optionSelection.all = false;
        scope.getLatestOptions()(scope.__itemFilterValueModel, scope.filterSelection, function (resp) {
          scope.dataSet = resp.data ? resp.data : [];
          scope.noInputTimeout = true;
        })
        // // var noInputButOpen = (scope.__itemFilterValueModel == '' || scope.__itemFilterValueModel == null) && $(root).hasClass('open');
        // // var inputButClosed = scope.__itemFilterValueModel != '' && scope.__itemFilterValueModel != null && !$(root).hasClass('open');
        // // loggerService.getLogger().log('noInputButOpen:', noInputButOpen);
        // // loggerService.getLogger().log('inputButClosed:', inputButClosed);
        // var urlBase = scope.retrieveUrl;
        // // loggerService.getLogger().log('scope.__itemFilterValueModel is', scope.__itemFilterValueModel);
        // if (scope.retrieveUrl.toLowerCase().indexOf('http://') != 0 && scope.retrieveUrl.toLowerCase().indexOf('https://') != 0) urlBase = configService.getUrl(scope.retrieveUrl);
        // scope.dataSet = [];
        // networkService.get(urlBase + (urlBase.charAt(urlBase.length - 1) == '/' ? '' : '/') + (scope.__itemFilterValueModel ? encodeURIComponent(scope.__itemFilterValueModel) : '') + 
        //   (scope.retrieveUrlSuffix ? scope.retrieveUrlSuffix : ''), function(data) {
        //   // loggerService.getLogger().log(scope.$parent[attrs.dataSet]);
        //   scope.dataSet = data.data ? data.data : [];
        //   // loggerService.getLogger().log(scope.$parent[attrs.dataSet]);
        //   // loggerService.getLogger().log($('#go-as-you-type-toggle-btn-' + scope.$id));
        // }, {
        //   forceCallback: true
        // });
      }

      scope.nameChanged = function() {
        $timeout.cancel(noInputTimer);
        // loggerService.getLogger().log('charListNotAllowedRE && charListNotAllowedRE.test(scope.__itemFilterValueModel)', charListNotAllowedRE && charListNotAllowedRE.test(scope.__itemFilterValueModel))
        if(charListNotAllowedRE && charListNotAllowedRE.test(scope.__itemFilterValueModel)) {
          // loggerService.getLogger().log('not allowed chars found in', scope.__itemFilterValueModel)
          var valCharsNotAllowedRemoved = scope.__itemFilterValueModel.replace(charListNotAllowedRE, '');
          // loggerService.getLogger().log('not allowed chars removed', valCharsNotAllowedRemoved)
         // valCharsNotAllowedRemoved = valCharsNotAllowedRemoved.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
          // loggerService.getLogger().log('scope.$parent.' + scope.ngModelName + '="' + valCharsNotAllowedRemoved + '"');
          // eval('scope.$parent.' + scope.ngModelName + '="' + valCharsNotAllowedRemoved + '"');
          scope.__itemFilterValueModel = scope.__itemFilterValueModel = valCharsNotAllowedRemoved;
        }
        scope.clearSelection();
        // scope.noInputTimeout = false;
        if (!$(root).hasClass('open')) $timeout(function() {
          !$(root).hasClass('open') && $('#go-as-you-type-toggle-btn-' + scope.$id).click();
        }, 500);
        !scope.staticDataSet && fetchLatestOptions();
      }


      scope.refreshOptions = function(){
        if(scope.refreshOnfocus){
          scope.nameChanged();
        }
      }

      function updateHiddenField() {
        // uncheck
        angular.forEach(scope.dataSet, function(item) {
          // loggerService.getLogger().log(item);
          //if (item[scope.itemKeyField] == deleted[0][scope.itemKeyField]) item[attrs.hiddenField] = false;
          var found = false;
          angular.forEach(scope.dataSetSaveTo,function(value){
            if (item[scope.itemKeyField] == value[scope.itemKeyField]){
              found = true;
            }
          })

          if(!found) item[attrs.hiddenField] = false;
        });
        // call onchange handler if defined
        scope.dataSetSaveToOnChange && scope.dataSetSaveToOnChange();
      }

      scope.labelFilter = function(item) {
        var standard = {}
        standard[scope.itemLabel] = scope.__itemFilterValueModel;
        return $filter('filter')([item], standard).length
      }

      scope.toggleFilterSelection = function (key) {
        var i = scope.filterSelection.indexOf(key);
        if (i > -1) {
          scope.filterSelection.splice(i, 1);
        } else {
          scope.filterSelection.push(key);
        }
        scope.newItemChecked = { checked: false };
        fetchLatestOptions();
      };

      scope.isErrorItem = function (item) {
        return scope.itemErrorField && item[scope.itemErrorField];
      };

      scope.lookup = function() {
        fetchLatestOptions();
      }
    }
  };
}]);