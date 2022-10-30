/*
  This is a shared service for app level config settings
*/
controlCenterConsoleApp.factory('apiAssembleService', [function() {
  var createSingleStringField = function(name, value) {
    return {
      "field": name,
      "type": "SINGLE",
      "value": {
        "type": "String",
        "value": String(value)
      }
    }
  }
  var createSingleStringExactMatchField = function(name, value) {
    return {
      "field": name,
      "type": "SINGLE_EXACT_MATCH",
      "value": {
        "type": "String",
        "value": String(value)
      }
    }
  }
  var createSingleDateField = function(name, value) {
    return {
      "field": name,
      "type": "SINGLE",
      "value": {
        "type": "Date",
        "value": String(value)
      }
    }
  }
  var createSingleDateRangeField = function(name, from, to, dateOption) {
    if (angular.isDate(from))
      from = from.getTime();
    if (angular.isDate(to))
      to = to.getTime();
    return {
      "field": name,
      "type": "DATE",
      "value": {
        "type": "Date",
        "dateOption": dateOption,
        "fromDate": from,
        "toDate": to
      }
    }
  }
  var createSingleTextField = function(fields, value) {
    var temp = fields;
    if (!angular.isArray(fields))
      temp = [fields]
    return {
      "field": "text",
      "type": "TEXT",
      "value": {
        "type": "Text",
        "fields": temp,
        "value": value
      }
    }

  }
  var createMultiStringField = function(name, value) {
    return {
      "field": name,
      "type": "MULTI",
      "value": {
        "type": "String",
        "value": value
      }
    }
  }
  var createMultiStringExactMatchField = function(name, value) {
    return {
      "field": name,
      "type": "MULTI_EXACT_MATCH",
      "value": {
        "type": "String",
        "value": value
      }
    }
  }
  var createMultiNestedStringField = function(name, nestedFieldName, value) {
    return {
      "field": name,
      "nestedField": nestedFieldName,
      "type": "NESTED_MULTI",
      "value": {
        "type": "String",
        "value": value
      }
    }
  }
  var getFromAndToDate = function(name) {
    var ret = [];
    var now = new Date();
    switch (name) {
      case 'PAST_7_DAYS':
        now.setDate(now.getDate() - 7);
        break;
      case 'PAST_30_DAYS':
        now.setDate(now.getDate() - 30);
        break;
      case 'PAST_3_MONTHS':
        now.setMonth(now.getMonth() - 3);
        break;
      case 'PAST_6_MONTHS':
        now.setMonth(now.getMonth() - 6);
        break;
      case 'PAST_1_YEAR':
        now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new TypeError()
    }
    ret.push(now);
    ret.push(new Date());
    return ret;
  }
  var componentTypeToGroup = {
    "Resource": "RESOURCE",
    "Action": "ACTION",
    "Subject": "SUBJECT"
  };
  var getGroupForComponent = function(type) {
    return componentTypeToGroup[type];
  };
  return {
    createSingleStringField: createSingleStringField,
    createSingleStringExactMatchField: createSingleStringExactMatchField,
    createSingleDateField: createSingleDateField,
    createSingleDateRangeField: createSingleDateRangeField,
    createMultiStringField: createMultiStringField,
    createMultiStringExactMatchField: createMultiStringExactMatchField,
    createMultiNestedStringField: createMultiNestedStringField,
    createSingleTextField: createSingleTextField,
    getFromAndToDate: getFromAndToDate,
    getGroupForComponent: getGroupForComponent
  }
}]);