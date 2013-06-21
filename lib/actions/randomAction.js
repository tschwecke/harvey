var util = require('../util/util.js'),
	_ = require('underscore');

module.exports = function(randomInfo) {

	this.perform = function(responseAsJson, testStep, variables) {
		var randomValue = null;

		if(randomInfo.type === "number") {
			var min = randomInfo.min;
			var max = randomInfo.max;
			
			randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
		}

		return randomValue;
	};
};
