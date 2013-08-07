var _ = require('underscore');

module.exports = function(objectToStringify, parseValue) {

	this.perform = function(responseAsJson, testStep, variables) {
		var parsedObjectToStringify = parseValue(objectToStringify, variables, responseAsJson, testStep);

		return JSON.stringify(parsedObjectToStringify);
	};
}; 
