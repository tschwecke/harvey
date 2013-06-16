var util = require('../util/util.js'),
	_ = require('underscore');

module.exports = function(replaceInfo) {
	
	this.perform = function(responseAsJson, testStep, variables) {
		var replacedString = null;
		var replacementTarget = null;

		if(_.isObject(replaceInfo.value)) {
			replacementTarget = util.parseValue(replaceInfo.value, variables, responseAsJson, testStep);
		}
		else {
			replacementTarget = replaceInfo.value;
		}
		/*else if(replaceInfo.field) {
			replacementTarget = util.extractWithDotNotation(responseAsJson, replaceInfo.field);
			replacementTarget = util.parseValue(replacementTarget, variables);
		}*/

		var regex = new RegExp(replaceInfo.regex);

		if(replacementTarget && _.isString(replacementTarget)) {
			replacedString = replacementTarget.replace(regex, replaceInfo.replacement);
		}
		
		return replacedString;
	};
}; 
