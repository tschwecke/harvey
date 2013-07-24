var util = require('../util/util.js'),
	_ = require('underscore');

module.exports = function(dotNotationString) {

	this.perform = function(responseAsJson, testStep, variables) {
		var parts = dotNotationString.split('.');

		var value = responseAsJson;
		for(var k=0; k<parts.length; k++) {
			value = value[parts[k]];
		}
		return value;
	};
};
