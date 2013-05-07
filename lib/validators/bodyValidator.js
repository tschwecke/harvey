
var comparer = require('../util/comparer.js');

 module.exports = function(expectedBody) {
	 this.id = "body";
	 
	 this.validate = function(response) {
		 var result = {"id":"body"};
		 
		 if(comparer.areEqual(response.body, expectedBody)) {
			 result.valid = true;
		 }
		 else {
			 result.valid = false;
			 result.description = "Body does not match the expected value";
		 }
		 
		 return result;
	 }
 } 
