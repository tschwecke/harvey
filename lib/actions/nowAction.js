module.exports = function(actionInfo, variables, parseValueFn) {
	var now = new Date(),
		tzOffset = now.getTimezoneOffset(),
		tzOffsetSign = (tzOffset < 0) ? '+' : '-',
		tzOffsetHours = (Math.floor(tzOffset / 60) < 10) ? '0' + Math.floor(tzOffset / 60) : Math.floor(tzOffset / 60),
		tzOffsetMins = ((tzOffset % 60) < 10) ? '0' + (tzOffset % 60) : tzOffset % 60,
		tzOffsetFormatted = tzOffsetSign + tzOffsetHours + tzOffsetMins,
		tzOffsetMs = now.getTimezoneOffset() * 60000,
		newNow = new Date(now.getTime() - tzOffsetMs),
		output;

	if (actionInfo.inUTC) {
		output = (actionInfo.toISOString) ? now.toISOString() : newNow.getTime();
	}
	else {
		output = (actionInfo.toISOString) ? newNow.toISOString().replace('Z', tzOffsetFormatted) : now.getTime();
	}

	return output;
};