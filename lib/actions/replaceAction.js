var _ = require('underscore');

module.exports = function(actionInfo, variables, parseValueFn) {
	var replacedString = null;
	var replacementTarget = null;

	replacementTarget = parseValueFn(actionInfo.value);

	var regex = new RegExp(actionInfo.regex, actionInfo.flags);

	if(replacementTarget && _.isString(replacementTarget)) {
		replacedString = replacementTarget.replace(regex, actionInfo.replacement);
	}
	
	return replacedString;
};
