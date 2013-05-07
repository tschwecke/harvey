
var util = require('../util/util.js'),
	actionFactory = require('./actionFactory.js');
	_ = require('underscore');

module.exports = function(variablesToSet) {

	this.perform = function(responseAsJson, testStep, variables, config) {
		for(var variable in variablesToSet) {
			var value = null;
			if(_.isObject(variablesToSet[variable])) {
				value = variablesToSet[variable];
			}
			else {
				value = util.extractWithDotNotation(responseAsJson, variablesToSet[variable]);
			}
			
			value = util.parseValue(value, variables, config, responseAsJson, testStep);

			//Replace any special characters in the variable name before storing it.
			var variableName = variable.replace('${', '').replace('}', '');
			
			variables[variableName] = value;
		}
	};
};
