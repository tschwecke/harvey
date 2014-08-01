var _ = require('underscore');

module.exports = function(objectToStringify, parseValue) {

	this.perform = function(testStep, variables) {
		var parsedObjectToStringify = parseValue(objectToStringify, variables, testStep);

		return JSON.stringify(parsedObjectToStringify);
	};
}; 
