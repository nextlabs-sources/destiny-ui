describe("policylistcontroller", function() {
  var $scope, PolicyListController, loggerService;
  var mockTranslateFilter;
  beforeEach(function() {
    module(function($provide) {
      $provide.value('translateFilter', mockTranslateFilter);
    });

    mockTranslateFilter = function(value) {
      return value;
    };
  });
  beforeEach(module('policyStudioApp'));
  beforeEach(inject(function($rootScope) {
    $scope = $rootScope.$new();
  }));
  beforeEach(inject(function($rootScope, $controller, $httpBackend, $injector) {
    $controller('policyStudioController', {
      $scope: $rootScope.$new()
    });
    policyService = $injector.get('policyService');
    configService = $injector.get('configService');
    loggerService = $injector.get('loggerService');
    configService.configObject['logLevel'] = 1;
    PolicyListController = $controller('PolicyListController', {
      $scope: $scope
    });
    $httpBackend.whenGET('PolicyStudio/i18n/en.json').respond({});
    $httpBackend.whenGET(configService.getUrl("policysearch.fields")).respond(window.fields);
    $httpBackend.whenGET(new RegExp(configService.getUrl("policysearch.tags") + '.*')).respond(window.tags);
    $httpBackend.whenGET(new RegExp(configService.getUrl("policysearch.savedlist") + '.*')).respond(window.savedSearch);
    $httpBackend.whenPOST(configService.getUrl("policylist.searchpolicy")).respond(window.policyList);
    // $httpBackend.whenGET(configService.getUrl("policylist.searchpolicy")).respond(window.savedSearch);
    $httpBackend.flush();
  }));

  it("should get policy list properly", function() {
    console.log('manually get new policy list')
    $scope.ctrl.refreshPolicyList();
    setTimeout(function() {
      // console.log('$scope.policyList---------', $scope.policyList);
      // the following expectation would fail since there are several new fields added to policy
      // expect($scope.policyList).toEqual(window.policyList.data);
      var index = 0;
      angular.forEach(window.policyList.data, function(policy){
        var actualPolicy = $scope.policyList[index++];
        for(var f in policy){
          expect(policy[f]).toEqual(actualPolicy[f]);
        }
      });
      console.log('policy list match');
    }, 100);
  });

  describe("Asynchronous Call Helper", function() {
    var originalTimeout;
    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("does nothing but wait...", function(wait) {
      setTimeout(function() {
        wait();
      }, 150);
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
  });
});