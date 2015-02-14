var assert = require('assert'),
	_ = require('underscore'),
	Status = require('../../lib/util/status.js');

describe('status', function() {

	it('should call callback on suiteStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteStarting(function() {
			//Assert that we got here by calling done
			done();
		})

		//Act
		status.suiteStarting();

		//Assertions are handled in the callback
	});

	it('should call callback on suiteCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteCompleted(function(result) {
			//Assert
			assert.equal(result, "a");
			done();
		})

		//Act
		status.suiteCompleted("a");

		//Assertions are handled in the callback
	});

	it('should call callback on suiteSetupStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteSetupStarting(function(teardown) {
			//Assert that we got here by calling done
			assert.equal(teardown, "a");
			done();
		})

		//Act
		status.suiteSetupStarting("a");

		//Assertions are handled in the callback
	});

	it('should call callback on suiteSetupCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteSetupCompleted(function(teardown, result) {
			//Assert that we got here by calling done
			assert.equal(teardown, "a");
			assert.equal(result, "b");
			done();
		})

		//Act
		status.suiteSetupCompleted("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on suiteTeardownStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteTeardownStarting(function(teardown) {
			//Assert that we got here by calling done
			assert.equal(teardown, "a");
			done();
		})

		//Act
		status.suiteTeardownStarting("a");

		//Assertions are handled in the callback
	});

	it('should call callback on suiteTeardownCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onSuiteTeardownCompleted(function(teardown, result) {
			//Assert that we got here by calling done
			assert.equal(teardown, "a");
			assert.equal(result, "b");
			done();
		})

		//Act
		status.suiteTeardownCompleted("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on testGroupStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onTestGroupStarting(function(test) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			done();
		})

		//Act
		status.testGroupStarting("a");

		//Assertions are handled in the callback
	});

	it('should call callback on testGroupCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onTestGroupCompleted(function(test, result) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(result, "b");
			done();
		})

		//Act
		status.testGroupCompleted("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on testSetupStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onTestSetupStarting(function(test, teardown) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(teardown, "b");
			done();
		})

		//Act
		status.testSetupStarting("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on testSetupCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onTestSetupCompleted(function(test, teardown, result) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(teardown, "b");
			assert.equal(result, "c");
			done();
		})

		//Act
		status.testSetupCompleted("a", "b", "c");

		//Assertions are handled in the callback
	});


	it('should call callback on testTeardownStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onTestTeardownStarting(function(test, teardown) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(teardown, "b");
			done();
		})

		//Act
		status.testTeardownStarting("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on testTeardownCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onTestTeardownCompleted(function(test, teardown, result) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(teardown, "b");
			assert.equal(result, "c");
			done();
		})

		//Act
		status.testTeardownCompleted("a", "b", "c");

		//Assertions are handled in the callback
	});

	it('should call callback on testStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onTestStarting(function(test) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			done();
		})

		//Act
		status.testStarting("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on testCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onTestCompleted(function(test, result) {
			//Assert that we got here by calling done
			assert.equal(test, "a");
			assert.equal(result, "b");
			done();
		})

		//Act
		status.testCompleted("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on requestStarting', function(done) {
		//Arrange
		var status = new Status();
		status.onRequestStarting(function(request) {
			//Assert that we got here by calling done
			assert.equal(request, "a");
			done();
		})

		//Act
		status.requestStarting("a", "b");

		//Assertions are handled in the callback
	});

	it('should call callback on requestCompleted', function(done) {
		//Arrange
		var status = new Status();
		status.onRequestCompleted(function(request, result) {
			//Assert that we got here by calling done
			assert.equal(request, "a");
			assert.equal(result, "b");
			done();
		})

		//Act
		status.requestCompleted("a", "b");

		//Assertions are handled in the callback
	});


	it('should call callback on requestFailed', function(done) {
		//Arrange
		var status = new Status();
		status.onRequestFailed(function(request, error) {
			//Assert that we got here by calling done
			assert.equal(request, "a");
			assert.equal(error, "b");
			done();
		})

		//Act
		status.requestFailed("a", "b");

		//Assertions are handled in the callback
	});

});
