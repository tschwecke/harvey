var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	PushAction = require('../../lib/actions/pushAction.js');
 
describe('pushAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new PushAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should push the appropriate variables into an array', function(done) {
			//Arrange
			var variablesToSet = {
				"firstVar": "fnord"
			};

			var variables = {};

			var action = new PushAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'][0], 'fnord');
			done();
		});

		it('should push multiple values for the appropriate variables into an array', function(done) {
			//Arrange
			var variablesToSet1 = {
					"firstVar": "fnord"
				},
				variablesToSet2 = {
					"firstVar": "again"
				};

			var variables = {};

			var action1 = new PushAction(variablesToSet1, util.parseValue);
			var action2 = new PushAction(variablesToSet2, util.parseValue);

			//Act
			action1.perform(null, variables);
			action2.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'][0], 'fnord');
			assert.equal(variables['firstVar'][1], 'again');
			done();
		});

		it('should overwrite the value of an existing variable', function(done) {
			//Arrange
			var variablesToSet = {
				"firstVar": "secondaryValue"
			};
			
			var variables = {
				"firstVar": "initialValue"
			};
			
			var action = new PushAction(variablesToSet, util.parseValue);
			
			//Act
			action.perform(null, variables);
			
			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'][0], 'secondaryValue');
			done();
		});

		it('should push into multiple variables', function(done) {
			//Arrange
			var variablesToSet = {
				"firstVar": "valueOne",
				"secondVar": "valueTwo"
			};

			var variables = {};

			var action = new PushAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'][0], 'valueOne');
			assert(variables['secondVar']);
			assert.equal(variables['secondVar'][0], 'valueTwo');
			done();
		});

		it('should push the appropriate variables into an array with replace action', function(done) {
			//Arrange
			var responseAsJson = {
				"headers": {
					"location": "/users/12345.json"
				}
			};

			var variablesToSet = {
				"firstVar": {
					"$replace": {
						"value": "/users/12345.json",
						"regex": "/users/(\\d+)\\.json",
						"replacement": "$1"
					}
				}
			};

			var variables = {response: responseAsJson};

			var action = new PushAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar'][0]);
			assert.equal(variables['firstVar'][0], '12345');
			done();
		});

		
	});

});
