var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	cryptoAction = require('../../lib/actions/cryptoAction.js');

describe('cryptoAction', function() {

	it('should generate an HMAC', function(done) {
		//Arrange
		var cryptoInfo = {
			"macType": "HMAC",
			"algorithm": "sha1",
			"key": "a1c1f962-bc57-4109-8d49-bee9f562b321",
			"data": "fnord",
			"encoding": "hex"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var hmac = cryptoAction(cryptoInfo, variables, parseValueFn);

		//Assert
		assert(_.isString(hmac));
		assert(hmac === 'e8aba22234c15e0377717972756824e009eac345');
		done();
	});

	it('should generate a CMAC', function(done) {
		//Arrange
		var cryptoInfo = {
			"macType": "CMAC",
			"key": "1111111111111111",
			"data": "fnord"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var cmac = cryptoAction(cryptoInfo, variables, parseValueFn);
		
		//Assert
		assert(_.isString(cmac));
		assert(cmac === '1ed40ea93abdf18c2629d7fc10fd1d60');
		done();
	});

});
 
