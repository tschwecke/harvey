 
module.exports = {
	createReporter: function(reporterName) {
		return require('./' + reporterName + 'Reporter.js');
	}
};