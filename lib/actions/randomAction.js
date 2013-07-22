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
		else if(randomInfo.type === "guid") {
			randomValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		}
		else if(randomInfo.type === "string") {
			randomValue = '';
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for(var i = 0; i < randomInfo.length; i++) {
				randomValue += possible.charAt(Math.floor(Math.random() * possible.length));
			}
		}

		return randomValue;
	};
};
