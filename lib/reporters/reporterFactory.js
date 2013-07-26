 
module.exports = {
	createReporter: function(reporterName) {

		try {
			var reporter = require('./' + reporterName + 'Reporter.js');
		}
		catch(error) {
			throw new Error('Unable to find an implementation for reporter \'' + reporterName + '\'');
		}

		return reporter;
	}
};