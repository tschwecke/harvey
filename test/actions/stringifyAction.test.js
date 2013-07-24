var assert = require('assert'),
	_ = require('underscore'),
	StringifyAction = require('../../lib/actions/stringifyAction.js');

describe('stringifyAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new StringifyAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should convert an object to a string', function(done) {
			//Arrange
			var stringifyInfo = {
				"prop1": "val1",
				"prop2": "val2"
			};

			var action = new StringifyAction(stringifyInfo);

			//Act
			var stringifiedValue = action.perform();

			//Assert
			assert(_.isString(stringifiedValue));
			assert.equal('{"prop1":"val1","prop2":"val2"}', stringifiedValue);
			done();
		});

	});

});

 
