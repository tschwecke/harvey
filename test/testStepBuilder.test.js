var assert = require('assert');
var _ = require('underscore');
var Status = require('../lib/util/status.js');
var TestStepBuilder = require('../lib/testStepBuilder.js');
var nock = require('nock');

nock.disableNetConnect();

describe('testStepBuilder', function() {

	describe('constructor()', function() {

		it('should return an object with a buildTestStep method', function(done) {

			//Act
			var testStepBuilder = new TestStepBuilder();

			//Assert
			assert(testStepBuilder);
			assert(_.isFunction(testStepBuilder.buildTestStep));

			done();
		});
	});

	describe('buildTestStep()', function() {

		it('should handle simple test', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var variables = {};
			var status = getStatusMock();

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			nock("http://www.harveytest.com")
				.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, true);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.responseTime);
				assert(result.rawRequest);
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 1);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert(!result.error);

				done();
			});
		});

		it('should handle repeated test', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "setup";
			var requestTemplates = [];
			var responseTemplates = [];
			var variables = {};
			var status = getStatusMock();

			var testStep = {
				"id": "unittest",
				"repeat": {
					"var": "index",
					"in": [1, 2]
				},
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest${index}"
				},
				"expectedResponse": {
					"statusCode": 200,
					"body": { "message": "OK${index}" }
				}
			};

			nock("http://www.harveytest.com")
				.get("/unittest1")
				.reply(200, { "message": "OK1"});

			nock("http://www.harveytest.com")
				.get("/unittest2")
				.reply(200, { "message": "OK2"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, results) {
				//Assert
				assert(!err);
				assert.equal(results.length, 2);
				assert.equal(results[0].id, 'unittest');
				assert.equal(results[0].testPhase, 'setup');
				assert.equal(results[0].passed, true);
				assert(results[0].timeSent);
				assert.equal(results[0].repeated.var, "index");
				assert.equal(results[0].repeated.value, 1);
				assert(results[0].responseTime);
				assert(results[0].rawRequest);
				assert(results[0].rawResponse);
				assert.equal(results[0].validationResults.length, 2);
				assert.equal(results[0].validationResults[0].id, 'statusCode');
				assert.equal(results[0].validationResults[0].valid, true);
				assert.equal(results[0].validationResults[1].id, 'body');
				assert.equal(results[0].validationResults[1].valid, true);
				assert(!results[0].error);

				assert.equal(results[1].id, 'unittest');
				assert.equal(results[1].testPhase, 'setup');
				assert.equal(results[1].passed, true);
				assert(results[1].timeSent);
				assert.equal(results[1].repeated.var, "index");
				assert.equal(results[1].repeated.value, 2);
				assert(results[1].responseTime);
				assert(results[1].rawRequest);
				assert(results[1].rawResponse);
				assert.equal(results[1].validationResults.length, 2);
				assert.equal(results[1].validationResults[0].id, 'statusCode');
				assert.equal(results[1].validationResults[0].valid, true);
				assert.equal(results[1].validationResults[1].id, 'body');
				assert.equal(results[1].validationResults[1].valid, true);
				assert(!results[1].error);

				done();
			});
		});


	});

	var getTestStep = function() {
		var testStep = {
			"id": "unittest",
			"request": {
				"method": "GET",
				"protocol": "http",
				"host": "www.harveytest.com",
				"resource": "/unittest"
			},
			"expectedResponse": {
				"statusCode": 200
			}

		};

		return testStep;
	};

	var getStatusMock = function() {
		return new Status();
	};

});

 
