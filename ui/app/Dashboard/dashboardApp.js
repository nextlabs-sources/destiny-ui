var dashboardApp = angular.module('dashboardApp', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'ngMessages', 'nvd3']);
dashboardApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('Dashboard.init', {
    url: '/',
    templateUrl: 'ui/app/Dashboard/dashboard.html'
  })
}]);