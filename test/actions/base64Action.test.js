var assert = require('assert'),
	_ = require('underscore'),
	Base64Action = require('../../lib/actions/base64Action.js'),
	util = require('../../lib/util/util.js');

describe('base64Action', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new Base64Action();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should base64 encode a string', function(done) {

			var encodingInfo = {
				"value": "Test"
			};

			var action = new Base64Action(encodingInfo, util.parseValue);

			//Act
			var replacedString = action.perform();

			//Assert
			assert.equal(replacedString, 'VGVzdA==');
			done();
		});

		it('should base64 encode a string using variables', function(done) {

			var encodingInfo = {
				"value": "${str}"
			};

			var variables = {
				"str": "Test"
			}

			var action = new Base64Action(encodingInfo, util.parseValue);

			//Act
			var replacedString = action.perform(null, variables);

			//Assert
			assert.equal(replacedString, 'VGVzdA==');
			done();
		});

	});

});
