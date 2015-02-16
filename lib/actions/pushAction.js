module.exports = function(actionInfo, variables, parseValueFn) {
	for(var variable in actionInfo) {
		var value = parseValueFn(actionInfo[variable]);

		//Replace any special characters in the variable name before storing it.
		var variableName = variable.replace('${', '').replace('}', '');
		
		
		if (!(variables[variableName] instanceof Array)) {
			variables[variableName] = [];
		}
		variables[variableName].push(value);
	}
};
