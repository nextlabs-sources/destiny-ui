var delegationApp = angular.module('delegationApp', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'ngMessages']);
delegationApp.
config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/Delegations');
  $stateProvider
    .state("Delegations.list", {
      url: "/",
      templateUrl: "ui/app/Delegation/Policies/template/delegationlist.html",
    })
    .state("Delegations.create", {
      url: "/create",
      templateUrl: "ui/app/Delegation/Policies/template/createdelegation.html",
    })
    .state("Delegations.edit", {
      url: "/Delegation/:delegationId",
      templateUrl: "ui/app/Delegation/Policies/template/createdelegation.html",
    })
    .state("Users.userlist", {
      url: "/userlist",
      templateUrl: "ui/app/Delegation/Users/template/user-and-group-list.html",
    })
    .state("Users.grouplist", {
      url: "/grouplist",
      templateUrl: "ui/app/Delegation/Users/template/user-and-group-list.html",
    })
    .state("Users.createuser", {
      url: "/userlist/createuser",
      templateUrl: "ui/app/Delegation/Users/template/createuser.html",
    })
    .state("Users.importuser", {
      url: "/userlist/importuser",
      templateUrl: "ui/app/Delegation/Users/template/import-user.html",
      controller: "importUserController",
    })
    .state("Users.edituser", {
      url: "/userlist/edituser/:userId",
      templateUrl: "ui/app/Delegation/Users/template/createuser.html",
    })
    .state("Users.importgroup", {
      url: "/grouplist/importgroup",
      templateUrl: "ui/app/Delegation/Users/template/import-group.html",
      controller: "importGroupController",
    })
    .state("LoginConfig.list", {
      url: "/usersource",
      templateUrl:
        "ui/app/Delegation/LoginConfig/template/loginconfiglist.html",
    })
    .state("LoginConfig.add", {
      url: "/usersource/add",
      templateUrl:
        "ui/app/Delegation/LoginConfig/template/createloginconfig.html",
    })
    .state("LoginConfig.modify", {
      url: "/:id",
      templateUrl:
        "ui/app/Delegation/LoginConfig/template/createloginconfig.html",
    });
}]);