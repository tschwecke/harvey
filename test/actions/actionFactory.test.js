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

		it('should return the appropriate built-in action', function(done) {

			//Assert
			actionFactory.addAction('echo', path.resolve('test/actions/helpers/echoAction.js'));

			//Act
			var action = actionFactory.getAction('echo', 'test string');

			//Assert
			assert(action);
			assert(action.perform(), 'test string');

			done();
		});
	});

});