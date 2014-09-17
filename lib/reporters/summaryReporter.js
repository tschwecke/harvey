module.exports = {


	reportResults: function(results, config, callback) {

		console.log('');
		console.log('Suite Results:');
		console.log('--------------');
		results.suiteResults.forEach(function(result) {
			console.log(result.suiteId + '    ' + result.testsExecuted + ' tests complete, ' + result.testsFailed + ' failures');
		});

		var elapsed = results.timeEnded.getTime() - results.timeStarted.getTime();
		console.log('');
		console.log('Summary Results:');
		console.log('----------------');
		console.log('Overall time elapsed: ' + elapsed + ' ms');

		console.log(results.testsExecuted + ' tests complete, ' + results.testsFailed + ' failures');
		console.log('');

		callback();
	}
};
