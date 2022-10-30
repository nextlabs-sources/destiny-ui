controlCenterConsoleApp.factory('userService', ['networkService', 'configService', 'loggerService', '$q', '$filter', 'dialogService', '$window', '$rootScope',
	function(networkService, configService, loggerService, $q, $filter, dialogService, $window, $rootScope) {
  var getCurrentUserDeferred = $q.defer();
  var getCurrentUserProfile = function(callback) {
    // loggerService.getLogger().log(configService.configObject.baseUrl)
    networkService.get(configService.getUrl("user.getProfile"), function(data) {
      callback && callback(data);
    });
  };
  var userAccessMap = {};
  var setUserAccessMap = function(map){
    angular.forEach(map,function(obj){
      if(!userAccessMap[obj.authority])
        userAccessMap[obj.authority] = true;
    });
    getCurrentUserDeferred.resolve();
  }
  var getUserAccessMap = function(callback){
    getCurrentUserDeferred.promise.then(function() {
      callback && callback(userAccessMap);
    });
  }
  var checkAccess = function(key){
    //if(!userAccessMap.length) return true;
    if(userAccessMap[key]) return true;
    return false;
  }

  // check if user allow to access server & Enforcer menu or not
  var checkUserMenuAccess = function(permission){
    if(userAccessMap[permission]){
      return true
    }

    return false
  }
  
  var showWarningAndGoBack = function() {
    dialogService.notify({
      msg: $filter('translate')('cc.access.not.allowed'),
      ok: function(){
        $rootScope.immediateStateChange = function() {
          return true;
        }
        $window.open("/#/home", "_self");
      }
    });
  }
  var goBackIfAccessDenied = function(key) {
    getCurrentUserDeferred.promise.then(function() {
      !checkAccess(key) && showWarningAndGoBack();
    });
  }
  var goBackIfAccessDeniedToApp = function(path) {
    getCurrentUserDeferred.promise.then(function() {
      !getMenuAccessPath(path.split('.')) && showWarningAndGoBack();
    });
  }
  var changePassword = function(data,callback){
  	networkService.put(configService.getUrl("user.changePassword"), data, function(data) {
      callback && callback(data);
    });
  }
  var attributeType = {
        HIDDEN:{
          attr:[{
            name: 'data-ng-hide',
            value:'true'
          }], style: {
            display: 'none'
          }
        },
        DISABLED:{
            attr:[{
              name: 'disabled',
              value: 'disabled'
            }]
        },
        NO_CURSOR:{
            attr:[],
            style: {
              cursor: 'default'
            }
        }
  }
  var getPermissions = function(page, callback){
    getCurrentUserDeferred.promise.then(function() {
      var permissions = {};
      angular.forEach(accessConfiguration[page],function(value,key){
        permissions[key] = {};
        angular.forEach(value,function(action){
          var actionVal = {};
          permissions[key][action.key] = actionVal;
          actionVal.result = checkAccess(key);
          actionVal.action = {};
          actionVal.action.ALLOW = action.ALLOW;
          actionVal.action.DENY = attributeType[action.DENY];
        })
      })

      callback && callback(permissions);
    });
  }

  var accessConfiguration = {
    POLICY: {
      VIEW_POLICY: [{
        key: 'menu',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      EDIT_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }, {
        key: 'parentPolicyOnList',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      CREATE_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DEPLOY_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MOVE_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MIGRATE_POLICY: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MANAGE_POLICY_WORKFLOW_LEVEL_1: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
    },
    COMPONENT: {
      VIEW_COMPONENT: [{
        key: 'menu',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      CREATE_COMPONENT: [{
        key: 'menu',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      EDIT_COMPONENT: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }, {
        key: 'parentComponentOnList',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      CREATE_COMPONENT: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_COMPONENT: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DEPLOY_COMPONENT: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MOVE_COMPONENT: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }]
    },
    POLICY_MODEL: {
      CREATE_POLICY_MODEL: [{
        key: 'menu',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      EDIT_POLICY_MODEL: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      CREATE_POLICY_MODEL: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_POLICY_MODEL: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }]
    },
    POLICY_FOLDER: {
      VIEW_POLICY_FOLDER: [
        {
          key: 'rowLevel',
          ALLOW: [],
          DENY: 'DISABLED'
        }],
      CREATE_POLICY_FOLDER: [
        {
          key: 'rowLevel',
          ALLOW: [],
          DENY: 'DISABLED'
        }
      ],
      RENAME_POLICY_FOLDER: [{
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MOVE_POLICY_FOLDER: [{
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_POLICY_FOLDER: [{
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }]
    },
    COMPONENT_FOLDER: {
      VIEW_COMPONENT_FOLDER: [
        {
          key: 'rowLevel',
          ALLOW: [],
          DENY: 'DISABLED'
        }],
      CREATE_COMPONENT_FOLDER: [
        {
          key: 'listLevel',
          ALLOW: [],
          DENY: 'DISABLED'
        },
        {
          key: 'rowLevel',
          ALLOW: [],
          DENY: 'DISABLED'
        }],
      RENAME_COMPONENT_FOLDER: [{
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      MOVE_COMPONENT_FOLDER: [{
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_COMPONENT_FOLDER: [{
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }]
    },
    REMOTE_ENVIRONMENT: {
      VIEW_ENVIRONMENT_CONFIGURATION: [{
        key: 'menu',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      EDIT_ENVIRONMENT_CONFIGURATION: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }, {
        key: 'parentPolicyOnList',
        ALLOW: [],
        DENY: 'NO_CURSOR'
      }],
      CREATE_ENVIRONMENT_CONFIGURATION: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'hierarchy',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
      DELETE_ENVIRONMENT_CONFIGURATION: [{
        key: 'pageLevel',
        ALLOW: [],
        DENY: 'HIDDEN'
      }, {
        key: 'rowLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }, {
        key: 'listLevel',
        ALLOW: [],
        DENY: 'DISABLED'
      }],
    }
  }
  var menuAccess = {
    Dashboard: true,
    PolicyStudio: {
      Policies: {
          'VIEW_POLICY': 'VIEW_POLICY',
          'EDIT_POLICY': 'EDIT_POLICY',
          'CREATE_POLICY': 'CREATE_POLICY',
          'DEPLOY_POLICY': 'DEPLOY_POLICY',
          'DELETE_POLICY': 'DELETE_POLICY',
          'MOVE_POLICY': 'MOVE_POLICY',
          'MIGRATE_POLICY': 'MIGRATE_POLICY',
          'VIEW_POLICY_FOLDER': 'VIEW_POLICY_FOLDER',
          'DELETE_POLICY_FOLDER': 'DELETE_POLICY_FOLDER',
          'RENAME_POLICY_FOLDER': 'RENAME_POLICY_FOLDER',
          'CREATE_POLICY_FOLDER': 'CREATE_POLICY_FOLDER',
          'MOVE_POLICY_FOLDER': 'MOVE_POLICY_FOLDER'
      },
      Components: {
          'VIEW_COMPONENT': 'VIEW_COMPONENT',
          'EDIT_COMPONENT': 'EDIT_COMPONENT',
          'CREATE_COMPONENT': 'CREATE_COMPONENT',
          'DEPLOY_COMPONENT': 'DEPLOY_COMPONENT',
          'DELETE_COMPONENT': 'DELETE_COMPONENT',
          'MOVE_COMPONENT': 'MOVE_COMPONENT',
          'VIEW_COMPONENT_FOLDER': 'VIEW_COMPONENT_FOLDER',
          'DELETE_COMPONENT_FOLDER': 'DELETE_COMPONENT_FOLDER',
          'RENAME_COMPONENT_FOLDER': 'RENAME_COMPONENT_FOLDER',
          'CREATE_COMPONENT_FOLDER': 'CREATE_COMPONENT_FOLDER',
          'MOVE_COMPONENT_FOLDER': 'MOVE_COMPONENT_FOLDER'
      },
      PolicyModel: {
          'VIEW_POLICY_MODEL': 'VIEW_POLICY_MODEL',
          'EDIT_POLICY_MODEL': 'EDIT_POLICY_MODEL',
          'CREATE_POLICY_MODEL': 'CREATE_POLICY_MODEL',
          'DELETE_POLICY_MODEL': 'DELETE_POLICY_MODEL'
      },
			PolicyValidator: {
					'MANAGE_POLICY_VALIDATOR': 'MANAGE_POLICY_VALIDATOR'
      },
      Enrollment: 'ENROLLMENT_MANAGEMENT',
      RemoteEnvironment: {
        'VIEW_ENVIRONMENT_CONFIGURATION': 'VIEW_ENVIRONMENT_CONFIGURATION',
        'EDIT_ENVIRONMENT_CONFIGURATION': 'EDIT_ENVIRONMENT_CONFIGURATION',
        'CREATE_ENVIRONMENT_CONFIGURATION': 'CREATE_ENVIRONMENT_CONFIGURATION',
        'DELETE_ENVIRONMENT_CONFIGURATION': 'DELETE_ENVIRONMENT_CONFIGURATION',
    },
      SysConfiguration: 'MANAGE_SYSTEM_CONFIGURATION',
      LogConfiguration: 'MANAGE_LOGGING_CONFIGURATION',
      SecureStore: 'MANAGE_SECURE_STORE',
      PDPPlugin: 'MANAGE_PDP_PLUGIN',
      XacmlPolicy: {
        'VIEW_XACML_POLICY': 'VIEW_XACML_POLICY',
        'CREATE_XACML_POLICY': 'CREATE_XACML_POLICY',
        'DELETE_XACML_POLICY': 'DELETE_XACML_POLICY'
      }
    },
    Reporter: {
      VIEW_REPORTER: 'VIEW_REPORTER',
      MANAGE_REPORTER: 'MANAGE_REPORTER'
    },
    Administrator: 'VIEW_ADMINISTRATOR',
    DelegatedAdministration: {
      'DA_POLICY' : 'MANAGE_DELEGATION_POLICIES',
      'USERS' : 'MANAGE_USERS'
    }
  }
  var getMenuAccessPath = function(path) {
    if(!path || !path.length) return false;
    var access = false;
    var key = menuAccess;
    for(var i in path) {
      key = key[path[i]];
      if(!key) return false; // wrong path
    }
    switch(typeof(key)) {
      case typeof(true): // access granted by default, e.g. 'Dashboard'
        return key;
        break;
      case typeof('string'):
        return checkAccess(key);
        break;
      default:
        for(var i in key) {
          if(getMenuAccessPath(path.concat(i))) return true;
        }
        return false;
        break;
    }
  }
  var getMenuAccess = function(pathStr, callback) {
      if(!pathStr || !pathStr.length) return callback && callback(false);
      getCurrentUserDeferred.promise.then(function() {
        callback && callback(getMenuAccessPath(pathStr.split('.')))
      });
  }
  var getFullAppAccess = function(callback) {
    getCurrentUserDeferred.promise.then(function() {
      var access = {};
      for(var key in menuAccess) {
        access[key] = getMenuAccessPath([key])
      }
      callback && callback(access);
    })
  }
  var defaultMenuAccessibleBehavior = attributeType['HIDDEN']
  var setHelpPreference = function(value,callback){
    networkService.put(configService.getUrl("user.sethelppreference") + value, null, function(data) {
      callback && callback(data);
    });
  }
  return {
    getCurrentUserProfile: getCurrentUserProfile,
    changePassword: changePassword,
    setUserAccessMap: setUserAccessMap,
    getUserAccessMap: getUserAccessMap,
    goBackIfAccessDenied: goBackIfAccessDenied,
    goBackIfAccessDeniedToApp: goBackIfAccessDeniedToApp,
    showWarningAndGoBack: showWarningAndGoBack,
    getPermissions: getPermissions,
    getMenuAccess: getMenuAccess,
    getFullAppAccess: getFullAppAccess,
    defaultMenuAccessibleBehavior: defaultMenuAccessibleBehavior,
    setHelpPreference: setHelpPreference,
    checkUserMenuAccess: checkUserMenuAccess,
  };
}]);
