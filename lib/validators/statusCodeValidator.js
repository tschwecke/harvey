var comparer = require('../util/comparer.js');

module.exports = function(expectedStatusCode, variables, testPart) {
	 this.id = 'statusCode';
	 
	 this.validate = function(response) {
		 var result = { id: 'statusCode' };

		 var compareResult = comparer.areEqual(response.statusCode, expectedStatusCode, variables);
		 if(compareResult.match) {
			 result.valid = true;
		 }
		 else {
			 result.valid = false;
			 result.expectedValue = expectedStatusCode;
			 result.actualValue = response.statusCode;
			 result.diffs = compareResult.diffs;
			 result.description = 'Unexpected value';
		 }
		 
		 return result;
	 }
 }