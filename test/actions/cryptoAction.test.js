var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	CryptoAction = require('../../lib/actions/cryptoAction.js');

describe('cryptoAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new CryptoAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should generate an HMAC', function(done) {
			//Arrange
			var cryptoInfo = {
				"macType": "HMAC",
				"algorithm": "sha1",
				"key": "a1c1f962-bc57-4109-8d49-bee9f562b321",
				"data": "fnord",
				"encoding": "hex"
			};

			var action = new CryptoAction(cryptoInfo, util.parseValue);

			//Act
			var hmac = action.perform();

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

			var action = new CryptoAction(cryptoInfo, util.parseValue);

			//Act
			var cmac = action.perform();
			
			//Assert
			assert(_.isString(cmac));
			assert(cmac === '1ed40ea93abdf18c2629d7fc10fd1d60');
			done();
		});

	});

});
 
