module.exports = function(encodingInfo, parseValue) {

	this.perform = function(responseAsJson, testStep, variables) {

		var value = parseValue(encodingInfo.value, variables, responseAsJson, testStep);
		var output = new Buffer(value).toString('base64');

		return output;
	};
};