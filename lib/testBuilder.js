var async = require('async');
var TestStepBuilder = require('./testStepBuilder.js');

module.exports = function() {
	var testStepBuilder = new TestStepBuilder();

	this.buildTest = function(test, setupAndTeardowns, requestTemplates, responseTemplates, config) {

		var testInvoker = function(callback) {
			var testResult = {"id": test.id, "passed": true, "testStepResults": [] };
			
			//We need to string together all of the startups and the test so that they run serially
			var testSteps = testStepBuilder.buildTestSteps(test, setupAndTeardowns, requestTemplates, responseTemplates, config);

			async.series(testSteps, function(error, testStepResults) {
				testResult.testStepResults = testStepResults;
				
				for(var j=0; j<testResult.testStepResults.length; j++) {
						if(!testResult.testStepResults[j].passed) {
								testResult.passed = false;
						}
				}
				
				callback(null, testResult);
			});
		};
		
		return testInvoker;
	}
};