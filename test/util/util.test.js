
 var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js');

describe ('util', function() {

	describe('rollUpTemplates()', function() {
		
		it('should work', function(done) {
			//Arrange
			var templates = [{
				"id": "simpleText.request",
				"protocol": "http",
				"host": "localhost"
			}, {
				"id": "simpleText.request.postBody",
				"headers": {
					"content-type": "application/json"
				},
				"body": {
					"title": "Test Title",
					"type": "HTML",
					"description": "This is a test simpleText",
					"text": "<p>hello world</p>",
					"authors": [{
						"id": "fnord",
						"firstName": "fnord",
						"lastName": "opus"
					}]
				}
			}];

			var templateIds = ["simpleText.request", "simpleText.request.postBody"];

			var item = {
				"method": "PUT",
				"resource": "/test"
			};

			//Act
			var result = util.rollUpTemplates(item, templateIds, templates);
			
			//Assert
			assert.deepEqual(result, {
				"id":"simpleText.request.postBody",
				"protocol":"http",
				"host":"localhost",
				"headers":{
					"content-type":"application/json"
				},
				"body":{
					"title":"Test Title",
					"type":"HTML",
					"description":"This is a test simpleText",
					"text":"<p>hello world</p>",
					"authors":[{
						"id":"fnord",
						"firstName":"fnord",
					"lastName":"opus"
					}]
				},
				"method":"PUT",
				"resource":"/test"
			});
			done();
		});
	});

	describe('parseValue()', function() {

		it('should return a plain string', function(done) {
			//Arrange
			var value = "testString";

			//Act
			var result = util.parseValue(value);

			//Assert
			assert.equal(result, value);
			done();
		});

		it('should substitute a variable in a string with the correct value', function(done) {
			//Arrange
			var value = "test${var}String";
			var variables = {"var": "test"};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.equal(result, "testtestString");
			done();
		});


		it('should handle multiple variable substitution', function(done) {
			//Arrange
			var value = "test${var1}String${var2}";
			var variables = {"var1": "test", "var2": "foo"};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.equal(result, "testtestStringfoo");
			done();
		});


		it('should replace non-existent variables with an empty string', function(done) {
			//Arrange
			var value = "test${var1}String";
			var variables = {};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.equal(result, "testString");
			done();
		});


		it('should return a plain object', function(done) {
			//Arrange
			var value = { "testProp": "testValue"};

			//Act
			var result = util.parseValue(value);

			//Assert
			assert.deepEqual(result, value);
			done();
		});

		it('should handle variable substitution on the value of an object property', function(done) {
			//Arrange
			var value = { "testProp": "test${var}Value"};
			var variables = {"var": "test"};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, {"testProp": "testtestValue"});
			done();
		});

		it('should return a plain nested object', function(done) {
			//Arrange
			var value = { "testProp": "testValue", "nestedObject": { "nestedProp": "nestedValue"}};

			//Act
			var result = util.parseValue(value);

			//Assert
			assert.deepEqual(result, value);
			done();
		});
		
		it('should return a nested object with an array', function(done) {
			//Arrange
			var value = {
				"testProp": "testValue",
				"nestedObject": {
					"nestedArray": [{
						"id": 1
					}, {
						"id": 2
					}]
				}
			};

			//Act
			var result = util.parseValue(value);

			//Assert
			assert.deepEqual(result, value);
			done();
		});

		it('should handle variable substitution on the value of a nested object property', function(done) {
			//Arrange
			var value = { "testProp": "testValue", "nestedObject": { "nestedProp": "nested${var}Value"}};
			var variables = {"var": "test"};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, { "testProp": "testValue", "nestedObject": { "nestedProp": "nestedtestValue"}});
			done();
		});

		it('should handle variable substitution on the value of an array element', function(done) {
			//Arrange
			var value = ["val1${var}", "val2"];
			var variables = {"var": "test"};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, ["val1test", "val2"]);
			done();
		});

		it('should handle an action', function(done) {
			//Arrange
			var responseAsJson = {
				"headers": {
					"location": "/users/12345.json"
				}
			};

			var value = {
				"$replace": {
					"value": {
						"$extract": "headers.location"
					},
					"regex": "/users/(\\d+)\\.json",
					"replacement": "$1"
				}
			};

			//Act
			var result = util.parseValue(value, null, responseAsJson);

			//Assert
			assert.deepEqual(result, "12345");
			done();
		});

	});
});
  
