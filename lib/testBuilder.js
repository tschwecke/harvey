var async = require('async');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var deepExtend = require('deep-extend');
var clone = require('clone');
var util = require('./util/util.js');

module.exports = function() {
	var testStepBuilder = new TestStepBuilder();

	this.buildTest = function(test, setupAndTeardowns, requestTemplates, responseTemplates, testVariables, timeout, status) {

		var testInvoker = function(callback) {
			
			if(test.skip === true) {
				var testResult = { id: test.id, passed: true, skipped: true, testStepResults: [] };
				callback(null, [testResult]);
			}
			else {
				var testResult = { id: test.id, passed: true, repeated: null, testStepResults: [] };

				if(test.repeat) {
					testResult.repeated = {
						var: test.repeat.var,
						value: testVariables[test.repeat.var]
					};
				}

				var testSteps = [];
				test.variables = test.variables || {};
				test.setup = test.setup || [];
				test.verifications = test.verifications || [];
				test.teardown = test.teardown || [];

				//The order that we extend here matters.  We want to make sure that variables set directly
				//in the test override those set in setups.
				deepExtend(testVariables, test.variables);

				//Wire up the setups
				for(var i=0; i<test.setup.length; i++) {
					var testStepInfo = util.findTestStepInfoById(test.setup[i], setupAndTeardowns);
					var setup = testStepInfo.testStep;

					if(!setup) {
						callback(new Error('Unable to find the setup \'' + testStepInfo.id  + '\''));
						return;
					}

					//If this setup has a corresponding teardown to run, add it to the teardown list for this test.
					if(setup.teardown && test.teardown.indexOf(setup.teardown) === -1) {
						test.teardown.unshift(setup.teardown);
					}
					var setupInvoker = testStepBuilder.buildTestStep('testSetup', setup, requestTemplates, responseTemplates, testStepInfo.parameters, testVariables, timeout, status);
					testSteps.push(setupInvoker);
				}

				//Wire up the test
				var parameters = {};
				var testInvoker = testStepBuilder.buildTestStep('test', test, requestTemplates, responseTemplates, {}, testVariables, timeout, status);
				testSteps.push(testInvoker);


				//Wire up the verifications
				for(var i=0; i<test.verifications.length; i++) {
					var testStepInfo = util.findTestStepInfoById(test.verifications[i], setupAndTeardowns);
					var verification = testStepInfo.testStep;

					if(!verification) {
						callback(new Error('Unable to find the verification \'' + testStepInfo.id  + '\''));
						return;
					}

					var verificationInvoker = testStepBuilder.buildTestStep('testVerification', verification, requestTemplates, responseTemplates, testStepInfo.parameters, testVariables, timeout, status);
					testSteps.push(verificationInvoker);
				}

				//Wire up the teardowns
				for(var i=0; i<test.teardown.length; i++) {
					var testStepInfo = util.findTestStepInfoById(test.teardown[i], setupAndTeardowns);
					var teardown = testStepInfo.testStep;

					if(!teardown) {
						callback(new Error('Unable to find the teardown \'' + testStepInfo.id  + '\''));
						return;
					}

					var teardownInvoker = testStepBuilder.buildTestStep('testTeardown', teardown, requestTemplates, responseTemplates, testStepInfo.parameters, testVariables, timeout, status);
					testSteps.push(teardownInvoker);
				}

				status.testGroupStarting(test);
				async.series(testSteps, function(error, testStepResults) {
					//Repeating tests and setups can cause the results to have a different structure than 
					//expected so let's handle that
					testResult.testStepResults = util.normalizeResults(testStepResults);
					testResult.variables = clone(testVariables, false);

					for(var j=0; j<testResult.testStepResults.length; j++) {
							if(!testResult.testStepResults[j].passed) {
									testResult.passed = false;
							}
					}

					status.testGroupCompleted(test, testResult);
					callback(null, (test.repeat) ? testResult : [testResult]);
				});
			}
		};
		
		return testInvoker;
	}
};
