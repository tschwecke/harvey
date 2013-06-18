var async = require('async');
var TestBuilder = require('./testBuilder.js');
var TestStepBuilder = require('./testStepBuilder.js');
var _ = require('underscore');
var util = require('./util/util.js');

module.exports = function() {
	var testBuilder = new TestBuilder();
	var testStepBuilder = new TestStepBuilder();

	this.buildSuite = function(tests, testData, variables, status) {

		var suiteInvoker = function(callback) {

			var suiteResult = {"passed": true, "suiteStepResults": [] };

			var suiteSteps = [];

			//Add the suite setups
			if(testData.suiteSetup) {
				for(var i=0; i<testData.suiteSetup.length; i++) {
					var setup = util.findById(testData.suiteSetup[i], testData.setupAndTeardowns);
					var setupInvoker = testStepBuilder.buildTestStep('suiteSetup', setup, testData.requestTemplates, testData.responseTemplates, variables, status);
					suiteSteps.push(setupInvoker);
				}
			}

			//Run each of the tests in parallel
			var parallelTests = [];
			var mainTestInvoker = function(testCallback) {
				for(var i=0; i<tests.length; i++) {
					var test = tests[i];

					var testInvoker = (function(t){
						return testBuilder.buildTest(t, testData.setupAndTeardowns, testData.requestTemplates, testData.responseTemplates, variables, status);
					}(test));

					

					if(test.repeat) {
						
						var seriesTests = [];
						for (var k = 0; k < test.repeat.length; k++) {
							var repeats = [];
							var delayInvoker = (function(del){
								return function(callback) { setTimeout(function(){callback();}, del);};
							}(test.repeat[k].delay));

							for(var j=0; j<test.repeat[k].times; j++) {
								repeats.push(testInvoker);

								if(test.repeat[k].delay) {
									repeats.push(delayInvoker);
								}
							}

							var singleRepeatInvoker = (function(r) {
								var f = function(callback) {
									async.series(r, function(error, testResults) {
										callback(null, testResults);
									});
								};
								return f;
							}(repeats));
							seriesTests.push(singleRepeatInvoker);
						}
						var multiRepeatInvoker = (function(r) {
							var f = function(callback) {
								async.series(r, function(error, testResults) {
									callback(null, _.flatten(testResults));
								});
							};
							return f;
						}(seriesTests));

						parallelTests.push(multiRepeatInvoker);
					}
					else {
						parallelTests.push(testInvoker);
					}
					
					
				}

				async.parallel(parallelTests, function(error, testResults) {


					//Check to see if there are any repeated tests that need to be pulled out of an array (HACK)
					var modifiedTestResults = [];
					for(var i=0; i<testResults.length; i++) {
						if(_.isArray(testResults[i])) {
							var innerTestResults = testResults[i];
							var repeatIndex=1;
							for(var j=0; j<innerTestResults.length; j++) {
								if(innerTestResults[j]) {
									innerTestResults[j].id+= '#' + repeatIndex++;
									modifiedTestResults.push(innerTestResults[j]);
								}
							}

						}
						else {
							modifiedTestResults.push(testResults[i]);
						}
					}
					testCallback(null, modifiedTestResults);
				});
			};
			suiteSteps.push(mainTestInvoker);

			//Add the suite teardowns
			if(testData.suiteTeardown) {
				for(var i=0; i<testData.suiteTeardown.length; i++) {
					var teardown = util.findById(testData.suiteTeardown[i], setupAndTeardowns);
					var teardownInvoker = testStepBuilder.buildTestStep('suiteTeardown', teardown, testData.requestTemplates, testData.responseTemplates, variables, status);
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
}; 
