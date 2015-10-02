var async = require('async');
var TestBuilder = require('./testBuilder.js');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var util = require('./util/util.js');
var SchemaValidator = require('./schemaValidator.js');
var schemaValidator = new SchemaValidator();
var deepExtend = require('deep-extend');

module.exports = function() {
	var testBuilder = new TestBuilder();
	var testStepBuilder = new TestStepBuilder();

	this.buildSuite = function(suite, config, timeout, status) {

		schemaValidator.validateSuite(suite);

		//The order that we extend here matters.  We want to make sure that config passed in from
		//the command line overrides config set directly in the test suite
		var variables = {};
		deepExtend(variables, suite.config, config);


		var suiteInvoker = function(callback) {
			var suiteResult = {"passed": true, "suiteStepResults": [] };

			var suiteSteps = [];
			suite.suiteSetup = suite.suiteSetup || [];
			suite.suiteTeardown = suite.suiteTeardown || [];

			//Add the suite setups
			if(suite.suiteSetup) {
				for(var i=0; i<suite.suiteSetup.length; i++) {
					var testStepInfo = util.findTestStepInfoById(suite.suiteSetup[i], suite.setupAndTeardowns);
					var setup = testStepInfo.testStep;

					if(!setup) {
						callback(new Error('Unable to find the suite setup \'' + testStepInfo.id  + '\''));
						return;
					}

					//If this setup has a corresponding teardown to run, add it to the teardown list for this test.
					if(setup.teardown && suite.suiteTeardown.indexOf(setup.teardown) === -1) {
						suite.suiteTeardown.unshift(setup.teardown);
					}

					var setupInvoker = testStepBuilder.buildTestStep('suiteSetup', setup, suite.requestTemplates, suite.responseTemplates, testStepInfo.parameters, variables, timeout, status);
					suiteSteps.push(setupInvoker);
				}
			}

			//Run each of the tests in parallel
			var parallelTests = [];
			var testInvoker = function(testCallback) {
				for(var i=0; i<suite.tests.length; i++) {
					var test = suite.tests[i];

					//Check to see if this test needs to be repeated multiple times
					if(test.repeat) {
						var testInvoker = buildRepeatedTests(test, suite, variables, timeout, status);
					}
					//Otherwise just add it once
					else {
						//Clone all of the variables being passed to the test so that if the test modifies the values it can't
						//affect any other test.
						var testVariables = _.clone(variables);

						var testInvoker = testBuilder.buildTest(test, suite.setupAndTeardowns, suite.requestTemplates, suite.responseTemplates, testVariables, timeout, status);
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
					var testStepInfo = util.findTestStepInfoById(suite.suiteTeardown[i], suite.setupAndTeardowns);
					var teardown = testStepInfo.testStep;

					if(!teardown) {
						callback(new Error('Unable to find the suite teardown \'' + testStepInfo.id  + '\''));
						return;
					}

					var teardownInvoker = testStepBuilder.buildTestStep('suiteTeardown', teardown, suite.requestTemplates, suite.responseTemplates, testStepInfo.parameters, variables, timeout, status);
					suiteSteps.push(teardownInvoker);
				}
			}

			//Run each of the suite steps sequentially
			status.suiteStarting();
			async.series(suiteSteps, function(error, suiteStepResults) {
				//Repeating tests and setups can cause the results to have a different structure than
				//expected so let's handle that
				suiteResult.suiteStepResults = util.normalizeResults(suiteStepResults);

				//Check to see if the overall suite passed or failed
				for(var j=0; j<suiteResult.suiteStepResults.length; j++) {
					if(_.isArray(suiteResult.suiteStepResults[j])) {
						for(var k=0; k<suiteResult.suiteStepResults[j].length; k++) {
							if(!suiteResult.suiteStepResults[j][k].passed) {
									suiteResult.passed = false;
									break;
							}
						}
					}
					else {
						if(!suiteResult.suiteStepResults[j].passed) {
								suiteResult.passed = false;
								break;
						}
					}
				}

				status.suiteCompleted(suiteResult);
				callback(null, suiteResult);
			});
		};

		return suiteInvoker;
	};

	var buildRepeatedTests = function(test, suite, variables, timeout, status) {
		var testInvokers = [];


		var items = util.performVariableSubstitution(test.repeat.in || [], variables);
		//If it's a string convert it into an array
		if(_.isString(items)) {
			items = items.split(',');
		}

		//Determine where to start and stop looping
		var startIndex = test.repeat.from || 0;
		var stopIndex = test.repeat.to || items.length - 1;

		//Loop through each of the items in the array
		for (var i = startIndex; i <= stopIndex; i++) {
			var item = items[i];

			//Clone all of the variables being passed to the test so that if the test modifies the values it can't
			//affect any other test.
			var testVariables = _.clone(variables);

			//Add the value of the current item as a variable for the test
			testVariables[test.repeat.var] = (test.repeat.in) ? items[i] : i;

			//Add the test to the list
			var testInvoker = testBuilder.buildTest(test, suite.setupAndTeardowns, suite.requestTemplates, suite.responseTemplates, testVariables, timeout, status);
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
