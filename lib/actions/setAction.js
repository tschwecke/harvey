var util = require('../util/util.js'),
	_ = require('underscore');

module.exports = function(variablesToSet) {

	this.perform = function(responseAsJson, testStep, variables) {
		for(var variable in variablesToSet) {
			var value = util.parseValue(variablesToSet[variable], variables, responseAsJson, testStep);

			//Replace any special characters in the variable name before storing it.
			var variableName = variable.replace('${', '').replace('}', '');
			
			variables[variableName] = value;
		}
	};
};
