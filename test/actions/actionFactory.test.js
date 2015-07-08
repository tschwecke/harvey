var assert = require('assert'),
	_ = require('underscore'),
	actionFactory = require('../../lib/actions/actionFactory.js'),
	path = require('path');

describe('actionFactory', function() {

	describe('require()', function() {

		it('should return an object with the appropriate methods', function(done) {

			//Assert
			assert(actionFactory);
			assert(_.isFunction(actionFactory.addAction));
			assert(_.isFunction(actionFactory.getAction));

			done();
		});
	});

	describe('getAction()', function() {

		it('should return the appropriate built-in action', function(done) {

			//Act
			var action = actionFactory.getAction('now');

			//Assert
			assert(action);

			done();
		});

		it('should return the appropriate custom action', function(done) {

			//Arrange
			actionFactory.addAction('echo', path.resolve('test/actions/helpers/echoAction.js'));

			//Act
			var action = actionFactory.getAction('echo');

			//Assert
			assert(action);
			assert(action('test string'), 'test string');

			done();
		});

		it('should throw an error for an unknown action', function(done) {

			//Act and assert
			assert.throws(function() {actionFactory.getAction('doesNotExist')}, Error, 'No exception thrown for unkown action');

			done();
		});

	});

});