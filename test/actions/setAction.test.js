var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js'),
	setAction = require('../../lib/actions/setAction.js');
 
describe('setAction', function() {

	it('should set the appropriate variables with plain text', function(done) {
		//Arrange
		var variablesToSet = {
			"firstVar": "fnord"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		setAction(variablesToSet, variables, parseValueFn);

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
		var parseValueFn = function(a) { return a; };
		
		//Act
		setAction(variablesToSet, variables, parseValueFn);
		
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
		var parseValueFn = function(a) { return a; };

		//Act
		setAction(variablesToSet, variables, parseValueFn);

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

		//Act
		setAction(variablesToSet, variables, util.getParseValueFacade(variables));

		//Assert
		assert(variables['firstVar']);
		assert.equal(variables['firstVar'], '12345');
		done();
	});
	
	it('should set a deeply nested variable value', function(done) {
		//Arrange
		var variablesToSet = {
			"foo.bar.bas": "fnord"
		};
		var variables = {};
		var parseValueFn = function(a) { return a; };

		//Act
		setAction(variablesToSet, variables, parseValueFn);

		//Assert
		assert(variables['foo']);
		assert(variables['foo']['bar']);
		assert.equal(variables['foo']['bar']['bas'], 'fnord');
		done();
	});

	it('should overwrite a deeply nested variable value', function(done) {
		//Arrange
		var variablesToSet = {
			"foo.bar.bas": "fnord"
		};
		var variables = {
			"foo": {
				"bar": {
					"bas": "abc",
					"bas2": "def"
				},
				"bar2": "ghi"
			}
		};
		var parseValueFn = function(a) { return a; };

		//Act
		setAction(variablesToSet, variables, parseValueFn);

		//Assert
		assert(variables['foo']);
		assert(variables['foo']['bar']);
		assert.equal(variables['foo']['bar2'], 'ghi');
		assert.equal(variables['foo']['bar']['bas'], 'fnord');
		assert.equal(variables['foo']['bar']['bas2'], 'def');
		done();
	});


});
