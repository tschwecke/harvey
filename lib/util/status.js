 
module.exports = function() {
	var suiteStartingCallbacks = [],
		suiteCompletedCallbacks = [],
		suiteSetupStartingCallbacks = [],
		suiteSetupCompletedCallbacks = [],
		suiteTeardownStartingCallbacks = [],
		suiteTeardownCompletedCallbacks = [],
		testGroupStartingCallbacks = [],
		testGroupCompletedCallbacks = [],
		testSetupStartingCallbacks = [],
		testSetupCompletedCallbacks = [],
		testStartingCallbacks = [],
		testCompletedCallbacks = [],
		testTeardownStartingCallbacks = [],
		testTeardownCompletedCallbacks = [],
		requestStartingCallbacks = [],
		requestCompletedCallbacks = [],
		requestFailedCallbacks = [];

	this.suiteStarting = function() {
		for(var i=0; i<suiteStartingCallbacks.length; i++) {
			suiteStartingCallbacks[i]();
		}
	};

	this.suiteCompleted = function(result) {
		for(var i=0; i<suiteCompletedCallbacks.length; i++) {
			suiteCompletedCallbacks[i](result);
		}
	};

	this.suiteSetupStarting = function(setup) {
		for(var i=0; i<suiteSetupStartingCallbacks.length; i++) {
			suiteSetupStartingCallbacks[i](setup);
		}
	};

	this.suiteSetupCompleted = function(setup, result) {
		for(var i=0; i<suiteSetupCompletedCallbacks.length; i++) {
			suiteSetupCompletedCallbacks[i](setup, result);
		}
	};

	this.suiteTeardownStarting = function(teardown) {
		for(var i=0; i<suiteTeardownStartingCallbacks.length; i++) {
			suiteTeardownStartingCallbacks[i](teardown);
		}
	};

	this.suiteTeardownCompleted = function(teardown, status) {
		for(var i=0; i<suiteTeardownCompletedCallbacks.length; i++) {
			suiteTeardownCompletedCallbacks[i](teardown, status);
		}
	};

	this.testGroupStarting = function(test) {
		for(var i=0; i<testGroupStartingCallbacks.length; i++) {
			testGroupStartingCallbacks[i](test);
		}
	};

	this.testGroupCompleted = function(test, result) {
		for(var i=0; i<testGroupCompletedCallbacks.length; i++) {
			testGroupCompletedCallbacks[i](test, result);
		}
	};
	
	this.testSetupStarting = function(test, setup) {
		for(var i=0; i<testSetupStartingCallbacks.length; i++) {
			testSetupStartingCallbacks[i](test, setup);
		}
	};

	this.testSetupCompleted = function(test, setup, result) {
		for(var i=0; i<testSetupCompletedCallbacks.length; i++) {
			testSetupCompletedCallbacks[i](test, setup, result);
		}
	};

	this.testStarting = function(test) {
		for(var i=0; i<testStartingCallbacks.length; i++) {
			testStartingCallbacks[i](test);
		}
	};

	this.testCompleted = function(test, result) {
		for(var i=0; i<testCompletedCallbacks.length; i++) {
			testCompletedCallbacks[i](test, result);
		}
	};

	this.testTeardownStarting = function(test, teardown) {
		for(var i=0; i<testTeardownStartingCallbacks.length; i++) {
			testTeardownStartingCallbacks[i](test, teardown);
		}
	};

	this.testTeardownCompleted = function(test, teardown, result) {
		for(var i=0; i<testTeardownCompletedCallbacks.length; i++) {
			testTeardownCompletedCallbacks[i](test, teardown, result);
		}
	};

	this.requestStarting = function(request) {
		for(var i=0; i<requestStartingCallbacks.length; i++) {
			requestStartingCallbacks[i](request);
		}
	};

	this.requestCompleted = function(request, response) {
		for(var i=0; i<requestCompletedCallbacks.length; i++) {
			requestCompletedCallbacks[i](request, response);
		}
	};

	this.requestFailed = function(request, error) {
		for(var i=0; i<requestFailedCallbacks.length; i++) {
			requestFailedCallbacks[i](request, error);
		}
	};


	
	this.onSuiteStarting = function(callback) {
		suiteStartingCallbacks.push(callback);
	};

	this.onSuiteCompleted = function(callback) {
		suiteCompletedCallbacks.push(callback);
	};

	this.onSuiteSetupStarting = function(callback) {
		suiteSetupStartingCallbacks.push(callback);
	};

	this.onSuiteSetupCompleted = function(callback) {
		suiteSetupCompletedCallbacks.push(callback);
	};

	this.onSuiteTeardownStarting = function(callback) {
		suiteTeardownStartingCallbacks.push(callback);
	};

	this.onSuiteTeardownCompleted = function(callback) {
		suiteTeardownCompletedCallbacks.push(callback);
	};

	this.onTestGroupStarting = function(callback) {
		testGroupStartingCallbacks.push(callback);
	};

	this.onTestGroupCompleted = function(callback) {
		testGroupCompletedCallbacks.push(callback);
	};

	this.onTestSetupStarting = function(callback) {
		testSetupStartingCallbacks.push(callback);
	};

	this.onTestSetupCompleted = function(callback) {
		testSetupCompletedCallbacks.push(callback);
	};

	this.onTestTeardownStarting = function(callback) {
		testTeardownStartingCallbacks.push(callback);
	};

	this.onTestTeardownCompleted = function(callback) {
		testTeardownCompletedCallbacks.push(callback);
	};

	this.onTestStarting = function(callback) {
		testStartingCallbacks.push(callback);
	};

	this.onTestCompleted = function(callback) {
		testCompletedCallbacks.push(callback);
	};

	this.onRequestStarting = function(callback) {
		requestStartingCallbacks.push(callback);
	};

	this.onRequestCompleted = function(callback) {
		requestCompletedCallbacks.push(callback);
	};

	this.onRequestFailed = function(callback) {
		requestFailedCallbacks.push(callback);
	};

};