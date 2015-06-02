var comparer = require('../util/comparer.js');
var _ = require('underscore');

module.exports = function(expectedHeaders, variables, testPart) {
	this.id = "header";

	this.validate = function(response) {
		var result = {"id":"header", "valid": true};

		if(expectedHeaders) {
			// lower case all header names
			expectedHeaders = _.chain(expectedHeaders)
								.pairs()
								.map(function(headerPair) { headerPair[0] = headerPair[0].toLowerCase(); return headerPair; })
								.object()
								.value();

			for(var expectedHeaderName in expectedHeaders) {

				if(expectedHeaders.hasOwnProperty(expectedHeaderName)) {
					var expectedHeaderValue = expectedHeaders[expectedHeaderName];
					var actualHeaderValue = response.headers[expectedHeaderName];

					var compareResult = comparer.areEqual(actualHeaderValue, expectedHeaderValue, variables);
					if(!compareResult.match) {
						result.valid = false;
						result.expectedValue = expectedHeaderValue;
						result.actualValue = actualHeaderValue;
						result.diffs = compareResult.diffs;
						result.description = "The header '" + expectedHeaderName + "' does not match the expected value";
						break;
					}
				}
			}
		}

		return result;
	}
 }
