var crypto = require('crypto');

module.exports = function(nowInfo) {

	this.perform = function(responseAsJson, testStep, variables) {
		var now = new Date(),
			tzOffset = now.getTimezoneOffset(),
			tzOffsetSign = (tzOffset < 0) ? '+' : '-',
			tzOffsetHours = (Math.floor(tzOffset / 60) < 10) ? '0' + Math.floor(tzOffset / 60) : Math.floor(tzOffset / 60),
			tzOffsetMins = ((tzOffset % 60) < 10) ? '0' + (tzOffset % 60) : tzOffset % 60,
			tzOffsetFormatted = tzOffsetSign + tzOffsetHours + tzOffsetMins,
			tzOffsetMs = now.getTimezoneOffset() * 60000,
			newNow = new Date(now.getTime() - tzOffsetMs),
			output;

		if (nowInfo.inUTC) {
			output = (nowInfo.toISOString) ? now.toISOString() : newNow.getTime();
		}
		else {
			output = (nowInfo.toISOString) ? newNow.toISOString().replace('Z', tzOffsetFormatted) : now.getTime();
		}

		return output;
	};
};