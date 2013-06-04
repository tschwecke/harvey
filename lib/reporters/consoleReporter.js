var _ = require('underscore'),
	color = require('cli-color');

module.exports = {
	
	reportResults: function(results) {
		var logValidationResults = function (testPhaseResult, name) {
			if (testPhaseResult) {
				var validationCounts = _.countBy(testPhaseResult.validationResults, function(result) {
						return (result.valid) ? 'pass' : 'fail';
					}),
					failedValidationIds = _.pluck(_.where(testPhaseResult.validationResults, { valid: false }), 'id');
				validationCounts.pass = validationCounts.pass || 0;
				validationCounts.fail = validationCounts.fail || 0;
				failedValidationIds = (failedValidationIds.length > 0) ? ' (' + failedValidationIds.join(',') + ')' : '';
				console.log('      ' + name + ' phase: ' + validationCounts.pass + ' validations passed, ' + validationCounts.fail + ' validations failed' + failedValidationIds);
			}
			else {
				console.log('      ' + name + ' phase: NONE');
			}
		};

		results.testResults.suiteStepResults.forEach(function(suiteStep) {
			if(_.isArray(suiteStep)) {
				suiteStep.forEach(function(test) {
					var passed = (test.passed) ? color.green('✓') : color.red('✖');
					console.log('  ' + passed + ' ' + color.bold(test.id));

					logValidationResults(_.find(test.testStepResults, function(stepResult) {
							return stepResult.testPhase === 'testSetup';
						}), 'Set up');

					logValidationResults(_.find(test.testStepResults, function(stepResult) {
							return stepResult.testPhase === 'test';
						}), 'Test');

					logValidationResults(_.find(test.testStepResults, function(stepResult) {
							return stepResult.testPhase === 'testTeardown';
						}), 'Tear down');
				});
			}
		});
		var elapsed = results.timeEnded.getTime() - results.timeStarted.getTime();
		console.log('\n  Time elapsed: ' + elapsed + ' ms');

		var resultMsg = '  ' + results.testsExecuted + ' tests complete, ' + results.testsFailed + ' failures.';
		resultMsg = (results.testsFailed > 0) ? color.red(resultMsg) : color.green(resultMsg);
		console.log(resultMsg);
	}
}; 
