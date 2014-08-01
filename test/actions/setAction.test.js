var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	SetAction = require('../../lib/actions/setAction.js');
 
describe('setAction', function() {

	describe('constructor()', function() {

		it('should return an object with a perform method', function(done) {

			//Act
			var action = new SetAction();

			//Assert
			assert(action);
			assert(_.isFunction(action.perform));

			done();
		});
	});

	describe('perform()', function() {

		it('should set the appropriate variables with plain text', function(done) {
			//Arrange
			var variablesToSet = {
				"firstVar": "fnord"
			};

			var variables = {};

			var action = new SetAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'], 'fnord');
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
			
			var action = new SetAction(variablesToSet, util.parseValue);
			
			//Act
			action.perform(null, variables);
			
			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'], 'secondaryValue');
			done();
		});

		it('should set multiple variables', function(done) {
			//Arrange
			var variablesToSet = {
				"firstVar": "valueOne",
				"secondVar": "valueTwo"
			};

			var variables = {};

			var action = new SetAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'], 'valueOne');
			assert(variables['secondVar']);
			assert.equal(variables['secondVar'], 'valueTwo');
			done();
		});

		it('should set the appropriate variables with replace action', function(done) {
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

			var variables = { response: responseAsJson };

			var action = new SetAction(variablesToSet, util.parseValue);

			//Act
			action.perform(null, variables);

			//Assert
			assert(variables['firstVar']);
			assert.equal(variables['firstVar'], '12345');
			done();
		});
		
	});

});
