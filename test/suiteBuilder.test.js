var assert = require('assert');
var _ = require('underscore');
var Status = require('../lib/util/status.js');
var SuiteBuilder = require('../lib/suiteBuilder.js');
var nock = require('nock');

nock.disableNetConnect();

describe('suiteBuilder', function() {

	describe('constructor()', function() {

		it('should return an object with a buildSuite method', function(done) {

			//Act
			var suiteBuilder = new SuiteBuilder();

			//Assert
			assert(suiteBuilder);
			assert(_.isFunction(suiteBuilder.buildSuite));

			done();
		});
	});

	describe('buildSuite()', function() {

		it('should handle simple suite', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 1);
				assert(_.isArray(result.suiteStepResults[0]));
				assert.equal(result.suiteStepResults[0].length, 1);
				var testResult = result.suiteStepResults[0][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a suite with a repeating test', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.tests[0].repeat = {
				"var": "x",
				"in": "a,b"
			};
			suite.tests[0].request.resource = "/unittest_${x}";

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest_a")
				.reply(200, "OK");
			httpMock.get("/unittest_b")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 1);
				assert(_.isArray(result.suiteStepResults[0]));
				assert.equal(result.suiteStepResults[0].length, 2);

				var testResult = result.suiteStepResults[0][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated.var, "x");
				assert.equal(testResult.repeated.value, "a");
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);

				var testResult = result.suiteStepResults[0][1];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated.var, "x");
				assert.equal(testResult.repeated.value, "b");
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);

				assert(!testResult.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a suite with a setup', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteSetup = ["testSetup"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/setup")
				.reply(200, "OK");
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 2);

				var setupResult = result.suiteStepResults[0];
				assert.equal(setupResult.id, 'testSetup');
				assert.equal(setupResult.passed, true);
				assert.equal(setupResult.repeated, null);
				assert(!setupResult.error);

				assert(_.isArray(result.suiteStepResults[1]));
				assert.equal(result.suiteStepResults[1].length, 1);
				var testResult = result.suiteStepResults[1][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a suite with a setup with a specified teardown', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteSetup = ["testSetupWithTeardown"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/setup")
				.reply(200, "OK");
			httpMock.get("/unittest")
				.reply(200, "OK");
			httpMock.get("/teardown")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 3);

				var setupResult = result.suiteStepResults[0];
				assert.equal(setupResult.id, 'testSetupWithTeardown');
				assert.equal(setupResult.passed, true);
				assert.equal(setupResult.repeated, null);
				assert(!setupResult.error);

				assert(_.isArray(result.suiteStepResults[1]));
				assert.equal(result.suiteStepResults[1].length, 1);
				var testResult = result.suiteStepResults[1][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				var teardownResult = result.suiteStepResults[2];
				assert.equal(teardownResult.id, 'testTeardown');
				assert.equal(teardownResult.passed, true);
				assert.equal(teardownResult.repeated, null);
				assert(!teardownResult.error);

				httpMock.done();
				done();
			});
		});


		it('should handle a suite with a setup that doesn\'t exist', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteSetup = ["missingSetup"];

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(err);
				assert(!result);
				assert.equal(err.message, 'Unable to find the suite setup \'missingSetup\'')
				done();
			});
		});

		it('should handle a suite with a teardown', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteTeardown = ["testTeardown"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/teardown")
				.reply(200, "OK");
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 2);
				assert(_.isArray(result.suiteStepResults[0]));
				assert.equal(result.suiteStepResults[0].length, 1);
				var testResult = result.suiteStepResults[0][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				var teardownResult = result.suiteStepResults[1];
				assert.equal(teardownResult.id, 'testTeardown');
				assert.equal(teardownResult.passed, true);
				assert.equal(teardownResult.repeated, null);
				assert(!teardownResult.error);


				httpMock.done();
				done();
			});
		});

		it('should handle a suite with a teardown that doesn\'t exist', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteTeardown = ["missingTeardown"];

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(err);
				assert(!result);
				assert.equal(err.message, 'Unable to find the suite teardown \'missingTeardown\'')
				done();
			});
		});

		it('should fail a suite that has a failing test', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(201, "Created");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(!result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 1);
				assert(_.isArray(result.suiteStepResults[0]));
				assert.equal(result.suiteStepResults[0].length, 1);
				var testResult = result.suiteStepResults[0][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, false);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				httpMock.done();
				done();
			});
		});

		it('should fail a suite that has a failing setup', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteSetup = ["testSetup"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/setup")
				.reply(201, "Created");
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(!result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 2);

				var setupResult = result.suiteStepResults[0];
				assert.equal(setupResult.id, 'testSetup');
				assert.equal(setupResult.passed, false);
				assert.equal(setupResult.repeated, null);
				assert(!setupResult.error);

				assert(_.isArray(result.suiteStepResults[1]));
				assert.equal(result.suiteStepResults[1].length, 1);
				var testResult = result.suiteStepResults[1][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				httpMock.done();
				done();
			});
		});

		it('should fail a suite with a failing teardown', function(done) {
			//Arrange
			var suiteBuilder = new SuiteBuilder();

			var config = {};
			var status = getStatusMock();
			var suite = getSuite();
			var timeout = 120;
			suite.suiteTeardown = ["testTeardown"];

			nock.cleanAll();
			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/teardown")
				.reply(201, "Created");
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = suiteBuilder.buildSuite(suite, config, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert(result);
				assert(!result.passed);
				assert(result.suiteStepResults);
				assert(_.isArray(result.suiteStepResults));
				assert.equal(result.suiteStepResults.length, 2);
				assert(_.isArray(result.suiteStepResults[0]));
				assert.equal(result.suiteStepResults[0].length, 1);
				var testResult = result.suiteStepResults[0][0];
				assert.equal(testResult.id, 'unittest');
				assert.equal(testResult.passed, true);
				assert.equal(testResult.repeated, null);
				assert(!testResult.skipped);
				assert(testResult.testStepResults);
				assert(_.isArray(testResult.testStepResults));
				assert.equal(testResult.testStepResults.length, 1);
				assert(!testResult.error);

				var teardownResult = result.suiteStepResults[1];
				assert.equal(teardownResult.id, 'testTeardown');
				assert.equal(teardownResult.passed, false);
				assert.equal(teardownResult.repeated, null);
				assert(!teardownResult.error);


				httpMock.done();
				done();
			});
		});



	});

	var getSuite = function() {
		var suite = {
			"id": "unitTestSuite",
			"tests": [{
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
			}],
			"requestTemplates": [{
				"id": "testRequestTemplate",
				"method": "GET",
				"protocol": "http",
				"host": "www.harveytest.com",
				"resource": "/unittest"
			}],
			"responseTemplates": [{
				"id": "testResponseTemplate",
				"statusCode": 200
			}],
			"setupAndTeardowns": [{
				"id": "testSetup",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/setup"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "testSetupWithTeardown",
				"teardown": "testTeardown",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/setup"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "testTeardown",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/teardown"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}]
		};

		return suite;
	};

	var getStatusMock = function() {
		return new Status();
	};

});


