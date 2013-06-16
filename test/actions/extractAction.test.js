var assert = require('assert'),
	_ = require('underscore'),
	ExtractAction = require('../../lib/actions/extractAction.js');

describe ('extractAction', function() {

	describe ('constructor()', function() {

		it ('should return an object with a perform method', function(done) {

			//Act
			var action = new ExtractAction();

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

			var extractInfo = "headers.location";

			var action = new ExtractAction(extractInfo);

			//Act
			var extractedString = action.perform(responseAsJson, null, null, null);

			//Assert
			assert.equal(extractedString, '/users/12345.json');
			done();
		});

	});

});
