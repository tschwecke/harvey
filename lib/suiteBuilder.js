var async = require('async');
var TestBuilder = require('./testBuilder.js');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var util = require('./util/util.js');
var SchemaValidator = require('./schemaValidator.js');
var schemaValidator = new SchemaValidator();

module.exports = function() {
	var testBuilder = new TestBuilder();
	var testStepBuilder = new TestStepBuilder();

	this.buildSuite = function(tests, suite, variables, status) {

		schemaValidator.validateSuite(suite);
		
		var suiteInvoker = function(callback) {
			var suiteResult = {"passed": true, "suiteStepResults": [] };

			var suiteSteps = [];

			//Add the suite setups
			if(suite.suiteSetup) {
				for(var i=0; i<suite.suiteSetup.length; i++) {
					var setup = util.findById(suite.suiteSetup[i], suite.setupAndTeardowns);
// 
					if(!setup) {
						callback(new Error('Unable to find the suite setup \'' + suite.suiteSetup[i]  + '\''));
						return;
					}

					var setupInvoker = testStepBuilder.buildTestStep('suiteSetup', setup, suite.requestTemplates, suite.responseTemplates, variables, status);
					suiteSteps.push(setupInvoker);
				}
			}

			//Run each of the tests in parallel
			var parallelTests = [];
			var testInvoker = function(testCallback) {
				for(var i=0; i<tests.length; i++) {
					var test = tests[i];

					//Check to see if this test needs to be repeated multiple times
					if(test.repeat) {
						var testInvoker = buildRepeatedTests(test, suite, variables, status);
					}
					//Otherwise just add it once
					else {
						//Clone all of the variables being passed to the test so that if the test modifies the values it can't
						//affect any other test.
						var testVariables = _.clone(variables);

						var testInvoker = testBuilder.buildTest(test, suite.setupAndTeardowns, suite.requestTemplates, suite.responseTemplates, testVariables, status);
					}

					parallelTests.push(testInvoker);
				}

				async.parallel(parallelTests, function(error, testResults) {
					testCallback(null, testResults);
				});
			};
			suiteSteps.push(testInvoker);

			//Add the suite teardowns
			if(suite.suiteTeardown) {
				for(var i=0; i<suite.suiteTeardown.length; i++) {
					var teardown = util.findById(suite.suiteTeardown[i], suite.setupAndTeardowns);

					if(!teardown) {
						callback(new Error('Unable to find the suite teardown \'' + suite.suiteTeardown[i]  + '\''));
						return;
					}

					var teardownInvoker = testStepBuilder.buildTestStep('suiteTeardown', teardown, suite.requestTemplates, suite.responseTemplates, variables, status);
					suiteSteps.push(teardownInvoker);
				}
			}

			//Run each of the suite steps sequentially
			status.suiteStarting();
			async.series(suiteSteps, function(error, suiteStepResults) {
				suiteResult.suiteStepResults = suiteStepResults;
				status.suiteCompleted(suiteResult);
				callback(null, suiteResult);
			});
		};

		return suiteInvoker;
	}

	var buildRepeatedTests = function(test, suite, variables, status) {
		var testInvokers = [];

		var items = test.repeat.in;
		//If it's a string convert it into an array
		if(_.isString(items)) {
			items = items.split(',');
		}

		//Loop through each of the items in the array
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			//Clone all of the variables being passed to the test so that if the test modifies the values it can't
			//affect any other test.
			var testVariables = _.clone(variables);

			//Add the value of the current item as a variable for the test
			testVariables[test.repeat.var] = item;

			//Add the test to the list
			var testInvoker = testBuilder.buildTest(test, suite.setupAndTeardowns, suite.requestTemplates, suite.responseTemplates, testVariables, status);
			testInvokers.push(testInvoker);

		}

		//Determine if these should be run sequentially or in parallel
		//Default to parallel
		var asyncMethod = (test.repeat.mode === 'sequential') ? 'series' : 'parallel';

		var repeatedTestInvoker = function(callback) {
			async[asyncMethod](testInvokers, callback);
		};

		return repeatedTestInvoker;
	};
}; 
