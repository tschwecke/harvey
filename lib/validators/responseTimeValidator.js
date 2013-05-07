var comparer = require('../util/comparer.js');

module.exports = function(expectedResponseTime) {
	this.id = "responseTime";
	
	this.validate = function(response) {
		var result = {"id": "responseTime", "responseTime": response.responseTime};

		if(comparer.areEqual(response.responseTime, expectedResponseTime)) {
			result.valid = true;
		}
		else {
			result.valid = false;
			result.expectedValue = expectedResponseTime;
			result.actualValue = response.responseTime;
			result.description = "Response took too long"
		}

		return result;
	};
};