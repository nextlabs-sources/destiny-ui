controlCenterConsoleApp.controller('autoSuggestionCtrl', ['$scope', '$element', '$attrs', '$compile', '$parse', '$q', '$timeout', '$document', '$window', '$rootScope', '$$debounce', '$uibPosition', 'uibTypeaheadParser',
  function(originalScope, element, attrs, $compile, $parse, $q, $timeout, $document, $window, $rootScope, $$debounce, $position, typeaheadParser) {
    var scope = originalScope.$new();
    scope.showPopup = false
    scope.suggestions = []
    scope.popupStyle = {}
    scope.highlightIndex = 0
    scope.suggestionOption = $parse(attrs.suggestionOption)(originalScope)
    var autoSuggestion = $parse(attrs.autoSuggestion)(originalScope)
      // scope.showSuggestionRegExp = $parse(attrs.showSuggestionRegExp)(originalScope)
    this.init = function() {
      if(!autoSuggestion) return
      var parsedModel = $parse(attrs.ngModel);
      var parsedModelSetter = parsedModel.assign
        // console.log(parsedModel)
      var regExp = new RegExp(attrs.showSuggestionRegExp ? attrs.showSuggestionRegExp : '.*$')
        // $(element).after(helper)
      var popUpEl = angular.element('<div auto-suggestion-popup></div>');
      popUpEl.attr({
        suggestions: 'suggestions',
        show: 'showPopup',
        'clicked-callback': 'updateExpressionClick',
        'cancel-timer': 'setPopupActive',
        'ng-style': 'popupStyle',
        'reset-index': 'resetIndex',
        'register-suggestion-getter': 'registerSuggestionGetter',
        'highlight-index': 'highlightIndex'
      }).addClass('helper');
      var $popup = $compile(popUpEl)(scope);
      $(element).after($popup)
      var lastPos = -1;
      var justApplied = false
      scope.updateExpression = function(replaceStr, backDelete, forthDelete, padSpace) {
        // console.log(replaceStr, backDelete, forthDelete, padSpace)
        var oldVal = parsedModel(originalScope) || ''
        var newVal = oldVal.substring(0, parseInt(element.prop("selectionStart")) - (backDelete || 0))
          // console.log(element.prop("selectionStart"))
          // console.log(element.prop("selectionEnd"))
        if (padSpace) {
          for (var index = 0; index < padSpace; index++) newVal += ' '
        }
        var remaining = oldVal.substring(parseInt(element.prop("selectionEnd")) + (forthDelete || 0))
          // console.log(oldVal, element.prop("selectionEnd"), forthDelete)
          // console.log(remaining)
        newVal += replaceStr + remaining
        var maxlength = $(element).prop('maxlength')
        if (maxlength > -1) newVal = newVal.substring(0, maxlength)
        parsedModelSetter(originalScope, newVal)
        $(element).focus()
      }
      scope.updateExpressionClick = function(replaceStr, backDelete, forthDelete, padSpace) {
        scope.updateExpression(replaceStr, backDelete, forthDelete, padSpace)
        justApplied = true
      }
      var applySuggestion = function(prefix, suffix) {
        elementOffset = $(element).offset()
        var parent = $(element).parent()
        while (parent.css('position') == 'static') parent = parent.parent()
        parentOffset = parent.offset()
        var helperStyle = $(element).is('textarea') ? $(element).textareaHelper('caretPos') : {};
          // console.log(helperStyle)
        helperStyle.top += elementOffset.top - parentOffset.top
        var lineHeight = $(element).css('line-height')
        if (lineHeight && lineHeight.length > 2) helperStyle.top += parseInt(lineHeight.substring(0, lineHeight.length - 2))
        helperStyle.left += elementOffset.left - parentOffset.left
        helperStyle.left = 0
        helperStyle.top = '100%'
          // console.log(helperStyle)
        scope.popupStyle = helperStyle;
        scope.suggestions = []
        if (regExp.test(prefix)) {
          scope.suggestionOption.showSuggestions(prefix, suffix).then(function(anticipation) {
            // if (anticipation.length) {
            scope.showPopup = anticipation.length && $(element).is(':focus');
            scope.suggestions = anticipation;
            scope.highlightIndex = 0
              // }
          })
        }
      }
      var popupActive = false
      $(element).focus(function() {
          $(document).keyup(keyUp);
          // console.log('++++ keyUp bound')
          popupActive = false
            // $(element).val($(element).val())
          lastPos = $(element).val().length
          element.prop("selectionStart", $(element).val().length)
          scope.cancelTimer()
          applySuggestion($(element).val())
        })
        // $(element).select(function() {
        //   popupActive = false
        //     // $(element).val($(element).val())
        //   scope.cancelTimer()
        //   lastPos = $(element)[0].selectionStart
        //   applySuggestion($(element).val().substring(0, lastPos), $(element).val().substring($(element)[0].selectionEnd))
        // })
      var hidingTimer = null;
      $(element).blur(function() {
        $(document).unbind('keyup', keyUp);
        // console.log('---- keyUp unbound')
        if (!popupActive) hidingTimer = $timeout(function() {
          // console.log($popup.find('*:focus').length)
          // console.log($( document.activeElement ))
          scope.showPopup = false;
        }, 100)
      })
      scope.setPopupActive = function() {
        popupActive = true
      }
      scope.cancelTimer = function() {
        clearTimeout(hidingTimer)
      }
      var suggestionGetter = null;
      scope.registerSuggestionGetter = function(func) {
        suggestionGetter = func
      }
      $(element).keypress(function(e) {
        if (e.key == ' ' && e.ctrlKey && !e.altKey && !e.shiftKey) {
          applySuggestion($(element).val(), $(element).val().substring(lastPos))
            // if(helper.filter(":visible").length) helper.find("li:first").focus()
        } else {
          switch (e.key) {
            case "Enter":
              if (!scope.showPopup) break;
              var suggestion = suggestionGetter()
              if (suggestion) {
                $(element).blur()
                scope.updateExpression(suggestion.value, suggestion.backDelete, suggestion.forthDelete, suggestion.padSpace)
                e.preventDefault()
              }
              break;
            default:
              // console.log(e.key)
              break
          }
        }
      })
      $(element).keydown(function(e) {
        switch (e.key) {
          case "Enter":
            if (!scope.showPopup) break;
            var suggestion = suggestionGetter()
            if (suggestion) {
              $(element).blur()
              scope.updateExpression(suggestion.value, suggestion.backDelete, suggestion.forthDelete, suggestion.padSpace)
              e.preventDefault()
            }
            break;
          case "ArrowUp":
          case "ArrowDown":
            if (scope.showPopup) e.preventDefault()
            break;
          default:
            // console.log(e.key)
            break
        }
      })

      function onClick() {
        // console.log($(element)[0].selectionStart)
        if (lastPos != $(element)[0].selectionStart) {
          lastPos = $(element)[0].selectionStart
          applySuggestion($(element).val().substring(0, lastPos), $(element).val().substring(lastPos))
        }
      }
      var keyUp = function(e) {
        switch (e.key) {
          case 'Escape':
            scope.showPopup = false;
            scope.$apply()
            break;
          case "ArrowUp":
            // console.log(e.key, $(element)[0].selectionEnd, $(element)[0].selectionStart)
            e.preventDefault()
            e.stopPropagation()
            scope.showPopup && scope.highlightIndex--
              scope.$apply()
            break;
          case "ArrowDown":
            // console.log(e.key, $(element)[0].selectionEnd, $(element)[0].selectionStart)
            e.preventDefault()
            scope.showPopup && scope.highlightIndex++
              scope.$apply()
            break;
          case "ArrowLeft":
          case "ArrowRight":
          case "Home":
          case "End":
          case "PageUp":
          case "PageDown":
            onClick();
            scope.$apply()
            break;
        }
      }
      scope.resetIndex = function(index) {
        scope.highlightIndex = index
      }
      $(element).click(onClick)
        //model setter executed upon match selection
      scope.$watch(parsedModel, function(newVal, oldVal) {
        // console.log(newVal)
        if (newVal == oldVal) return $(element).change()
          // console.log(newVal, oldVal, element.prop("selectionStart"))
        if (justApplied) return (justApplied = false)
        lastPos = $(element)[0].selectionStart
        applySuggestion($(element).val())
        $(element).change()
      })
    }
  }
])
controlCenterConsoleApp.directive('autoSuggestion', ['$rootScope', '$window', '$compile', function($rootScope, $window, $compile) {
  return {
    // require: ['ngModel', 'suggestionOption'],
    controller: 'autoSuggestionCtrl',
    link: function(originalScope, element, attrs, ctrls) {
      // return;
      var controller = angular.isArray(ctrls) ? ctrls[0] : ctrls;
      controller.init(element, attrs)
    }
  }
}]);
controlCenterConsoleApp.directive('autoSuggestionPopup', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
  return {
    scope: {
      suggestions: '=',
      clickedCallback: '=',
      cancelTimer: '=',
      resetIndex: '=',
      highlightIndex: '=',
      registerSuggestionGetter: '=',
      show: '='
    },
    replace: true,
    templateUrl: 'ui/app/partials/auto-suggestion-popup.html',
    link: function(scope, element, attrs) {
      // scope.test = true;
      scope.highlightIndex = 0;
      var maxIndex = 0
      scope.$watch(function() {
        return scope.highlightIndex
      }, function(newVal, oldVal) {
        // console.log(newVal)
        // if (newVal == oldVal) return
        if (newVal > maxIndex) {
          scope.resetIndex(maxIndex)
          return
        }
        if (newVal < 0) {
          scope.resetIndex(0)
          return
        }
        $timeout(function() {
          var highlightedSuggestion = $(element).find('.highlight')
          if(!highlightedSuggestion.length) {
            return
          }
          var scrollTop = $(element).scrollTop();
          // console.log(highlightedSuggestion.offset().top, $(element).offset().top, scrollTop)
          $(element).animate({
            scrollTop: highlightedSuggestion.offset().top - $(element).offset().top + scrollTop - 140
          }, 100)
        }, 100)
      })
      scope.$watch(function() {
        return scope.suggestions
      }, function(newVal, oldVal) {
        if (!newVal) return
        var index = 0
        angular.forEach(newVal, function(suggestionGrp) {
          angular.forEach(suggestionGrp.suggestions, function(suggestion) {
            maxIndex = index++
              suggestion.globalIndex = maxIndex
          })
        })
      }, true)
      scope.$watch(function() {
        return scope.show
      }, function(newVal, oldVal) {
        // if (!newVal) return
        $(element).animate({
          scrollTop: 0
        }, 100)
      }, true)
      scope.registerSuggestionGetter(function() {
        var highlightedSuggestion = null
        angular.forEach(scope.suggestions, function(suggestionGrp) {
          angular.forEach(suggestionGrp.suggestions, function(suggestion) {
            if (suggestion.globalIndex == scope.highlightIndex) highlightedSuggestion = suggestion
          })
        })
        return highlightedSuggestion
      })
      scope.click = function(suggestion) {
        scope.show = false
        scope.clickedCallback(suggestion.value, suggestion.backDelete, suggestion.forthDelete, suggestion.padSpace)
      }
    }
  }
}]);