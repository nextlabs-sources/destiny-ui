delegationApp.controller('delegationController', ['$scope', 'networkService', 'configService', 'loggerService', '$location', '$state', '$rootScope',
  function($scope, networkService, configService, loggerService, $location, $state, $rootScope) {
  	$scope.tabs = [{
            title: 'delegation.TAB.Delegations',
            url: 'Delegations.list',
            finalUrl: '/',
            iconCls:'cc-ps-menu-policy'
        },
        {
            title: 'delegation.TAB.Users',
            url: 'Users.userlist',
            finalUrl: 'Users/userlist',
            iconCls:'cc-ps-menu-resource'
        }

    ];
	window.$location =  $location;
	var url = $location.url();
	if(url.indexOf('/') == 0)
	    url = url.substring(1);
	if(url[url.length - 1] == '/')
	    url = url.substring(0,url.length - 1);
	loggerService.getLogger().log(url);
	$scope.currentTab = 'Delegations.list';
	var findAndSet = function(parent, tab){
	    if(!tab.children){
	        // loggerService.getLogger().log('tab has no children', tab)
	        if(tab.finalUrl && url.indexOf(tab.finalUrl) == 0 || tab.url && url.indexOf(tab.url) == 0){
	            // loggerService.getLogger().log('\turl match');
	            if(parent) parent.expanded = true;
	            $scope.currentTab = tab.url;
	        }
	    }else{
	        // loggerService.getLogger().log('tab has children', tab)
	        tab.expanded = false;
	        angular.forEach(tab.children, function(childTab){
	            if(findAndSet(tab, childTab)){
	                tab.expanded = true
	            }
	        })
	    }
	}
	angular.forEach($scope.tabs, function(tab){
	    findAndSet(undefined, tab)
	});
	// loggerService.getLogger().log($scope);

	$scope.onClickTab = function (tab) {

	    $scope.currentTab = tab.url;
	}

	$scope.isActiveTab = function(tabUrl) {
		
	    return $scope.currentTab == tabUrl;
	    // return $scope.currentTab.indexOf(tabUrl) == 0;
	}	

	// fix me
	$rootScope.$on('$locationChangeStart', function(next, current) { 
	    // console.log(next, current)
	    url = current.substring(current.indexOf('#') + 2)
	      angular.forEach($scope.tabs, function(tab){
	        findAndSet(undefined, tab)
	    });
	  })

  }
]);