module.exports = function(encodingInfo, parseValue) {

	this.perform = function(testStep, variables) {

		var value = parseValue(encodingInfo.value, variables, testStep);
		var output = new Buffer(value).toString('base64');

		return output;
	};
};