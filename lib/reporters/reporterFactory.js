 var fs = require('fs');
 var path = require('path');

module.exports = {
	createReporter: function(reporter) {
		//'reporter' can be either the name of one of the built in reporters or
		// a path to a custom reporter

		var reporterInstance = null;
		try {
			if(fs.existsSync(reporter)) {
				reporterInstance = require(path.resolve(reporter));
			}
			else {
				reporterInstance = require('./' + reporter + 'Reporter.js');
			}
		}
		catch(error) {
			throw new Error('Unable to find an implementation for reporter \'' + reporter + '\'');
		}

		return reporterInstance;
	}
};