
 var assert = require('assert'),
	_ = require('underscore'),
	util = require('../../lib/util/util.js');

describe('util', function() {

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

		it('should throw an error on missing template ids', function(done) {
			//Arrange
			var templates = [];

			var templateIds = ["missingTemplate"];

			var item = {
				"method": "PUT",
				"resource": "/test"
			};
			var errMsg = '';

			//Act and Assert
			try {
				util.rollUpTemplates(item, templateIds, templates);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "Unable to find the template 'missingTemplate'");
			done();
		});
	});

	describe('findTestStepInfoById()', function() {
		
		it('should find test step when id is a string', function(done) {
			//Arrange
			var testSteps = [{
				"id": "foo"
			}, {
				"id": "bar"
			}];

			//Act
			var testStepInfo = util.findTestStepInfoById("bar", testSteps);
			
			//Assert
			assert(testStepInfo);
			assert.equal(testStepInfo.id, "bar");
			assert.deepEqual(testStepInfo.testStep, testSteps[1]);
			assert.deepEqual(testStepInfo.parameters, {});
			done();
		});

		it('should find test step when id is an object', function(done) {
			//Arrange
			var testSteps = [{
				"id": "foo"
			}, {
				"id": "bar"
			}];

			//Act
			var testStepInfo = util.findTestStepInfoById({ "bar": { "param1": "fnord" } }, testSteps);
			
			//Assert
			assert(testStepInfo);
			assert.equal(testStepInfo.id, "bar");
			assert.deepEqual(testStepInfo.testStep, testSteps[1]);
			assert.deepEqual(testStepInfo.parameters, { "param1": "fnord" });
			done();
		});

		it('should handle missing test step when id is a string', function(done) {
			//Arrange
			var testSteps = [{
				"id": "foo"
			}, {
				"id": "bar"
			}];

			//Act
			var testStepInfo = util.findTestStepInfoById("bas", testSteps);
			
			//Assert
			assert(testStepInfo);
			assert.equal(testStepInfo.id, "bas");
			assert.equal(testStepInfo.testStep, null);
			assert.deepEqual(testStepInfo.parameters, {});
			done();
		});

		it('should handle missing test step when id is an object', function(done) {
			//Arrange
			var testSteps = [{
				"id": "foo"
			}, {
				"id": "bar"
			}];

			//Act
			var testStepInfo = util.findTestStepInfoById({ "bas": { "param1": "fnord" } }, testSteps);
			
			//Assert
			assert(testStepInfo);
			assert.equal(testStepInfo.id, "bas");
			assert.equal(testStepInfo.testStep, null);
			assert.deepEqual(testStepInfo.parameters, { "param1": "fnord" });
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


		it('should throw an error when encountering non-existent variables', function(done) {
			//Arrange
			var value = "test${var1}String";
			var variables = {};

			//Act
			try {
				var result = util.parseValue(value, variables);
			}
			catch(e) {
				//Assert
				assert.equal(e.message, "Attempting to use a variable that has not been defined: 'var1'");
				done();
			}	
		});


		it('should handle variables whose type is an object', function(done) {
			//Arrange
			var value = "${var1}";
			var variables = {"var1": {"var2": "foo"}};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, variables.var1);
			done();
		});


		it('should handle variables whose type is an array', function(done) {
			//Arrange
			var value = "${var1}";
			var variables = {"var1": ["foo", {"foo": "bar"}]};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, variables.var1);
			done();
		});


		it('should handle variables whose type is a number', function(done) {
			//Arrange
			var value = "${var1}";
			var variables = {"var1": 12345};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.strictEqual(result, variables.var1);
			done();
		});


		it('should handle variables whose type is a boolean', function(done) {
			//Arrange
			var value = "${var1}";
			var variables = {"var1": true};

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.strictEqual(result, variables.var1);
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

		it('should handle variable substitution with JSONPath expression', function(done) {
			//Arrange
			var value = "${var.fnord[1]}";
			var variables = { "var": { "fnord": [1,2,3] } };

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, 2);
			done();
		});

		it('should handle variable substitution with JSONPath expression and return all the results', function(done) {
			//Arrange
			var value = "${{var.*.}}";
			var variables = { "var": { "fnord": true, "test": false } };

			//Act
			var result = util.parseValue(value, variables);

			//Assert
			assert.deepEqual(result, [true, false]);
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
					"value":  "${response.headers.location}",
					"regex": "/users/(\\d+)\\.json",
					"replacement": "$1"
				}
			};

			//Act
			var result = util.parseValue(value, { response: responseAsJson });

			//Assert
			assert.deepEqual(result, "12345");
			done();
		});

	});
});
  
