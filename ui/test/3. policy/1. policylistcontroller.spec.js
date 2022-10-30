describe("Policy List Controller", function() {
  var $scope, PolicyListController, policyService;
  var mockTranslateFilter;
  beforeEach(function() {
    module(function($provide) {
      $provide.value('translateFilter', mockTranslateFilter);
    });

    mockTranslateFilter = function(value) {
      return value;
    };
  });
  beforeEach(module('policyStudioApp'))
  beforeEach(inject(function($rootScope) {
    $scope = $rootScope.$new();
  }));
  beforeEach(inject(function($rootScope, $controller, $httpBackend, $injector) {
    // $scope.$digest();
    $controller('policyStudioController', {
      $scope: $rootScope.$new()
    });
    policyService = $injector.get('policyService');
    configService = $injector.get('configService');
    configService.configObject['logLevel'] = 0;
    PolicyListController = $controller('PolicyListController', {
      $scope: $scope
    });
    $httpBackend.whenGET('PolicyStudio/i18n/en.json').respond({});
    $httpBackend.whenGET(configService.getUrl("policysearch.fields")).respond(window.fields);
    $httpBackend.whenGET(new RegExp(configService.getUrl("policysearch.tags") + '.*')).respond(window.tags);
    $httpBackend.whenGET(new RegExp(configService.getUrl("policysearch.savedlist") + '.*')).respond(window.savedSearch);
    $httpBackend.whenPOST(configService.getUrl("policylist.searchpolicy")).respond(window.policyList);
    $httpBackend.flush();
    // console.log(PolicyListController);
    // $scope.$digest();
  }));

  it("should refresh policy list when refreshPolicyList method is called", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0)
    PolicyListController.refreshPolicyList();
    expect(policyService.getPolicies.calls.count()).toBe(1)
    PolicyListController.refreshPolicyList();
    expect(policyService.getPolicies.calls.count()).toBe(2)
  });

  it("should refresh policy list when text of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.text = PolicyListController.searchCriteria.criteria.text + 'test';
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when status of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.status.push($scope.searchOptions.statusOptions[0]);
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when effect of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.effect.push($scope.searchOptions.effectOptions[0]);
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when tags of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.tags.push($scope.searchOptions.tagOptions[0]);
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when sortBy of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.sortBy = $scope.searchOptions.sortOptions[1];
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when modifiedDate of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.modifiedDate = $scope.searchOptions.modifiedDateOptions[1];
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should refresh policy list when withSubpolicies of search criteria is changed", function() {
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    PolicyListController.searchCriteria.criteria.withSubpolicies = !!!PolicyListController.searchCriteria.criteria.withSubpolicies;
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should display name of saved search if a search is selected", function() {
    // console.log($scope.savedSearch.data[0]);
    expect(PolicyListController.searchCriteria.name).toBeNull();
    expect(PolicyListController.searchCriteria.$_nameDisplay).toEqual("policylist.title.savedSearches");
    $scope.setSearch($scope.savedSearch.data[0]);
    // console.log(PolicyListController.searchCriteria)
    expect(PolicyListController.searchCriteria.name).toEqual('All Allow Policy');
    expect(PolicyListController.searchCriteria.$_nameDisplay).toEqual('All Allow Policy');
  });

  it("should refresh policy list if a search is selected", function() {
    // console.log($scope.savedSearch.data[0]);
    spyOn(policyService, 'getPolicies');
    expect(policyService.getPolicies.calls.count()).toBe(0);
    $scope.setSearch($scope.savedSearch.data[1]);
    $scope.$digest();
    expect(policyService.getPolicies.calls.count()).toBe(1);
  });

  it("should have 'All' checked for all options when page just loads", function() {
    expect($scope.searchOptions.$allStatusChecked).toBeTruthy();
    expect($scope.searchOptions.$allEffectChecked).toBeTruthy();
    expect($scope.searchOptions.$allTagChecked).toBeTruthy();
    expect($scope.searchOptions.specialModifiedDateOption.$_checked).toBeTruthy();
  });

  it("should display 'filter applied' if status is selected in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.searchOptions.statusOptions[0].$_checked = true;
    $scope.statusChanged();
    $scope.updateStatus();
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.criteria.status).toEqual([$scope.searchOptions.statusOptions[0]]);
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should display 'filter applied' if effect is selected in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.searchOptions.effectOptions[0].$_checked = true;
    $scope.effectChanged();
    $scope.updateEffect();
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.criteria.effect).toEqual([$scope.searchOptions.effectOptions[0]]);
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should display 'filter applied' if tags is selected in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.searchOptions.tagOptions[0].$_checked = true;
    $scope.tagChanged();
    $scope.updateTag();
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.criteria.tags).toEqual([$scope.searchOptions.tagOptions[0]]);
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should display 'filter applied' if modifiedDate is selected in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.searchOptions.modifiedDateOptions[0].$_checked = true;
    $scope.updateCustomPeriod($scope.searchOptions.modifiedDateOptions[0]);
    $scope.checkModifiedDate($scope.searchOptions.modifiedDateOptions[0]);
    $scope.updateModifiedDate();
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.criteria.modifiedDate).toEqual($scope.searchOptions.modifiedDateOptions[0])
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should display 'filter applied' if text is changed in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.ctrl.searchCriteria.criteria.text = $scope.ctrl.searchCriteria.criteria.text + '-test';
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should display 'filter applied' if withSubpolicies is switched in and search form is collapsed", function() {
    expect($scope.ctrl.searchCriteria.pristine).toBeTruthy();
    $scope.ctrl.searchCriteria.criteria.withSubpolicies = !$scope.ctrl.searchCriteria.criteria.withSubpolicies;
    $scope.setDirty();
    expect($scope.ctrl.searchCriteria.pristine).toBeFalsy();
  });

  it("should turn 'All Status' unchecked if one specific status is checked", function() {
    expect($scope.searchOptions.$allStatusChecked).toBeTruthy();
    $scope.searchOptions.statusOptions[0].$_checked = true;
    $scope.statusChanged();
    expect($scope.searchOptions.$allStatusChecked).toBeFalsy();
    $scope.searchOptions.statusOptions[1].$_checked = true;
    $scope.statusChanged();
    expect($scope.searchOptions.$allStatusChecked).toBeFalsy();
  });

  it("should turn 'All Status' checked if no specific status is checked", function() {
    expect($scope.searchOptions.$allStatusChecked).toBeTruthy();
    $scope.searchOptions.statusOptions[0].$_checked = true;
    $scope.statusChanged();
    expect($scope.searchOptions.$allStatusChecked).toBeFalsy();
    $scope.searchOptions.statusOptions[0].$_checked = false;
    $scope.statusChanged();
    expect($scope.searchOptions.$allStatusChecked).toBeTruthy();
  });

  describe("with policy search form filled in", function() {
    var withSubpolicies;
    beforeEach(function() {
      withSubpolicies = $scope.ctrl.searchCriteria.criteria.withSubpolicies;
    })
    beforeEach(function() {
      $scope.searchOptions.statusOptions[0].$_checked = true;
      $scope.statusChanged();
      $scope.updateStatus();
      $scope.searchOptions.effectOptions[0].$_checked = true;
      $scope.effectChanged();
      $scope.updateEffect();
      $scope.searchOptions.tagOptions[0].$_checked = true;
      $scope.tagChanged();
      $scope.updateTag();
      $scope.searchOptions.modifiedDateOptions[0].$_checked = true;
      $scope.updateCustomPeriod($scope.searchOptions.modifiedDateOptions[0]);
      $scope.checkModifiedDate($scope.searchOptions.modifiedDateOptions[0]);
      $scope.updateModifiedDate();
      $scope.ctrl.searchCriteria.criteria.withSubpolicies = !$scope.ctrl.searchCriteria.criteria.withSubpolicies;
      $scope.ctrl.searchCriteria.criteria.text = $scope.ctrl.searchCriteria.criteria.text + '-test';
      PolicyListController.searchCriteria.criteria.sortBy = $scope.searchOptions.sortOptions[$scope.searchOptions.sortOptions.length - 1];
      $scope.setDirty();
    });

    it("should set all fields to default position if 'Clear Search' is clicked or 'X' is clicked", function() {
      $scope.clearSearch();
      angular.forEach($scope.searchOptions.statusOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      angular.forEach($scope.searchOptions.effectOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      angular.forEach($scope.searchOptions.tagOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      expect($scope.searchOptions.modifiedDateOptions[0].$_checked).toBeFalsy();
      expect($scope.searchOptions.specialModifiedDateOption.$_checked).toBeTruthy();
      expect($scope.ctrl.searchCriteria.criteria.withSubpolicies).toEqual(withSubpolicies);
      expect($scope.ctrl.searchCriteria.criteria.text).toBeNull();
    });

    it("should not reset search option if 'Clear Search' is clicked or 'X' is clicked", function() {
      $scope.clearSearch();
      expect(PolicyListController.searchCriteria.criteria.sortBy).not.toEqual($scope.searchOptions.sortOptions[0]);
    });

    it("should refresh the results if 'Clear Search' is clicked or 'X' is clicked", function() {
      spyOn(policyService, 'getPolicies');
      expect(policyService.getPolicies.calls.count()).toBe(0);
      $scope.clearSearch();
      $scope.$digest();
      expect(policyService.getPolicies.calls.count()).toBe(1);
    });
  });

  describe("with a saved search criteria set", function() {
    var withSubpolicies, searchToSet;
    beforeEach(function() {
      withSubpolicies = $scope.ctrl.searchCriteria.criteria.withSubpolicies;
    })
    beforeEach(function() {
      searchToSet = $scope.savedSearch.data[0];
      $scope.setSearch(searchToSet);
      $scope.$digest();
    });

    it("should display search name at heading", function() {
      expect(PolicyListController.searchCriteria.name).toBe(searchToSet.name)
    });

    it("should set all fields to default position if 'Clear Search' is clicked or 'X' is clicked", function() {
      $scope.clearSearch();
      angular.forEach($scope.searchOptions.statusOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      angular.forEach($scope.searchOptions.effectOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      angular.forEach($scope.searchOptions.tagOptions, function(option) {
        expect(option.$_checked).toBeFalsy();
      });
      expect($scope.searchOptions.modifiedDateOptions[0].$_checked).toBeFalsy();
      expect($scope.searchOptions.specialModifiedDateOption.$_checked).toBeTruthy();
      expect($scope.ctrl.searchCriteria.criteria.withSubpolicies).toEqual(withSubpolicies);
      expect($scope.ctrl.searchCriteria.criteria.text).toBeNull();
    });

    it("should set heading to empty if 'Clear Search' is clicked or 'X' is clicked", function() {
      $scope.clearSearch();
      expect(PolicyListController.searchCriteria.name).toBeNull();
    });

    it("should refresh the results if 'Clear Search' is clicked or 'X' is clicked", function() {
      spyOn(policyService, 'getPolicies');
      expect(policyService.getPolicies.calls.count()).toBe(0);
      $scope.clearSearch();
      $scope.$digest();
      expect(policyService.getPolicies.calls.count()).toBe(1);
    });
  });
  describe("with policy list", function() {
    beforeEach(function() {
      $scope.policyList = window.policyList.data;
      angular.forEach($scope.policyList, function(policy) {
        policy.optionOpen = false;
        policy.checked = false;
      })
    })

    it("should option closed for each policy", function() {
      angular.forEach($scope.policyList, function(policy) {
        expect(policy.optionOpen).toBeFalsy();
      });
    });

    it("should open option for one policy if the vertical ellipsis button is clicked", function() {
      $scope.ctrl.openOption($scope.policyList[0], !$scope.ctrl.openOption($scope.policyList[0]));
      expect($scope.policyList[0].optionOpen).toBeTruthy();
    });

    it("should close option for one policy if it's open already and clicked again", function() {
      $scope.ctrl.openOption($scope.policyList[0], false);
      expect($scope.ctrl.openOption($scope.policyList[0])).toBeFalsy();
      $scope.ctrl.openOption($scope.policyList[0], !$scope.ctrl.openOption($scope.policyList[0]));
      expect($scope.policyList[0].optionOpen).toBeTruthy();
      $scope.ctrl.openOption($scope.policyList[0], !$scope.ctrl.openOption($scope.policyList[0]));
      expect($scope.policyList[0].optionOpen).toBeFalsy();
    });

    it("should close other policy with open option if one policy is clicked", function() {
      $scope.ctrl.openOption($scope.policyList[0], false);
      $scope.ctrl.openOption($scope.policyList[1], false);
      expect($scope.policyList[0].optionOpen).toBeFalsy();
      expect($scope.policyList[1].optionOpen).toBeFalsy();
      $scope.ctrl.openOption($scope.policyList[0], true);
      $scope.ctrl.openOption($scope.policyList[1], true);
      expect($scope.policyList[0].optionOpen).toBeFalsy();
      expect($scope.policyList[1].optionOpen).toBeTruthy();
    });

    it("should set all policies checked if 'all policy' is checked", function() {
      angular.forEach($scope.policyList, function(policy) {
        expect(policy.checked).toBeFalsy();
      });
      PolicyListController.allPolicyChecked = true;
      PolicyListController.checkAllPolicy(PolicyListController.allPolicyChecked);
      angular.forEach($scope.policyList, function(policy) {
        expect(policy.checked).toBeTruthy();
      });
    });

    it("should set all policies unchecked if 'all policy' is unchecked", function() {
      PolicyListController.allPolicyChecked = false;
      PolicyListController.checkAllPolicy(PolicyListController.allPolicyChecked);
      angular.forEach($scope.policyList, function(policy) {
        expect(policy.checked).toBeFalsy();
      });
    });

    it("should set 'all policiy' checked if all policies are checked", function() {
      angular.forEach($scope.policyList, function(policy) {
        policy.checked = true;
        PolicyListController.policyCheckStatusChange();
      });
      expect(PolicyListController.allPolicyChecked).toBeTruthy();
    });

    it("should set 'all policiy' unchecked if not all policies are checked", function() {
      angular.forEach($scope.policyList, function(policy) {
        policy.checked = true;
        PolicyListController.policyCheckStatusChange();
      });
      expect(PolicyListController.allPolicyChecked).toBeTruthy();
      var index = Math.floor(Math.random() * $scope.policyList.length);
      $scope.policyList[index].checked = false;
      PolicyListController.policyCheckStatusChange();
      expect(PolicyListController.allPolicyChecked).toBeFalsy();
    });
  });
});
