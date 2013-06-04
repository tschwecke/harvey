var async = require('async');
var TestBuilder = require('./testBuilder.js');

module.exports = function() {
	var testBuilder = new TestBuilder();

	this.buildSuite = function(tests, testData, config) {

		var suiteInvoker = function(callback) {
			var suiteResult = {"passed": true, "suiteStepResults": [] };

			var suiteSteps = [];

			//Add the suite setups
			if(testData.suiteSetup) {
				for(var i=0; i<testData.suiteSetup.length; i++) {
					var setup = util.findById(testData.suiteSetup[i], testData.setupAndTeardowns);
					var setupInvoker = testBuilder.buildTest(setup, testData.setupAndTeardowns, testData.requestTemplates, testData.responseTemplates, config);
					suiteSteps.push(setup);
				}
			}

			//Run each of the tests in parallel
			var parallelTests = [];
			var testInvoker = function(testCallback) {
				for(var i=0; i<tests.length; i++) {
					var test = tests[i];
					var testInvoker = testBuilder.buildTest(test, testData.setupAndTeardowns, testData.requestTemplates, testData.responseTemplates, config);
					parallelTests.push(testInvoker);
				}

				async.parallel(parallelTests, function(error, testResults) {
					testCallback(null, testResults);
				});
			};
			suiteSteps.push(testInvoker);

			//Add the suite teardowns
			if(testData.suiteTeardown) {
				for(var i=0; i<testData.suiteTeardown.length; i++) {
					var teardown = util.findById(testData.suiteTeardown[i], setupAndTeardowns);
					var teardownInvoker = testBuilder.buildTest(teardown, testData.setupAndTeardowns, testData.requestTemplates, testData.responseTemplates, config);
					suiteSteps.push(setup);
				}
			}

			//Run each of the suite steps sequentially
			async.series(suiteSteps, function(error, suiteStepResults) {
				suiteResult.suiteStepResults = suiteStepResults;

				callback(null, suiteResult);
			});
		};

		return suiteInvoker;
	}
}; 
