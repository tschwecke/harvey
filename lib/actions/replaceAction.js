var _ = require('underscore');

module.exports = function(replaceInfo, parseValue) {
	
	this.perform = function(testStep, variables) {
		var replacedString = null;
		var replacementTarget = null;

		replacementTarget = parseValue(replaceInfo.value, variables, testStep);

		var regex = new RegExp(replaceInfo.regex, replaceInfo.flags);

		if(replacementTarget && _.isString(replacementTarget)) {
			replacedString = replacementTarget.replace(regex, replaceInfo.replacement);
		}
		
		return replacedString;
	};
}; 
