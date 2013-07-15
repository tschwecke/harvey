var util = require('../util/util.js'),
	crypto = require('crypto');

module.exports = function(cryptoInfo) {

	this.perform = function(responseAsJson, testStep, variables) {
		var output;
		cryptoInfo.key = util.parseValue(cryptoInfo.key, variables, responseAsJson, testStep);
		cryptoInfo.data = util.parseValue(cryptoInfo.data, variables, responseAsJson, testStep);
		if (cryptoInfo.macType.toLowerCase() === 'hmac') {
			output = crypto.createHmac(cryptoInfo.algorithm, cryptoInfo.key).update(cryptoInfo.data).digest(cryptoInfo.encoding);
		}
		else if (cryptoInfo.macType.toLowerCase() === 'cmac') {
			var cipher = crypto.createCipher(cryptoInfo.algorithm, cryptoInfo.key);
			cipher.update(cryptoInfo.data, 'utf8', cryptoInfo.encoding);
			output = cipher.final(cryptoInfo.encoding);
		}

		return output;
	};
};