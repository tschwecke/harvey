module.exports = function(actionInfo, variables, parseValueFn) {
	for(var variable in actionInfo) {
		var value = parseValueFn(actionInfo[variable]);

		//Replace any special characters in the variable name before storing it.
		var variableName = variable.replace('${', '').replace('}', '');
		
		variables[variableName] = value;
	}
};
