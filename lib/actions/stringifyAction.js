var util = require('../util/util.js'),
	_ = require('underscore');

module.exports = function(objectToStringify) {

	this.perform = function(responseAsJson, testStep, variables) {
		var parsedObjectToStringify = util.parseValue(objectToStringify, variables, responseAsJson, testStep);

		return JSON.stringify(parsedObjectToStringify);
	};
}; 
