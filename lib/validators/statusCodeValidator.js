var comparer = require('../util/comparer.js');

module.exports = function(expectedStatusCode, variables, testPart) {
	 this.id = "statusCode";
	 
	 this.validate = function(response) {
		 var result = {"id":"statusCode"};

		 if(comparer.areEqual(response.statusCode, expectedStatusCode, variables)) {
			 result.valid = true;
		 }
		 else {
			 result.valid = false;
			 result.expectedValue = expectedStatusCode;
			 result.actualValue = response.statusCode;
			 result.description = "Unexpected value"
		 }
		 
		 return result;
	 }
 }