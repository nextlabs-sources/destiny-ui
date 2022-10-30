var controlCenterConsoleApp = angular.module('controlCenterConsoleApp',
        [   'ui.router','ui.bootstrap','policyStudioApp','delegationApp','uiSwitch','ngSanitize','pascalprecht.translate','ngMessages',
            'templates-main','ngCookies','dashboardApp','angularMoment','toaster', 'ui.ace', 'ui.tree', 'ui.router.state.events'
        ]
    );

 controlCenterConsoleApp.config(['$stateProvider','$urlRouterProvider','$translateProvider','$httpProvider', 'treeConfig', '$locationProvider', 
    function($stateProvider, $urlRouterProvider,$translateProvider,$httpProvider, treeConfig, $locationProvider) {
    $httpProvider.defaults.withCredentials = true;
    $urlRouterProvider.otherwise('/Dashboard');
    $locationProvider.hashPrefix('');
    $stateProvider
        .state('PolicyStudio', {
            url: '/PolicyStudio',
            // templateUrl: 'ui/app/PolicyStudio/policyStudio.html'
            // templateUrl: 'ui/app/PolicyStudio/Policy/policyList.html',
            template: '<div class="cc-layout-full-height" data-ui-view></div>',
            // abstract: true
        })
        .state('Delegations', {
            url: '/Delegations',
			//templateUrl: 'ui/app/Delegation/delegation.html'
            templateUrl: 'ui/app/Delegation/Policies/template/delegationlist.html'
        })
        .state('Users', {
            url: '/Users',
			//templateUrl: 'ui/app/Delegation/delegation.html'
            templateUrl: 'ui/app/Delegation/Users/template/user-and-group-list.html'
        })
        .state('LoginConfig', {
            url: '/loginconfig',
            template: '<div class="cc-layout-full-height" data-ui-view></div>',
        })
        .state('Dashboard', {
            url: '/Dashboard',
            templateUrl: 'ui/app/Dashboard/home.html'
        })
    $stateProvider
        .state('Login', {
            url: '/login',
            templateUrl: 'ui/app/Login/login.html'
        })
    $stateProvider
        .state('editProfile', {
            url: '/editProfile',
            templateUrl: 'ui/app/partials/edit-profile.html'
        })        
    $translateProvider.useStaticFilesLoader({
                  prefix: 'ui/app/i18n/',
                  suffix: '.json'
            });
    $translateProvider.preferredLanguage('en');
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    treeConfig.defaultCollapsed = true;
}]);

// for secure access of Urls in iframe
controlCenterConsoleApp.filter('trustUrl', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]); 

controlCenterConsoleApp.filter('id', function () {
    return function (name) {
        if (name) {
            let hyphenName = name.replace(/[\s\_\.\:\()]+/g, '-').toLowerCase()
            let lastIndex = hyphenName.length - 1
            let stringOfLastIndex = hyphenName[lastIndex]
            if (stringOfLastIndex === "-") {
                hyphenName = hyphenName.slice(0, -1);
            }
            return hyphenName
        }
    };
});

