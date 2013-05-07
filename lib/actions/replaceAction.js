var util = require('../util/util.js');
var _ = require('underscore');

module.exports = function(replaceInfo) {
	
	this.perform = function(responseAsJson, testStep, variables, config) {
		var replacedString = null;
		var replacementTarget = null;

		if(replaceInfo.value) {
			replacementTarget = replaceInfo.value;
		}
		else if(replaceInfo.field) {
			replacementTarget = util.extractWithDotNotation(responseAsJson, replaceInfo.field);
			replacementTarget = util.parseValue(replacementTarget, variables, config);
		}

		var regex = new RegExp(replaceInfo.regex);

		if(replacementTarget && _.isString(replacementTarget)) {
			replacedString = replacementTarget.replace(regex, replaceInfo.replacement);
		}
		
		return replacedString;
	};
}; 
