var assert = require('assert'),
	_ = require('underscore'),
	ExtractAction = require('../../lib/actions/extractAction.js');

describe('extractAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

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

		it('should extract the appropriate value from a JSON string', function(done) {
			//Arrange
			var responseAsJson = {
				"body": {
					"item": {
						"id": "12345"
					}
				}
			};

			var extractInfo = "body.item.id";

			var action = new ExtractAction(extractInfo);

			//Act
			var extractedString = action.perform(responseAsJson, null, null, null);

			//Assert
			assert.equal(extractedString, '12345');
			done();
		});

		it('should extract the appropriate value from an array in a JSON string', function(done) {
			//Arrange
			var responseAsJson = {
				"body": {
					"items": [{
						"id": "12345"
					}]
				}
			};

			var extractInfo = "body.items[0].id";

			var action = new ExtractAction(extractInfo);

			//Act
			var extractedString = action.perform(responseAsJson, null, null, null);

			//Assert
			assert.equal(extractedString, '12345');
			done();
		});

	});

});
