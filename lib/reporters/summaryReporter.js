module.exports = {
	reportResults: function(results, config, outputStream, callback) {

		outputStream.write('\n');
		outputStream.write('Suite Results:\n');
		outputStream.write('--------------\n');
		results.suiteResults.forEach(function(result) {
			outputStream.write(result.suiteId + '    ' + result.testsExecuted + ' tests complete, ' + result.testsFailed + ' failures\n');
		});

		var elapsed = results.timeEnded.getTime() - results.timeStarted.getTime();
		outputStream.write('\n');
		outputStream.write('Summary Results:\n');
		outputStream.write('----------------\n');
		outputStream.write('Overall time elapsed: ' + elapsed + ' ms\n');

		outputStream.write(results.testsExecuted + ' tests complete, ' + results.testsFailed + ' failures\n');
		outputStream.write('\n');

		callback();
	}
};
