
var comparer = require('../util/comparer.js');

 module.exports = function(expectedBody, variables, testPart) {
	 this.id = 'body';

	 this.validate = function(response) {
		 var result = { id: 'body' };

		 var compareResult = comparer.areEqual(response.body, expectedBody, variables);
		 if(compareResult.match) {
			result.valid = true;
		 }
		 else {
			result.valid = false;
			result.diffs = compareResult.diffs
			result.description = 'Body does not match the expected value';
		 }

		 return result;
	 }
 }
