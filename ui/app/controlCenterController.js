controlCenterConsoleApp.controller('controlCenterController',
	['$scope','configService','dialogService', '$state', 'networkService', 'loggerService', '$stateParams','$filter','$cookies', '$rootScope','$window', 
  '$location', 'userService', 'versionService','$timeout', 'policyService','constants',
	function($scope, configService,dialogService,$state,networkService,loggerService,$stateParams,$filter,$cookies, $rootScope,$window, $location,
   userService, versionService,$timeout, policyService,constants) {
	  configService.setConfig(controlCenterConfig);
    $scope.userGuideLink = controlCenterConfig['help.userGuide'];
    $scope.devResourceLink = controlCenterConfig['help.devResource'];
    var consoleBase = controlCenterConfig.policyStudio.url.online.baseUrl;

    function extractDomain(url) {
      var domain;
      //find & remove protocol (http, ftp, etc.) and get domain
      if (url.indexOf("://") > -1) {
          domain = url.split('/')[2];
      }
      else {
          domain = url.split('/')[0];
      }
      //find & remove port number
      domain = domain.split(':')[0];
      return domain;
    }
    
    var consoleDomain = consoleBase.indexOf('://') > -1 ? extractDomain(consoleBase) : location.host;
    var getJpcDomainRE = new RegExp('([^.]*)-cc\\.(.*)');
    var domainExec = getJpcDomainRE.exec(consoleDomain);
    if(domainExec) $rootScope.jpcDomain = domainExec[1] + '-jpc.' + domainExec[2];
    $scope.externalHelpUrl = null;
    versionService.getVersion(function(response) {
      $rootScope.cc_version = response.data;
    })
    versionService.installMode(function(response) {
      $rootScope.installMode = response.data && response.data;
      $scope.externalHelpUrl = controlCenterConfig.dashboard.externalHelpUrl[$rootScope.installMode] || controlCenterConfig.dashboard.externalHelpUrl['SAAS'];
      var favicon = $('<link/>').attr('rel', 'icon');
      var title = $('<title/>');
      if($rootScope.installMode == 'SAAS') {
        favicon.attr('href', 'saas.ico');
        title.text('NextLabs Cloud Authorization Service');
      } else {
        favicon.attr('href', 'favicon.ico');
        title.text("Control Center: " + $scope.currentCategory);
      }
      title.attr("id","page-header-title")
      angular.element('head').append(favicon);
      angular.element('head').append(title);
    })
    $rootScope.currentYear = new Date().getFullYear();
    $rootScope.controlCenterHost = $location.protocol() + '://' + $location.host() + ':' + $location.port();
	  // fav menu
	  $scope.showFavMenuList = {val:false};
	  $scope.showAboutMenuList = {val:false};
    $scope.showCategoryList = {val:false};
	  $scope.favList= [];
    $scope.splashScreen = configService.configObject.splash;
    $scope.splashScreen.show = false;
    $scope.splashScreen.checkbox = false;
    $scope.splashScreen.leftContent = "quick_start";
    $scope.menus = constants.policyStudioMenus;
    $scope.categoryMenuList = constants.appList;
    $scope.currentCategory='Policy Studio';
    $scope.appWithTabIcon = '';
    $scope.isOnTabIcon = false;
    $scope.initialsUsername = '';
    $scope.userType = '';
    $scope.quickStartTab = {
      beforeBeginOpen: false,
    }
    

    $scope.handleNavigate = function(menuItem,isDisabled){
      if (isDisabled) {
        return;
      }

      if (menuItem.url == "policy-validator") {
        $window.open("/console/" + menuItem.url);
      } else if (
        menuItem.url == "reporter/reports/auditLogReports.jsf" ||
        menuItem.url == "reporter/monitors/myAlerts.jsf"
      ) {
        $window.location.href = "/console/" + menuItem.url;
      } else if (menuItem.UiType && menuItem.UiType == "Administrator") {
        $window.location.href = $window.location.origin + menuItem.url;
      } else {
        $window.location.href = "/console/#/" + menuItem.url;
      }
      
    }

    $scope.handleNavigateUrl = function(menuDetails) {

      if (menuDetails.type == "title") {
        return void 0;
      }

      if (menuDetails.url == "policy-validator") {
        return "/console/" + menuDetails.url;
      } else if (
        menuDetails.url == "reporter/reports/auditLogReports.jsf" ||
        menuDetails.url == "reporter/monitors/myAlerts.jsf"
      ) {
        return "/console/" + menuDetails.url;
      } else if (menuDetails.UiType && menuDetails.UiType == "Administrator") {
        return $window.location.origin + menuDetails.url;
      } else {
        return "/console/#/" + menuDetails.url;
      }

    }

    $scope.handleMenuPermission = function(menuDetails){
      let allowed = false;

      if (menuDetails.menuType && menuDetails.menuType == "User Access") {
        menuDetails.permission.forEach((permission) => {
          if (!allowed) {
            allowed = $scope.checkUserAccess(permission);
          }
        });
      } else if (
        menuDetails.name &&
        menuDetails.permission &&
        menuDetails.permission == "Reporter"
      ) {
        allowed = $scope.appAccess[menuDetails.permission];
      } else if (menuDetails.name && menuDetails.permission) {
        menuDetails.permission.forEach((detail) => {
          if ($scope.menuAccess[detail] && $scope.menuAccess[detail].menuAccessible) {
            allowed = true;
          }

          if ($scope.checkUserAccess(detail)) {
            allowed = true;
          }
        });
      }

      return allowed
    }

    $scope.handleApplicationPermision = function(applicationDetails){
      let allowed = false;

      if(applicationDetails.type == 'Reporter'){
        allowed = $scope.appAccess[applicationDetails.permission].result
      }else if(applicationDetails.type == 'Administrator'){
        applicationDetails.permission.forEach((details)=>{
          if($scope.checkUserAccess(details)){
            allowed = true
          }
        })
      }else{
        applicationDetails.permission.forEach((detail)=>{
          if($scope.menuAccess[detail] && $scope.menuAccess[detail].menuAccessible){
            allowed = true
          }

          if ($scope.checkUserAccess(detail)) {
            allowed = true;
          }
        })
        
      }

      return allowed;
    }

    $scope.handleMenu = function(){

      var url = $window.location.href.substring(
        $window.location.href.indexOf("#") + 2
      );
      let activeRoute = constants.routeList.filter((route)=>{
          return route.url.indexOf(url) > -1 || url.indexOf(route.url) > -1;
      });
      if(activeRoute.length >0){
        if(activeRoute[0].application == 'Administrator'){
          $scope.menus = constants.systemAdminstrationMenus;
          $scope.currentCategory = "System Administration";
          if (document.getElementById("page-header-title")) {
            document.getElementById("page-header-title").innerHTML = "Control Center: System Administration";
          }
        }else if (activeRoute[0].application == "Audit and Report") {
          $scope.menus = constants.auditReportMenus;
          $scope.currentCategory = "Audit and Report";
        }else{
          $scope.menus = constants.policyStudioMenus;
          $scope.currentCategory = "Policy Studio";
          if (document.getElementById("page-header-title")) {
            document.getElementById("page-header-title").innerHTML = "Control Center: Policy Studio";
          }

        }
      }
      
    }

    $scope.handleNavigateApplication = function(categoryName,url,isAllowed,isNewTab){

      if(!isAllowed){
        return;
      }

      if(isNewTab){

        if (categoryName == "Policy Studio") {
          $scope.menus = constants.policyStudioMenus;
          $window.open("/console/" + url);

        } else {
          $window.open($scope.controlCenterHost + url)
        }

      }else{

        $scope.currentCategory = categoryName;
        if (categoryName == "Policy Studio") {
          $scope.menus = constants.policyStudioMenus;
          $window.location.href = "/console/" + url;

        } else {
          $window.location.href = $scope.controlCenterHost + url;
        }
      }
      
    }

    $scope.handleNavigateNewTab = function (categoryName,url,isAllowed) {

      if (!isAllowed) {
        return;
      }
      
      if (categoryName == "Policy Studio") {
        return "/console/" + url;
      } else {
        return $scope.controlCenterHost + url;
      }
  
    };

	  $scope.addToFav = function(page){
	  	var page = {};
	  	page.name = $state.current.name;
	  	page.params = angular.copy($stateParams);
	  	//page.id = Date.now(); // null once integrated with api 
	  	page.pageTitle = $state.current.pageTitle;
	  	page.url = $state.href($state.current.name);
	  	var found = $filter('filter')($scope.favList, {url:  $state.href($state.current.name)}, true);
	  	if(found.length){

	  	}else{
	  		$scope.favList.push(page);
	  		$cookies.put("favList", JSON.stringify($scope.favList));
	  	}
	  }
    $scope.showLogout = function(){
      if($scope.tempVar)  $scope.tempVar.val = true; 
      else $scope.tempVar= {val:true};
      $timeout(function(){
        if($scope.tempVar.val) 
          $scope.showUserProfile.val=true;

      },800);
    }
	  $scope.removeFromFav = function(index){
	  	 $scope.favList.splice(index,1);
	  	 // update cookie
	  	 $cookies.remove('favList');
	  	 $cookies.put("favList", JSON.stringify($scope.favList));
	  }
	  $scope.fetchFavorites = function(){
	  	// fetch from server

	  	// fetch from cookies
	  	var cookieStr = $cookies.get('favList');
	  	//// console.log(cookieStr);
	  	if(cookieStr)
	  		$scope.favList = JSON.parse($cookies.get('favList'));
	  }
	  $scope.goToFavoritePage = function(page){
	  	
	  	$state.go(page.name,page.params);

	  }
	  $scope.fetchFavorites();
	  $rootScope.showAboutPage = false;
	  $scope.showUserManual = function() {
	  	$rootScope.showAboutPage = !$rootScope.showAboutPage;
	  	$scope.showAboutMenuList.val = false;
	  }

      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
          if($rootScope.immediateStateChange && !$rootScope.immediateStateChange()) {
            event.preventDefault();
            $rootScope.stateChangeHook && $rootScope.stateChangeHook({
              name: toState.name,
              params: toParams
            })
            return;
          }
          $rootScope.hasUserManual = false;
          $rootScope.showAboutPage = false;
          $rootScope.immediateStateChange = null;
          $rootScope.stateChangeHook = null;
      });
      $scope.activeApp = {
      	val: 'Dashboard'
      };
      $rootScope.$on('$locationChangeStart', function(next, current) {
      	  if($window.location.href.indexOf('?/') > -1)  $window.location.href = $window.location.href.replace('?','#');		

          var url = current.substring(current.indexOf('#') + 2);

          $scope.activeApp.val = url;

          $scope.handleMenu()
      })

      // user profile

      $scope.showUserProfile = {val:false};

      $scope.currentUser = {
      		id : "",
      		name : "",
      		firstName : "",
      		lastName : "",
      		lastLogin : "",
      		role : "", 
      		type : ""
      }
      $scope.newPasswordMatching = true;
      $scope.validateForm = function() {
      	$scope.newPasswordMatching = $scope.currentUser.newPassword == $scope.currentUser.confirmNewPassword;
      }
      $scope.profileForm = {form:null};
      $scope.editUserProfile = function(userType){

        if (userType != 'imported') {
          $scope.showUserProfile.val = false;
          $state.go("editProfile");
        }
      }
      $scope.discardProfileChanges = function(){
      	$window.history.back();
      }
      $scope.logout = function(){
        $scope.showUserProfile.val = false;
        $('#logout-form-token').val(csrfToken);
        $('#logout-form').submit();

        localStorage.removeItem('policy.sortBy');
        localStorage.removeItem('componentSubjectType.sortBy');
        localStorage.removeItem('componentResourceType.sortBy');
        localStorage.removeItem('componentActionType.sortBy');
        localStorage.removeItem('resource.sortBy');
        localStorage.removeItem('delegationPolicies.sortBy');
        localStorage.removeItem('userList.sortBy');
        localStorage.removeItem('environment.sortBy');
        localStorage.removeItem('pdp.sortBy');
      }
	  $scope.invalidReason = null;
      $scope.changePassword = function(){
        if ($scope.profileForm.form.$invalid) {
          $scope.profileForm.form.$setDirty();
          for (var field in $scope.profileForm.form) {
            if (field[0] == '$')
              continue;
            // logger.log(field);
            $scope.profileForm.form[field].$touched = true;
          }
          return;
        }
        if($scope.currentUser.newPassword != $scope.currentUser.confirmNewPassword) {
          return;
        }
      	userService.changePassword(
      		{
      			password:$scope.currentUser.newPassword,
      			oldPassword:$scope.currentUser.oldPassword
      		},
      		function(resp){
            console.info("Message: " + resp.message);
      		  dialogService.notify({
		          msg: $filter('translate')(resp.message),
		          ok: function(){
                if(resp.statusCode == '1001') {
                  $scope.currentUser.oldPassword = "";
                  $scope.currentUser.newPassword = "";
                  $scope.currentUser.confirmNewPassword = "";
                  $scope.profileForm.form.$setPristine();
                  $scope.profileForm.form.oldPassword.$touched = false;
                  $scope.profileForm.form.newPassword.$touched = false;
                  $scope.profileForm.form.confirmNewPassword.$touched = false;
                  $window.history.back();
                }
		          } 
          	});
      		}
      	)

      }
    $scope.appAccess = null;
    userService.getFullAppAccess(function(appAccess) {
      $scope.appAccess = {};
      for(var i in appAccess) {
        $scope.appAccess[i] = {};
        $scope.appAccess[i].result = appAccess[i];
        $scope.appAccess[i].dynaAttr = appAccess[i] ? [] : userService.defaultMenuAccessibleBehavior;
      }
    });

    //Check if user can access the menu or not
    $scope.checkUserAccess = function (permission) {
      if (permission == "AUTHORISED"){
        return true;
      }
        return userService.checkUserMenuAccess(permission);
    };

    $scope.menuAccess = null;
    var setMenuAccess = function(){
      var menuAccess = {
        'PolicyStudio.Policies' : {},
        'PolicyStudio.Components' : {},
        'PolicyStudio.PolicyModel' : {},
        'DelegatedAdministration.DA_POLICY':{},
        'DelegatedAdministration.USERS':{},
        'PolicyStudio.PolicyValidator':{},
        'PolicyStudio.Enrollment':{},
        'PolicyStudio.SecureStore':{},
        'PolicyStudio.XacmlPolicy':{},
        'PolicyStudio.RemoteEnvironment':{},
        'PolicyStudio.PDPPlugin':{},
        'PolicyStudio.SysConfiguration':{},
        'PolicyStudio.LogConfiguration':{}
      }
      angular.forEach(menuAccess, function(obj,menu) {
            userService.getMenuAccess(menu, function(accessible) {
                !$scope.menuAccess && ($scope.menuAccess = {});
                $scope.menuAccess[menu] = {};
                $scope.menuAccess[menu].menuAccessible = accessible;
                $scope.menuAccess[menu].dynaAttr = accessible
                    ? []
                    : userService.defaultMenuAccessibleBehavior;
                if (menu == "PolicyStudio.XacmlPolicy") {
                  $scope.menuAccess[menu].menuAccessible =
                    $scope.checkUserAccess("XACML_POLICY");
                  $scope.menuAccess[menu].dynaAttr = $scope.checkUserAccess(
                    "XACML_POLICY"
                  )
                    ? []
                    : userService.defaultMenuAccessibleBehavior;
                }
            });
      })
      
    }
    setMenuAccess();
    userService.getCurrentUserProfile(function(resp){
      $scope.currentUser.name = resp.data.displayName;
      $scope.currentUser.firstName = resp.data.firstName;
      $scope.currentUser.lastName = resp.data.lastName;
      $scope.currentUser.type = resp.data.type;
      $scope.currentUser.username = resp.data.username;
      $scope.splashScreen.show = false;
      $scope.splashScreen.checkbox = resp.data.hideSplash;
	  	$rootScope.currentUser = $scope.currentUser;
      userService.setUserAccessMap(resp.data.authorities);
      $scope.createInitials(resp.data.displayName)
      $scope.userType = resp.data.type;
	  }); 
    // get word first character from username
    $scope.createInitials = function(username) {
        let initials = "";
        let splitedUsername = username.split(" ") // Get First and second name

        // get first character for first and second name
        for (let i = 0; i < splitedUsername.length; i++) {
            for (let j = 0; j < splitedUsername[i].length; j++) {
                if (splitedUsername[i].charAt(j) == '') {
                    continue;
                } else {
                    initials += splitedUsername[i].charAt(j);
                    break;
                }
            }

            if (initials.length == 2) {
                break;
            }
        }


        $scope.initialsUsername = initials.toUpperCase();
    }
    $scope.closeOnEsc = function(event){
      // console.log('on Esc', event.which);
      if(event.which === 27)  $scope.splashScreen.show = false;
    }
    $scope.setSplashHelpPref = function(){
      // console.log('prefence',$scope.splashScreen.checkbox)
      userService.setHelpPreference($scope.splashScreen.checkbox,function(resp){
      
      })
    }   
    $scope.importSamplePolicies = function() {
      dialogService.confirm({
        msg: $filter('translate')('PS.import.sample.warning'),
        ok: function(){
          versionService.importSamplePolicies().then(function(response) {
            if(response.statusCode[0] == '1') {
              var importedPolicyIds = response.data.imported_policy_ids;
              if(importedPolicyIds && importedPolicyIds.length) {
                policyService.deployPolicy(importedPolicyIds, function() {
                  dialogService.notifyWithoutBlocking({
                    msg: $filter('translate')('PS.import.sample.success', {ids:response.data.imported_policy_ids}),
                  });
                });
              } else dialogService.notifyWithoutBlocking({
                msg: $filter('translate')('PS.import.sample.success', {ids:response.data.imported_policy_ids}),
              });
            } else {
              switch(response.statusCode) {
                case '6003':
                  dialogService.notify({
                    msg: $filter('translate')('PS.import.sample.duplicate'),
                  });
                  break;
                default:
                  dialogService.notify({
                    msg: $filter('translate')(response.message),
                  });
              }
            }
          })
        } 
      }); 
    }

    // To make the icon only display for the hovered application only
    $scope.handleShowNewTabIconDisplay = function(appName) {
      $scope.appWithTabIcon = appName
    }

    // Hide the icon if mouse not hover on the appplication
    $scope.handleHideNewtabIconDisplay = function() {
      $scope.appWithTabIcon = ''
    }

    // return dynamic element id by combining group and name of app tray or menu
    $scope.handleElementId = function(group,name){

      if(group && group != ''){
        return group.replace(/\s+/g, '-').toLowerCase() + "-" + name.replace(/\s+/g, '-').toLowerCase();
      }else{
        return name.replace(/\s+/g, '-').toLowerCase();
      }
    }

    $scope.help = function() {
      $window.open('https://docs.nextlabs.com/cc/2021.03/about_the_console.aspx', '_blank')
    }

    $rootScope.uiConfigs = {};
    configService.getUIConfigs().then(function (response) {
      localStorage.setItem('mfaEnabled', response['mfa.gauth.enabled']);
      $rootScope.uiConfigs = response;
    });
	}
]);
