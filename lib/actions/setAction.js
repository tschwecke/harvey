module.exports = function(actionInfo, variables, parseValueFn) {
	for(var variable in actionInfo) {
		var value = parseValueFn(actionInfo[variable]);

		//Replace any special characters in the variable name before storing it.
		var variableName = variable.replace('${', '').replace('}', '');
		
		setVariable(variables, variableName, value)
	};
}

function setVariable(variables, variableName, variableValue) {
	if(variableName.indexOf('.') === -1) {
		variables[variableName] = variableValue;
	}
	else {
		var variableParts = variableName.split('.');

		var baseVariable = variables;
		//We want to make sure that every part except the last already exists, and if it doesn't then create it
		for(var i = 0; i<variableParts.length-1; i++) {
			var partName = variableParts[i];
			if(!(partName in baseVariable)) {
				baseVariable[partName] = {};
			}

			baseVariable = baseVariable[partName];
		}

		//Finally, assign the variable
		baseVariable[variableParts[variableParts.length-1]] = variableValue;
	}
}
