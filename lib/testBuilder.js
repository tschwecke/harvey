var async = require('async');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var deepExtend = require('deep-extend');
var util = require('./util/util.js');

module.exports = function() {
	var testStepBuilder = new TestStepBuilder();

	this.buildTest = function(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status) {
		
		var testInvoker = function(callback) {
			
			if(test.skip === true) {
				var testResult = {"id": test.id, "passed": true, "skipped": true, "testStepResults": [] };
				callback(null, testResult);
			}
			else {
				var testResult = {"id": test.id, "passed": true, "testStepResults": [] };

				//Clone all of the variables being passed to the test so that if the test modifies the values it can't
				//affect any other test.
				var testVariables = _.clone(variables);

				var testSteps = [];
				test.variables = test.variables || {};
				test.setup = test.setup || [];
				test.teardown = test.teardown || [];

				deepExtend(test.variables, testVariables);

				//Wire up the setups
				for(var i=0; i<test.setup.length; i++) {
					var setup = util.findById(test.setup[i], setupAndTeardowns);

					if(!setup) {
						throw new Error('Unable to find the setup \'' + test.setup[i]  + '\'');
					}

					if(setup) {
						var setupInvoker = testStepBuilder.buildTestStep("testSetup", setup, requestTemplates, responseTemplates, test.variables, status);
						testSteps.push(setupInvoker);
					}
				}

				//Wire up the test
				var testInvoker = testStepBuilder.buildTestStep("test", test, requestTemplates, responseTemplates, test.variables, status);
				testSteps.push(testInvoker);


				//Wire up the teardowns
				for(var i=0; i<test.teardown.length; i++) {
					var teardown = util.findById(test.teardown[i], setupAndTeardowns);

					if(!teardown) {
						throw new Error('Unable to find the teardown \'' + test.teardown[i]  + '\'');
					}

					if(teardown) {
						var teardownInvoker = testStepBuilder.buildTestStep("testTeardown", teardown, requestTemplates, responseTemplates, test.variables, status);
						testSteps.push(teardownInvoker);
					}
				}

				status.testGroupStarting(test);
				async.series(testSteps, function(error, testStepResults) {
					testResult.testStepResults = testStepResults;

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