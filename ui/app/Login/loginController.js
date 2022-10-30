controlCenterConsoleApp.controller('loginController',['$scope','$state',function($scope,$state){
		$scope.doLogin = function(username, pwd){
			// login logic : server call etc

			$state.go('PolicyStudio.Policies');
		}

}
])