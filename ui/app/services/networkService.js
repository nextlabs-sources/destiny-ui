/*
  This is a shared service is a gateway for network calls (ajax)
*/
controlCenterConsoleApp.factory('networkService', ['$http', 'dialogService', '$filter', '$window', function($http, dialogService, $filter, $window) {
  var successHandler = function(response, callback, option) {
    if (!response.data) {
      dialogService.notify({
        msg: $filter('translate')('PS.ERROR.MSG.500')
      });
    } else {
      switch (response.data.statusCode) {
        // case '5000':
        case '4004':
        case '6001':
        case '6002':
        case '6003':
        case '6005':
        case '6006':
        case '6007':
        case '6015':
        case '6022':
          if (option && option.forceCallback && callback) {
            callback(response.data);
          } else {
            dialogService.notify({
              msg: response.data.message
            });
          }
          break;
        case '6012': // contains reserved keyword
        case '6016': // policy evaluation error
        case '6017': // invalid export format
        case '6018': // invalid import format
        case '6019': // invalid digital signature
        case '6020': // invalid signature key alias
        case '6021': // Shared key does not match
        case '6024': // disallow to manage administrator account
        case '6026': // Keytool execution error
        case '6027': // User source configuration error
        case '6028': // PDP plugin configuration name duplicated
        case '6029': // Unsupported private key format
        case '6030': // Data type definition mismatch with provided data
          dialogService.notify({
                msg: response.data.message
              });
          break;
        case '6004': // session expired/ logout
          dialogService.notify({
            msg: $filter('translate')('Session has expired. Please login again'),
            ok: function(){
              $window.location.href = $window.location.href.replace('#','?'); 
            } 
          });
          break;  
        case '6023': //Invalid Logging Configuration
          dialogService.notify({
            msg: $filter('translate')('PS.ERROR.MSG.6023')
          })
          break;
        case '7009': {
          dialogService.notify({
            msg: $filter('translate')('PS.ERROR.MSG.7009')
          })
          callback && callback(response.data);
          break;
        }
        case '7010': {
          dialogService.notify({
            msg: $filter('translate')('PS.ERROR.MSG.7010')
          });
          callback && callback(response.data);
          break;
        }
        case '7011': {
          dialogService.notify({
            msg: $filter('translate')('PS.ERROR.MSG.7011')
          });
          callback && callback(response.data);
          break;
        }
        default:
          if (callback) callback(response.data);
      }
    }
  }
  var errorHandler = function(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    // handle generic network errors 
    switch (response.status) {
      case -1: {
        dialogService.notify({
          msg: $filter('translate')('PS.ERROR.MSG.NETWORK.ERROR')
        })
        break
      }
      case 401:
      case 403: {
        var msg = $filter('translate')('PS.ERROR.MSG.403')
        if (response.data && response.data.statusCode) {
          switch (response.data.statusCode) {
            case '6004': // session expired/ logout
            dialogService.notify({
              msg: $filter('translate')('Session has expired. Please login again'),
              ok: function(){
                localStorage.removeItem('csrfToken');
                $window.location.href = $window.location.href.replace('#','?'); 
              } 
            });
            break;  
            case "6017": {
              msg = $filter('translate')('PS.ERROR.MSG.6017', { componentName: response.data.data.componentName })
              break
            }
            case "6018": {
              msg = $filter('translate')('PS.ERROR.MSG.6018', {
                componentType: response.data.data.componentType,
                componentName: response.data.data.componentName
              })
              break
            }
            case "6019": {
              msg = $filter('translate')('PS.ERROR.MSG.6019', { componentName: response.data.data.componentName })
              break
            }
          }
        }
        dialogService.notify({
          msg: msg,
          detailedMsg: (response.data && response.data.data && response.data.data.actionType && response.data.data.authorizableType) ?
            $filter('translate')('cc.access.requiredPermission') + $filter('translate')('cc.access.actionType.'
            + response.data.data.actionType)
            + $filter('translate')('cc.access.authorizableType.' + response.data.data.authorizableType) : undefined
        });
        break
      }
      case 400: {
          var errorMsg = "";
          if (response.data.data && response.data.data.globalErrors) {
            angular.forEach(response.data.data.globalErrors, function (error) {
              errorMsg += error.message + "\n"
            })
          }
          if (response.data.data && response.data.data.fieldErrors) {
            errorMsg += "\n"
            angular.forEach(response.data.data.fieldErrors, function (error) {
              errorMsg += error.message + "\n"
            })
          }
          dialogService.notify({
            msg: errorMsg || response.data.message
          })
          break
        }
      case 404:
      case 0:
      case 500: {
        dialogService.notify({
          msg: response.data.message || $filter('translate')('PS.ERROR.MSG.500')
        })
        break
      }
      default:
    }
  }
  var onlyGet = false;
  var get = function(url, callback, option, params) {
    $http({
      method: 'GET',
      url: url,
      params: params,
      responseType: option && option.responseType
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      successHandler(response, callback, option);
    }, errorHandler);
  }
  var syncGet = function(url, callback) {
    $.ajax({
      url: url,
      async: false,
      success: callback
    });
  };
  var post = function(url, data, callback, option) {
    if (onlyGet) {
      get(url, callback);
    } else {
      $http({
        method: 'POST',
        data: data,
        url: url
      }).then(function successCallback(response) {
        successHandler(response, callback, option);
      }, errorHandler);
    }
  };
  var postWithFile = function(url, data, callback, option) {
    if (onlyGet) {
      get(url, callback);
    } else {
      $http({
        method: 'POST',
        data: data,
        url: url,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: function(data, headersGetter) {
          var formData = new FormData();
          angular.forEach(data, function(value, key) {
            if(angular.isArray(value)) {
              angular.forEach(value, function(element) {
                formData.append(key, element);
              });
            } else {
              formData.append(key, value);
            }
          });
          var headers = headersGetter();
          delete headers['Content-Type'];
          return formData;
        }
      }).then(function successCallback(response) {
        successHandler(response, callback, option);
      }, errorHandler);
    }
  };
  var putWithFile = function(url, data, callback, option) {
    if (onlyGet) {
      get(url, callback);
    } else {
      $http({
        method: 'PUT',
        data: data,
        url: url,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: function(data, headersGetter) {
          var formData = new FormData();
          angular.forEach(data, function(value, key) {
            if(angular.isArray(value)) {
              angular.forEach(value, function(element) {
                formData.append(key, element);
              });
            } else {
              formData.append(key, value);
            }
          });
          var headers = headersGetter();
          delete headers['Content-Type'];
          return formData;
        }
      }).then(function successCallback(response) {
        successHandler(response, callback, option);
      }, errorHandler);
    }
  };
  var del = function(url, data, callback, option) {
    if (onlyGet) {
      get(url, callback);
    } else {
      var req = {
        method: 'DELETE',
        headers: {},
        data: data,
        url: url
      };
      option && option.contentType && (req.headers['Content-Type'] = option.contentType);
      $http(req).then(function successCallback(response) {
        successHandler(response, callback, option);
      }, errorHandler);
    }
  }
  var put = function(url, data, callback, option) {
    $http({
      method: 'PUT',
      data: data,
      url: url
    }).then(function successCallback(response) {
      successHandler(response, callback, option);
    }, errorHandler);
  }
  return {
    get: get,
    syncGet: syncGet,
    onlyGet: function(get) {
      onlyGet = get
    },
    post: post,
    del: del,
    put: put,
    postWithFile: postWithFile,
    putWithFile: putWithFile
  }
}]);

