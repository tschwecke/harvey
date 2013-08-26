var comparer = require('../util/comparer.js');
 
module.exports = function(expectedHeaders, variables, testPart) {
	this.id = "header";
	 
	this.validate = function(response) {
		var result = {"id":"header", "valid": true};

		if(expectedHeaders) {
			for(var expectedHeaderName in expectedHeaders) {

				if(expectedHeaders.hasOwnProperty(expectedHeaderName)) {
					var expectedHeaderValue = expectedHeaders[expectedHeaderName];
					var actualHeaderValue = response.headers[expectedHeaderName];

					if(!comparer.areEqual(actualHeaderValue, expectedHeaderValue, variables)) {
						result.valid = false;
						result.expectedValue = expectedHeaderValue;
						result.actualValue = actualHeaderValue
						result.description = "The header '" + expectedHeaderName + "' does not match the expected value";
						break;
					}
				}
			}
		}

		return result;
	}
 } 
