var comparer = require('../util/comparer.js');

module.exports = function(expectedResponseTime, variables, testPart) {
	this.id = "responseTime";

	this.validate = function(response) {
		var result = {"id": "responseTime", "responseTime": response.responseTime};
		var compareResult = comparer.areEqual(response.responseTime, expectedResponseTime);

		if(compareResult.match) {
			result.valid = true;
		}
		else {
			result.valid = false;
			result.expectedValue = expectedResponseTime;
			result.actualValue = response.responseTime;
			result.diffs = compareResult.diffs;
			result.description = "Response took too long";
		}

		return result;
	};
};
