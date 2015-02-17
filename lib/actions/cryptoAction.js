var crypto = require('crypto'),
	aescmac = require('../util/aescmac.js');

module.exports = function(actionInfo, variables, parseValueFn) {
	var output;
	actionInfo.key = parseValueFn(actionInfo.key);
	actionInfo.data = parseValueFn(actionInfo.data);
	if (actionInfo.macType.toLowerCase() === 'hmac') {
		output = crypto.createHmac(actionInfo.algorithm, actionInfo.key).update(actionInfo.data).digest(actionInfo.encoding);
	}
	else if (actionInfo.macType.toLowerCase() === 'cmac') {
		output = aescmac(actionInfo.key, actionInfo.data);
	}

	return output;
};
