module.exports = function(objectToStringify, variables, parseValueFn) {
	var parsedObjectToStringify = parseValueFn(objectToStringify);

	return JSON.stringify(parsedObjectToStringify);
};
