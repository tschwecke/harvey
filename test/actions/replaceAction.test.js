var assert = require('assert'),
	_ = require('underscore'),
	ReplaceAction = require('../../lib/actions/replaceAction.js'),
	util = require('../../lib/util/util.js');

describe('replaceAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new ReplaceAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

});
