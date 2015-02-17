var assert = require('assert');
var _ = require('underscore');
var Status = require('../lib/util/status.js');
var TestBuilder = require('../lib/testBuilder.js');
var nock = require('nock');

nock.disableNetConnect();

describe('testBuilder', function() {

	describe('constructor()', function() {

		it('should return an object with a buildtest method', function(done) {

			//Act
			var testBuilder = new TestBuilder();

			//Assert
			assert(testBuilder);
			assert(_.isFunction(testBuilder.buildTest));

			done();
		});
	});

	describe('buildTest()', function() {

		it('should handle simple test', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 1);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a test with a setup', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [{
				"id": "unitTestSetup",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/setupRoute"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.setup = ["unitTestSetup"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/setupRoute")
				.reply(200, "OK");
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 2);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a test with a setup that has an explicit teardown defined', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [{
				"id": "unitTestSetup",
				"teardown": "unitTestTeardown",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/setupRoute"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "unitTestTeardown",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/teardownRoute"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.setup = ["unitTestSetup"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/setupRoute")
				.reply(200, "OK");
			httpMock.get("/unittest")
				.reply(200, "OK");
			httpMock.get("/teardownRoute")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 3);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a test with a teardown', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [{
				"id": "unitTestTeardown",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/teardownRoute"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.teardown = ["unitTestTeardown"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "OK");
			httpMock.get("/teardownRoute")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 2);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a test with a verification', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [{
				"id": "unitTestVerification",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/verificationRoute"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.verifications = ["unitTestVerification"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "OK");
			httpMock.get("/verificationRoute")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 2);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a repeating test', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {
				"x": "a"
			};
			var status = getStatusMock();

			var test = getTest();
			test.repeat = {
				"var": "x",
				"in": ["a", "b"]
			};

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert(result.repeated);
				assert.equal(result.repeated.var, "x");
				assert.equal(result.repeated.value, "a");
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 1);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});


		it('should mark a failed test as failed', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(404, "Not Found");

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, false);
				assert.equal(result.repeated, null);
				assert(!result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 1);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});


		it('should return an error on a missing setup', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.setup = ['missingSetup'];


			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!result);
				assert(err);
				assert.equal(err.message, "Unable to find the setup 'missingSetup'");
				done();
			});
		});

		it('should return an error on a missing teardown', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.teardown = ['missingTeardown'];


			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!result);
				assert(err);
				assert.equal(err.message, "Unable to find the teardown 'missingTeardown'");
				done();
			});
		});

		it('should return an error on a missing verification', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.verifications = ['missingVerification'];


			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!result);
				assert(err);
				assert.equal(err.message, "Unable to find the verification 'missingVerification'");
				done();
			});
		});

		it('should skip tests', function(done) {
			//Arrange
			var testBuilder = new TestBuilder();

			var requestTemplates = [];
			var responseTemplates = [];
			var setupAndTeardowns = [];
			var variables = {};
			var status = getStatusMock();

			var test = getTest();
			test.skip = true;

			//Act
			var returnedValue = testBuilder.buildTest(test, setupAndTeardowns, requestTemplates, responseTemplates, variables, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert(result);
				assert(_.isArray(result));
				assert.equal(result.length, 1);
				result = result[0];
				assert.equal(result.id, 'unittest');
				assert.equal(result.passed, true);
				assert.equal(result.repeated, null);
				assert(result.skipped);
				assert(result.testStepResults);
				assert(_.isArray(result.testStepResults));
				assert.equal(result.testStepResults.length, 0);
				assert(!result.error);

				done();
			});
		});


	});

	var getTest = function() {
		var test = {
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

		return test;
	};

	var getStatusMock = function() {
		return new Status();
	};

});

 
