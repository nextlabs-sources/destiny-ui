policyStudio.controller('policyStudioController',['$scope','networkService','configService','loggerService','$location','$state','$rootScope', 'userService',
    function($scope,networkService,configService,loggerService,$location,$state,$rootScope, userService){
		loggerService.getLogger().log(controlCenterConfig);
	 // var configCallback = function(data){
		
		$scope.tabs = [{
            title: 'TAB.POLICIES',
            url: 'PolicyStudio.Policies',
            finalUrl: 'PolicyStudio/Policies',
            iconCls:'cc-ps-menu-policy'
        }, {
            title: 'TAB.COMPONENTS',
            iconCls:'cc-ps-menu-component',
            url:'PolicyStudio.Components',
            expanded: true,
            children:[{
                title:'TAB.COMPONENTS.RESOURCE',
                url: 'PolicyStudio.Components({type:"Resource"})',
                finalUrl: 'PolicyStudio/Components/Resource'
            },{
                title:'TAB.COMPONENTS.ACTION',
                url: 'PolicyStudio.Components({type:"Action"})',
                finalUrl: 'PolicyStudio/Components/Action'
            },{
                title:'TAB.COMPONENTS.SUBJECT',
                url: 'PolicyStudio.Components({type:"Subject"})',
                finalUrl: 'PolicyStudio/Components/Subject'
            }]
        }, {
            title: 'TAB.RESOURCES',
            url: 'PolicyStudio.PolicyModel',
            finalUrl: 'PolicyStudio/PolicyModel',
            iconCls:'cc-ps-menu-resource'
        }, {
            title: 'TAB.TOOLS',
            iconCls:'cc-ps-menu-resource',
            url:'PolicyStudio.PolicyValidator',
            expanded: true,
            children: [{
                title: 'TAB.TOOLS.VALIDATOR',
                url: 'PolicyStudio.PolicyValidator',
                finalUrl: 'PolicyStudio/PolicyValidator'
            }, {
                title: 'TAB.TOOLS.XACML_POLICY_MGMT',
                url: 'PolicyStudio.XacmlPolicy',
                finalUrl: 'PolicyStudio/XacmlPolicy'
            }, {
                title: 'TAB.TOOLS.ENROLLMENT',
                url: 'PolicyStudio.Enrollment',
                finalUrl: 'PolicyStudio/Enrollment'
            }, {
                title: 'TAB.TOOLS.SECURESTORE',
                url: 'PolicyStudio.SecureStore',
                finalUrl: 'PolicyStudio/SecureStore'
            }, {
                title: 'TAB.TOOLS.PDPPLUGIN',
                url: 'PolicyStudio.PDPPlugin',
                finalUrl: 'PolicyStudio/PDPPlugin'
            }] 
          }, {
            title: 'TAB.CONFIGURATION',
            iconCls:'cc-ps-menu-tools',
            url:'PolicyStudio.Configuration',
            expanded: true,
            children:[{
                title:'TAB.CONFIGURATION.SYSTEM',
                url: 'PolicyStudio.SystemConfiguration',
                finalUrl: 'PolicyStudio/Configuration/System'
            }, {
                title:'TAB.CONFIGURATION.LOG',
                url: 'PolicyStudio.LoggerConfiguration',
                finalUrl: 'PolicyStudio/Configuration/Log'
            },
            {
                title:'TAB.CONFIGURATION.ENVIRONMENT',
                url: 'PolicyStudio.EnvironmentConfiguration',
                finalUrl: 'PolicyStudio/Configuration/Environment'
            }]
        }

        ];
        angular.forEach($scope.tabs, function(tab) {
            userService.getMenuAccess(tab.url, function(accessible) {
                tab.menuAccessible = accessible;
                tab.dynaAttr = accessible ? [] : userService.defaultMenuAccessibleBehavior
            });
        })
        var url = $location.url();
        if(url.indexOf('/') == 0)
            url = url.substring(1);
        if(url[url.length - 1] == '/')
            url = url.substring(0,url.length - 1);
        loggerService.getLogger().log(url);
	    $scope.currentTab = 'PolicyStudio.Policies';
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
                // tab.expanded = false;
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

}]);
