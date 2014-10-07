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

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
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

				httpMock.done();
				done();
			});
		});

		it('should handle repeated test with array of values', function(done) {
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
					"in": ['a', 'b']
				},
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest${index}"
				},
				"expectedResponse": {
					"statusCode": 200,
					"body": { "message": "OK-${index}" }
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittesta")
				.reply(200, { "message": "OK-a"});

			httpMock.get("/unittestb")
				.reply(200, { "message": "OK-b"});

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
				assert.equal(results[0].repeated.value, 'a');
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
				assert.equal(results[1].repeated.value, 'b');
				assert(results[1].responseTime);
				assert(results[1].rawRequest);
				assert(results[1].rawResponse);
				assert.equal(results[1].validationResults.length, 2);
				assert.equal(results[1].validationResults[0].id, 'statusCode');
				assert.equal(results[1].validationResults[0].valid, true);
				assert.equal(results[1].validationResults[1].id, 'body');
				assert.equal(results[1].validationResults[1].valid, true);
				assert(!results[1].error);

				httpMock.done();
				done();
			});
		});

		it('should handle repeated test with from and to', function(done) {
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
					"from": 1,
					"to": 2
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

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest1")
				.reply(200, { "message": "OK1"});

			httpMock.get("/unittest2")
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

				httpMock.done();
				done();
			});
		});

		it('should execute any preActions', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var variables = {};
			var status = getStatusMock();

			var testStep = {
				"id": "unittest",
				"preActions": [{
					"$set": {
						"var1": 1
					}
				}],
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest${var1}"
				},
				"expectedResponse": {
					"statusCode": 200,
					"body": {
						"returnValue": 2
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest1")
				.reply(200, { "returnValue": 2});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'test', 'testPhase is incorrect');
				assert.equal(result.passed, true, 'test marked as a failure');
				assert(result.timeSent, 'timeSent is missing');
				assert.equal(result.repeated, null, 'test was repeated when it shouldn\'t be');
				assert(result.responseTime, 'responseTime is missing');
				assert(result.rawRequest, 'rawRequest is missing');
				assert(result.rawResponse, 'rawResponse is missing');
				assert.equal(result.validationResults.length, 2, 'wrong number of validation results sent back');
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'body');
				assert.equal(result.validationResults[1].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});
		it('should execute any postActions', function(done) {
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
					"statusCode": 200,
					"body": {
						"foo": 2
					}
				},
				"postActions": [{
					"$set": {
						"var1": "${response.body.foo}"
					}
				}],
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, { "foo": 2});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, variables, status);
			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'test', 'testPhase is incorrect');
				assert.equal(result.passed, true, 'test marked as a failure');
				assert(result.timeSent, 'timeSent is missing');
				assert.equal(result.repeated, null, 'test was repeated when it shouldn\'t be');
				assert(result.responseTime, 'responseTime is missing');
				assert(result.rawRequest, 'rawRequest is missing');
				assert(result.rawResponse, 'rawResponse is missing');
				assert.equal(result.validationResults.length, 2, 'wrong number of validation results sent back');
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'body');
				assert.equal(result.validationResults[1].valid, true);
				assert(!result.error);

				//Make sure the postAction executed
				assert.equal(variables.var1, 2, 'variable set by postAction has the wrong value');

				httpMock.done();
				done();
			});
		});


		it('should execute any pre and post actions even without a request', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var variables = {};
			var status = getStatusMock();

			var testStep = {
				"id": "unittest",
				"preActions": [{
					"$set": {
						"var1": 1
					}
				}],
				"postActions": [{
					"$set": {
						"var2": 2
					}
				}]
			};

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'test', 'testPhase is incorrect');
				assert.equal(result.passed, true, 'test marked as a failure');
				assert(result.timeSent, 'timeSent is missing');
				assert.equal(result.repeated, null, 'test was repeated when it shouldn\'t be');
				assert.equal(result.validationResults.length, 0, 'wrong number of validation results sent back');
				assert(!result.error);

				//Make sure the actions executed
				assert.equal(variables.var1, 1, 'variable set by preAction has the wrong value');
				assert.equal(variables.var2, 2, 'variable set by postAction has the wrong value');

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

 
