describe("Policy Studio Controller", function() {
  var policyStudioController, configService;
  beforeEach(module('policyStudioApp'));
  beforeEach(inject(function($rootScope, $injector) {
    $scope = $rootScope.$new();
  }));
  beforeEach(inject(function($injector){
  	configService = $injector.get('configService');
    configService.configObject['logLevel'] = 0;
  }));
  beforeEach(inject(function($controller) {
    policyStudioController = $controller('policyStudioController', {
      $scope: $scope
    });
  }));

  it("should be initialized successfully with all config", function() {
  	// console.log(configService.configObject)
  	expect(window.controlCenterConfig.policyStudio).toEqual(configService.configObject)
  });
});