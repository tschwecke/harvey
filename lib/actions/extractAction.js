var _ = require('underscore');

module.exports = function(dotNotationString, parseValue) {

	this.perform = function(responseAsJson, testStep, variables) {
		var parts = dotNotationString.replace(/\[/g, '.').split('.');

		var endBracketIdx,
			value = responseAsJson;
		for(var k=0; k<parts.length; k++) {
			endBracketIdx = parts[k].indexOf(']');
			if(endBracketIdx === (parts[k].length - 1)) {
				parts[k] = parseInt(parts[k].substring(0, endBracketIdx), 10);
			}
			value = value[parts[k]];
		}
		return value;
	};
};
