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

	describe('perform()', function() {

		it('should extract the appropriate string', function(done) {
			//Arrange
			var responseAsJson = {
				"headers": {
					"location": "/users/12345.json"
				}
			};

			var replaceInfo = {
				"value": {
					"$extract": "headers.location"
				},
				"regex": "/users/(\\d+)\\.json",
				"replacement": "$1"
			};

			var action = new ReplaceAction(replaceInfo, util.parseValue);

			//Act
			var replacedString = action.perform(responseAsJson, null, null, null);

			//Assert
			assert.equal(replacedString, '12345');
			done();
		});

	});

});
