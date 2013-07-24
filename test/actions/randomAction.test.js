var assert = require('assert'),
	_ = require('underscore'),
	RandomAction = require('../../lib/actions/randomAction.js');

describe('randomAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new RandomAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should generate a random number value', function(done) {
			//Arrange
			var randomInfo = {
				"type": "number",
				"min": 1,
				"max": 10
			};

			var action = new RandomAction(randomInfo);

			//Act
			var randomValue = action.perform();

			//Assert
			assert(_.isNumber(randomValue));
			assert(randomValue >= 1);
			assert(randomValue <= 10);
			done();
		});

		it('should generate a random string value', function(done) {
			//Arrange
			var randomInfo = {
				"type": "string",
				"length": 10
			};

			var action = new RandomAction(randomInfo);

			//Act
			var randomValue = action.perform();

			//Assert
			assert(_.isString(randomValue));
			assert(randomValue.length === 10);
			assert(/[a-zA-Z0-9]+/.test(randomValue));
			done();
		});

		it('should generate a random GUID string', function(done) {
			//Arrange
			var randomInfo = {
				"type": "guid"
			};

			var action = new RandomAction(randomInfo);

			//Act
			var randomValue = action.perform();

			//Assert
			assert(_.isString(randomValue));
			assert(randomValue.length === 36);
			assert(/^{?[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}}?$/.test(randomValue));
			done();
		});

	});

});
 
