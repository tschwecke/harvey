 
 module.exports = function(expectedStatusCode) {
	 this.id = "statusCode";
	 
	 this.validate = function(response) {
		 var result = {"id":"statusCode"};
		 
		 if(response.statusCode === expectedStatusCode) {
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