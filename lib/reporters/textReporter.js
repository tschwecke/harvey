var _ = require('underscore');
var consoleReporter = require('./consoleReporter.js');

module.exports = {

	reportResults: function(results, config, outputStream, callback) {
		consoleReporter.setNoColor();
		consoleReporter.setSuiteDelimiterCharacter('*');
		consoleReporter.setTestPassedCharacter('+');
		consoleReporter.setTestFailedCharacter('x');
		consoleReporter.setTestSkippedCharacter('-');

		consoleReporter.reportResults(results, config, outputStream, callback);
	}
};
