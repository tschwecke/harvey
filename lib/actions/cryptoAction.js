var crypto = require('crypto'),
	aescmac = require('../util/aescmac.js');

module.exports = function(cryptoInfo, parseValue) {

	this.perform = function(responseAsJson, testStep, variables) {
		var output;
		cryptoInfo.key = parseValue(cryptoInfo.key, variables, responseAsJson, testStep);
		cryptoInfo.data = parseValue(cryptoInfo.data, variables, responseAsJson, testStep);
		if (cryptoInfo.macType.toLowerCase() === 'hmac') {
			output = crypto.createHmac(cryptoInfo.algorithm, cryptoInfo.key).update(cryptoInfo.data).digest(cryptoInfo.encoding);
		}
		else if (cryptoInfo.macType.toLowerCase() === 'cmac') {
			output = aescmac(cryptoInfo.key, cryptoInfo.data);
		}

		return output;
	};
};