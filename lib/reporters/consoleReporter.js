var _ = require('underscore'),
	color = require('cli-color');

var suiteDelimiterCharacter = '■';
var testSkippedCharacter = '-';
var testPassedCharacter = '✓';
var testFailedCharacter = '✖';

module.exports = {

	setNoColor: function() {
		//We want the text reporter to use the same code but not try to insert the color characters,
		//So we need to set up a no-op color object for that case
		var noop = function(str) { return str; };
		color = {};
		color.bold = noop;
		color.bold.whiteBright = noop;
		color.bold.cyanBright = noop;
		color.yellow = noop;
		color.green = noop;
		color.red = noop;
		color.cyanBright = noop;
	},
	setSuiteDelimiterCharacter: function(newCharacter) {
		suiteDelimiterCharacter = newCharacter;
	},
	setTestSkippedCharacter: function(newCharacter) {
		testSkippedCharacter = newCharacter;
	},
	setTestPassedCharacter: function(newCharacter) {
		testPassedCharacter = newCharacter;
	},
	setTestFailedCharacter: function(newCharacter) {
		testFailedCharacter = newCharacter;
	},

	reportResults: function(results, config, callback) {
		var logValidationResults = function (testPhaseResults, name) {
			if (testPhaseResults) {
				var validationCounts = {pass:0,fail:0},
					failedValidationIds = [],
					failedValidationDiffs = [];

				_.each(testPhaseResults, function(result) {
					_.each(result.validationResults, function(validation) {
						if (validation.valid) {
							validationCounts.pass++;
						} else {
							validationCounts.fail++;
							if (_.indexOf(failedValidationIds, validation.id) < 0) {
								failedValidationIds.push(validation.id);
							}
							failedValidationDiffs.push(validation.diffs)
						}
					});
				});

				failedValidationIds = (failedValidationIds.length > 0) ? ' (' + failedValidationIds.join(',') + ')' : '';
				console.log('        ' + name + ' phase: ' + validationCounts.pass + ' validations passed, ' + validationCounts.fail + ' validations failed' + failedValidationIds);

				if (failedValidationDiffs && failedValidationDiffs.length > 0 && failedValidationDiffs[0]) {
					for (var i = 0; i < failedValidationDiffs[0].length; i++) {
						var diff = failedValidationDiffs[0][i];
						var property = diff.property;
						if (!property) {
							console.log('           Expected: ' + diff.expected);
							console.log('             Actual: ' + diff.actual);
						} else if (property.indexOf("Array no-match") >= 0) {
							console.log('           No match for index: ' + diff.indicies);
						} else {
							console.log('           Property: ' + diff.property);
							console.log('           Expected: ' + diff.expected);
							console.log('             Actual: ' + diff.actual);
						}
					}
				}

			}
			else {
				console.log('        ' + name + ' phase: NONE');
			}
		};

		results.suiteResults.forEach(function(result) {
			console.log('  ' + color.bold.whiteBright(suiteDelimiterCharacter + ' ') + color.bold.cyanBright(result.suiteId));
			result.testResults.suiteStepResults.forEach(function(suiteStep) {
				if(_.isArray(suiteStep)) {
					suiteStep.forEach(function(test) {
						var indicator;
						if(test.skipped) 		indicator = color.yellow(testSkippedCharacter);
						else if(test.passed) 	indicator = color.green(testPassedCharacter);
						else 					indicator = color.red(testFailedCharacter);
						var testName = test.id;
						if(test.repeated) {
							testName += '(' + test.repeated.var + '=' + test.repeated.value + ')';
						}
						console.log('    ' + indicator + ' ' + color.bold(testName));
						if(!test.passed) {
							logValidationResults(_.filter(test.testStepResults, function(stepResult) {
									return stepResult.testPhase === 'testSetup';
								}), 'Set up');

							logValidationResults(_.filter(test.testStepResults, function(stepResult) {
									return stepResult.testPhase === 'test';
								}), 'Test');

							logValidationResults(_.filter(test.testStepResults, function(stepResult) {
									return stepResult.testPhase === 'testTeardown';
								}), 'Tear down');
						}
					});
				}
			});
			var elapsed = result.timeEnded.getTime() - result.timeStarted.getTime();
			console.log('\n    Time elapsed: ' + color.cyanBright(elapsed + ' ms'));

			var resultMsg = '    ' + result.testsExecuted + ' tests complete, ' + result.testsFailed + ' failures';
			resultMsg += (result.testsSkipped === 0) ? '.' : ', ' + result.testsSkipped + ' tests skipped.';
			resultMsg = (result.testsFailed > 0) ? color.red(resultMsg) : color.green(resultMsg);
			console.log(resultMsg);
			console.log('');
		});

		var elapsed = results.timeEnded.getTime() - results.timeStarted.getTime();
		console.log('  Overall time elapsed: ' + color.cyanBright(elapsed + ' ms'));

		var resultMsg = '  ' + results.testsExecuted + ' tests complete, ' + results.testsFailed + ' failures';
		resultMsg += (results.testsSkipped === 0) ? '.' : ', ' + results.testsSkipped + ' tests skipped.';
		resultMsg = (results.testsFailed > 0) ? color.red(resultMsg) : color.green(resultMsg);
		console.log(resultMsg);
		callback();
	}
};
