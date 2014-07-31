var async = require('async');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var deepExtend = require('deep-extend');
var util = require('./util/util.js');

module.exports = function() {
	var testStepBuilder = new TestStepBuilder();

	this.buildTest = function(test, setupAndTeardowns, requestTemplates, responseTemplates, testVariables, status) {
		
		var testInvoker = function(callback) {
			
			if(test.skip === true) {
				var testResult = {"id": test.id, "passed": true, "skipped": true, "testStepResults": [] };
				callback(null, testResult);
			}
			else {
				var testResult = {"id": test.id, "passed": true, "repeated": null, "testStepResults": [] };

				if(test.repeat) {
					testResult.repeated = {
						"var": test.repeat.var,
						"value": testVariables[test.repeat.var]
					};
				}

				var testSteps = [];
				test.variables = test.variables || {};
				test.setup = test.setup || [];
				test.teardown = test.teardown || [];

				//The order that we extend here matters.  We want to make sure that variables set directly
				//in the test override thos set in setups.
				deepExtend(testVariables, test.variables);

				//Wire up the setups
				for(var i=0; i<test.setup.length; i++) {
					var setup = util.findById(test.setup[i], setupAndTeardowns);

					if(!setup) {
						callback(new Error('Unable to find the setup \'' + test.setup[i]  + '\''));
						return;
					}

					if(setup) {
						var setupInvoker = testStepBuilder.buildTestStep("testSetup", setup, requestTemplates, responseTemplates, testVariables, status);
						testSteps.push(setupInvoker);
					}
				}

				//Wire up the test
				var testInvoker = testStepBuilder.buildTestStep("test", test, requestTemplates, responseTemplates, testVariables, status);
				testSteps.push(testInvoker);


				//Wire up the teardowns
				for(var i=0; i<test.teardown.length; i++) {
					var teardown = util.findById(test.teardown[i], setupAndTeardowns);

					if(!teardown) {
						callback(new Error('Unable to find the teardown \'' + test.teardown[i]  + '\''));
						return;
					}

					if(teardown) {
						var teardownInvoker = testStepBuilder.buildTestStep("testTeardown", teardown, requestTemplates, responseTemplates, testVariables, status);
						testSteps.push(teardownInvoker);
					}
				}

				status.testGroupStarting(test);
				async.series(testSteps, function(error, testStepResults) {
					//If any of the test steps were repeating then we'll have an array of arrays of results.
					//Let's flatten that.
					testResult.testStepResults = _.flatten(testStepResults, true);

					for(var j=0; j<testResult.testStepResults.length; j++) {
							if(!testResult.testStepResults[j].passed) {
									testResult.passed = false;
							}
					}

					status.testGroupCompleted(test, testResult);
					callback(null, testResult);
				});
			}
		};
		
		return testInvoker;
	}
};