var CSRF_PROTECTED_HTTP_METHODS = ['DELETE', 'POST', 'PUT','GET'];
var CSRF_TOKEN_HEADER = 'X-CSRF-TOKEN';
var csrfToken;
policyStudio.factory('ongoingAjaxRequestCounter', ['$rootScope', '$q', function($rootScope, $q) {
  $rootScope.ongoingAjaxRequest = 0;
  return {
    // optional method
    'request': function(config) {
      // do something on success
      setTimeout(function() {
        $rootScope.ongoingAjaxRequest++;
        $rootScope.$apply();
      }, 500);
      if (CSRF_PROTECTED_HTTP_METHODS.indexOf(config.method.toUpperCase()) !== -1) {
        if (csrfToken) {
          config.headers[CSRF_TOKEN_HEADER] = csrfToken;
          localStorage.setItem('csrfToken', csrfToken)
        } else {
          var deferred = $q.defer();
          $.ajax({
            url: "api/v1/system/csrfToken",
            success: function (data, textStatus, xhr) {
              csrfToken = xhr.getResponseHeader(CSRF_TOKEN_HEADER);
              config.headers[CSRF_TOKEN_HEADER] = csrfToken;
              localStorage.setItem('csrfToken', csrfToken)
              deferred.resolve(config);
            },
            error: function () {
              deferred.reject(config);
            }
          });
          return deferred.promise;
        }
      }
      return config;
    },
    'response': function(response) {
      $rootScope.ongoingAjaxRequest--;
      return response;
    },
    'responseError': function(response) {
      $rootScope.ongoingAjaxRequest--;
      return $q.reject(response);
    },
    'requestError': function(rejectReason) {
      $rootScope.ongoingAjaxRequest--;
      return rejectReason;
    }
  }
}]).config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('ongoingAjaxRequestCounter');
}]);