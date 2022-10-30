describe("friendly date directive", function() {
  var $compile, $rootScope, $networkService, $filter;
  var posts = {};
  // Load the myApp module, which contains the directive
  beforeEach(module('policyStudioApp'));
  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_, $httpBackend, _$filter_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $filter = _$filter_;
    // required to Spy on $httpBackend service
    // $httpBackend.whenGET('PolicyStudio/i18n/en.json').respond({});
    // $httpBackend.flush();
  }));

  it("should deal with prefix correct", function() {
    var date = new Date();
    var prefix = "anything";
    var element = $compile('<friendly-date data-date="' + date.getTime() + '" data-date-type="miliseconds" data-prefix="' + prefix +
        '" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')
      ($rootScope);
    $rootScope.$digest();
    expect($(element).children(':eq(0)').html()).toBe(prefix);
  });

  it("should deal with title class correct", function() {
    var date = new Date();
    var titleClass = "anything";
    var element = $compile('<friendly-date data-date="' + date.getTime() + '" data-date-type="miliseconds" data-prefix="updated" title-class="' + titleClass +
        '" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')
      ($rootScope);
    $rootScope.$digest();
    // console.log($(element).html());
    expect($(element).children(':eq(0)').hasClass(titleClass)).toBe(true);
  });

  it("should deal with content class correct", function() {
    var date = new Date();
    var contentClass = "anything";
    var element = $compile('<friendly-date data-date="' + date.getTime() + '" data-date-type="miliseconds" data-prefix="updated" content-class="' + contentClass +
        '" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')
      ($rootScope);
    $rootScope.$digest();
    // console.log($(element).html());
    expect($(element).children(':eq(1)').hasClass(contentClass)).toBe(true);
  });

  it('should works fine for "A MOMENT AGO"', function() {
    var date = new Date();
    var element = $compile('<friendly-date data-date="' + date.getTime() +
      '" data-date-type="miliseconds" data-prefix="updated" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')($rootScope);
    $rootScope.$digest();
    expect($(element).children(':eq(0)').html()).toBe('updated');
    expect($(element).children(':eq(1)').html()).toBe('a moment ago');
  });

  it('should works fine for "YESTERDAY"', function() {
    var date = new Date();
    var format = 'h:m a';
    date.setDate(date.getDate() - 1)
    var element = $compile('<friendly-date data-date="' + date.getTime() +
      '" data-date-type="miliseconds" data-prefix="updated" data-full-format="d MMM yyyy,h:m a" data-short-format="' + format + '"></friendly-date>')($rootScope);
    $rootScope.$digest();
    // console.log($(element).html());
    expect($(element).children(':eq(0)').html()).toBe('updated');
    expect($(element).children(':eq(1)').html()).toContain('yesterday');
    expect($(element).children(':eq(1)').html()).toContain($filter('date')(date, format));
  });

  it('should works fine for "* HOURS AGO"', function() {
    var date = new Date();
    if (date.getHours() == 0) {
      return;
    }
    var toCut = Math.ceil(date.getHours() / 2);
    date.setHours(date.getHours() - toCut)
    var element = $compile('<friendly-date data-date="' + date.getTime() +
      '" data-date-type="miliseconds" data-prefix="updated" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')($rootScope);
    $rootScope.$digest();
    // console.log($(element).html());
    expect($(element).children(':eq(0)').html()).toBe('updated');
    expect($(element).children(':eq(1)').html()).toBe('today, ' + toCut + ' hours ago');
  });

  it('should works fine for "* MINUTES AGO"', function() {
    var date = new Date();
    if (date.getMinutes() == 0) {
      return;
    }
    var toCut = Math.ceil(date.getMinutes() / 2);
    date.setMinutes(date.getMinutes() - toCut)
    var element = $compile('<friendly-date data-date="' + date.getTime() +
      '" data-date-type="miliseconds" data-prefix="updated" data-full-format="d MMM yyyy,h:m a" data-short-format="h:m a"></friendly-date>')($rootScope);
    $rootScope.$digest();
    // console.log($(element).html());
    expect($(element).children(':eq(0)').html()).toBe('updated');
    expect($(element).children(':eq(1)').html()).toBe('today, ' + toCut + ' mins ago');
  });

  describe('should works fine for "A PARTICULAR DATE"', function() {
    var date = null;
    beforeEach(function() {
      date = new Date();
      var toCut = 150;
      date.setDate(date.getDate() - toCut);
    });

    it('and should format date correct', function() {
      var format = "d MMM yyyy,h:m a";
      var element = $compile('<friendly-date data-date="' + date.getTime() + '" data-date-type="miliseconds" data-prefix="updated" data-full-format="' + format +
        '" data-short-format="h:m a"></friendly-date>')($rootScope);
      $rootScope.$digest();
      // console.log($(element).html());
      expect($(element).children(':eq(0)').html()).toBe('updated on');
      expect($(element).children(':eq(1)').html()).toBe($filter('date')(date, format));
    });

    it('and should format date correct', function() {
      var format = "d MMM yyyy,h:m";
      var element = $compile('<friendly-date data-date="' + date.getTime() + '" data-date-type="miliseconds" data-prefix="updated" data-full-format="' + format +
        '" data-short-format="h:m a"></friendly-date>')($rootScope);
      $rootScope.$digest();
      // console.log($(element).html());
      expect($(element).children(':eq(0)').html()).toBe('updated on');
      expect($(element).children(':eq(1)').html()).toBe($filter('date')(date, format));
    });
  })
});