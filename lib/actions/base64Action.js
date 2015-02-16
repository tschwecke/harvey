module.exports = function(actionInfo, variables, parseValueFn) {

	var value = parseValueFn(actionInfo.value);
	var output = new Buffer(value).toString('base64');

	return output;
};