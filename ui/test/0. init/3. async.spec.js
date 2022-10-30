describe("async function test demo", function() {
  it("should handle async method call successfully", function() {
    setTimeout(function() {
    	expect(true).toBe(true);
      console.log('dummy async test match');
    }, 100);
  });

  describe("Asynchronous Call Helper, add this to your spec if there is an async test case included", function() {
    var originalTimeout;
    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      // this DEFAULT_TIMEOUT_INTERVAL should be longer than the test case, which is 150 in this example
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("does nothing but wait..., remember to include the function name 'wait'", function(wait) {
      setTimeout(function() {
        wait();
      }, 150);
			// the timeout interval should be longer than the main test case, which is 100 in this example
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
  });
});