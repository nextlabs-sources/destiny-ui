controlCenterConsoleApp.directive("multiInput", function () {
  return {
    scope: {
      value: "=",
      type: "@",
      readOnly: "=",
      inputName: "@",
      suggestionOption: "="
    },
    link: function link(scope, element, attrs) {
      scope.showIcons = false;
      scope.multiInputValues = [];
      scope.touched = false;
      if (scope.value) {
        try {
          scope.multiInputValues = JSON.parse(scope.value);
        } catch (e) {
          scope.multiInputValues = [scope.value];
          scope.value = JSON.stringify(scope.multiInputValues);
        }
      }
      scope.addValue = function (inputValue) {
        if (inputValue) {
          if (inputValue.newVal) {
            scope.multiInputValues.push(inputValue.newVal);
            scope.setValue(scope.multiInputValues);
            scope.showIcons = false;
            inputValue.newVal = "";
          }
        }
        scope.touched = true;
      };
      scope.removeValue = function (index) {
        scope.multiInputValues.splice(index, 1);
        scope.setValue(scope.multiInputValues);
        scope.touched = true;
      };
      scope.handleKeyPress = function (event, inputValue) {
        switch (event.keyCode) {
          case 13:
          case 9:
            event.stopPropagation();
            scope.addValue(inputValue);
            break;
          default:
            $(event.target).focus();
            break;
        }
      };
      scope.setIconsFlag = function (value) {
        scope.showIcons = true;
      };
      scope.setValue = function (inputValues) {
        scope.value = JSON.stringify(inputValues);
      };
    },
    templateUrl: "ui/app/partials/multi-input.html"
  };
});

controlCenterConsoleApp.filter("jsonToText", function () {
  return function (value) {
    try {
      var values = JSON.parse(value);
      return "[" + values.join(", ") + "]";
    } catch (e) {

    }
    return value;
  }
});