var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	RemoveAction = require('../../lib/actions/removeAction.js');

describe('removeAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new RemoveAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should return undefined', function(done) {
			//Arrange
			var action = new RemoveAction({}, util.parseValue);

			//Act
			var returnedValue = action.perform();

			//Assert
			assert(_.isUndefined(returnedValue));
			done();
		});

	});

});

 
