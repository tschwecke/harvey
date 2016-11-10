var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	convertAction = require('../../lib/actions/convertAction.js');

describe('convertAction', function() {

	it('should convert a string to an int', function(done) {
		//Arrange
		var actionInfo = {
			"to": "number",
      "value": "123"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var convertedValue = convertAction(actionInfo, variables, parseValueFn);

		//Assert
		assert.strictEqual(convertedValue, 123);
		done();
	});


	it('should convert a string to a date', function(done) {
		//Arrange
		var actionInfo = {
			"to": "date",
      "value": "2016-11-09T13:43:22z"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var convertedValue = convertAction(actionInfo, variables, parseValueFn);

		//Assert
		assert.strictEqual(convertedValue.getTime(), 1478699002000);
		done();
	});

	it('should convert an int to a string', function(done) {
		//Arrange
		var actionInfo = {
			"to": "string",
      "value": 123
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		var convertedValue = convertAction(actionInfo, variables, parseValueFn);

		//Assert
		assert.strictEqual(convertedValue, '123');
		done();
	});

});