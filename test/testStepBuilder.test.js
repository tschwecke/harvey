var assert = require('assert');
var _ = require('underscore');
var Status = require('../lib/util/status.js');
var TestStepBuilder = require('../lib/testStepBuilder.js');
var nock = require('nock');
var path = require('path');

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
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle a test that posts data', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "POST",
					"protocol": "http",
					"host": "www.harveytest.com",
					"port": 80,
					"resource": "/unittest",
					"headers": {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					"body": {
						"a": "b"
					}
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.post("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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


		it('should handle a failed request', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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

			var httpMock = nock("http://www.harveytest.com", {allowUnmocked: false})

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert.equal(result.validationResults.length, 0);
				assert(result.error);
				httpMock.done();
				done();
			});
		});

		it('should handle an invalid status code', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
				.reply(404, "Not Found");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.responseTime);
				assert(result.rawRequest);
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 1);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, false);
				assert.equal(result.validationResults[0].expectedValue, 200);
				assert.equal(result.validationResults[0].actualValue, 404);
				assert.equal(result.validationResults[0].description, 'Unexpected value');
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a timeout exception', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
				.delayConnection(20000)
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.rawRequest);
				assert.equal(result.validationResults.length, 0);
				assert(result.error);

				httpMock.done();
				done();
			});
		});

		it('should allow the timeout to be overridden by an individual test', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 40000;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest",
          "timeout": 120
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.delayConnection(2000)
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.rawRequest);
				assert.equal(result.validationResults.length, 0);
				assert(result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle sending a body', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "POST",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest",
					"body": {
						"message": "This is a test"
					}
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.post("/unittest", {"message": "This is a test"})
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle validating the body', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
						"status": "ok"
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(result.validationResults.length, 2);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'body');
				assert.equal(result.validationResults[1].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a validation failure in the body', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
						"status": "really ok"
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.responseTime);
				assert(result.rawRequest);
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 2);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'body');
				assert.equal(result.validationResults[1].valid, false);
				assert(result.validationResults[1].diffs);
				assert.equal(result.validationResults[1].diffs.length, 1);
				assert.equal(result.validationResults[1].diffs[0].actual, 'ok');
				assert.equal(result.validationResults[1].diffs[0].expected, 'really ok');
				assert.equal(result.validationResults[1].diffs[0].property, 'status');
				assert.equal(result.validationResults[1].description, 'Body does not match the expected value');
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle sending a header', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"headers": {
						"x-foo": "bar"
					},
					"resource": "/unittest"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com", { "reqHeaders": { "x-foo": "bar" }});
			httpMock.get("/unittest")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle validating a header', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
					"headers": {
						"x-foo": "bar"
					},
					"body": {
						"status": "ok"
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"}, {"x-foo": "bar"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(result.validationResults.length, 3);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'header');
				assert.equal(result.validationResults[1].valid, true);
				assert.equal(result.validationResults[2].id, 'body');
				assert.equal(result.validationResults[2].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a validation failure in a header', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
					"headers": {
						"x-foo": "baz"
					},
					"body": {
						"status": "ok"
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"}, {"x-foo": "bar"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.responseTime);
				assert(result.rawRequest);
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 3);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'header');
				assert.equal(result.validationResults[1].valid, false);
				assert.equal(result.validationResults[1].expectedValue, 'baz');
				assert.equal(result.validationResults[1].actualValue, 'bar');
				assert.equal(result.validationResults[1].description, "The header 'x-foo' does not match the expected value");
				assert.equal(result.validationResults[2].id, 'body');
				assert.equal(result.validationResults[2].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle an empty value in a header', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"headers": {
						"x-foo": ""
					},
					"resource": "/unittest"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(result.rawRequest, "GET http://www.harveytest.com/unittest HTTP 1.1\n");
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 1);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle an empty variable in a header', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = { "foo": "" };
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"headers": {
						"x-foo": "${foo}"
					},
					"resource": "/unittest"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, {"status": "ok"});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(result.rawRequest, "GET http://www.harveytest.com/unittest HTTP 1.1\n");
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 1);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});


		it('should handle creating an oauth token', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [{
				"id": "oauth",
				"oauth": {
					"consumerKey": "${oauthConsumerKey}",
					"consumerSecret": "${oauthConsumerSecret}",
					"timestamp": "${oauthTimestamp}",
					"nonce": "${oauthNonce}"
				}
			}];
			var responseTemplates = [];
			var parameters = {};
			var variables = {
				"oauthConsumerKey": "paf-author",
				"oauthConsumerSecret": "fruit#loops",
				"oauthTimestamp": "1428594693",
				"oauthNonce": "8910529618925908193"
			};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"templates": ["oauth"],
					"method": "GET",
					"protocol": "http",
					"host": "paf.tim.net",
					"port": "8080",
					"resource": "/paf-hub/resources/sequences/123"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};
			var httpMock = nock("http://paf.tim.net:8080", {
		      reqheaders: {
		        'authorization': 'OAuth realm="http%3A%2F%2Fpaf.tim.net%3A8080%2Fpaf-hub%2Fresources%2Fsequences%2F123", oauth_consumer_key="paf-author", oauth_nonce="8910529618925908193", oauth_signature="u2YQh%2B%2FGk5eplzC8%2BHT%2FFNlhXSY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1428594693", oauth_version="1.0"'
		      }
		    })
			httpMock.get("/paf-hub/resources/sequences/123")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle creating an oauth token with a body', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"oauth": {
						"consumerKey": "paf-author",
						"consumerSecret": "fruit#loops",
						"timestamp": "1428594693",
						"nonce": "8910529618925908193"
					},
					"method": "POST",
					"protocol": "http",
					"host": "paf.tim.net",
					"port": "8080",
					"resource": "/paf-hub/resources/sequences/123",
					"body": {
						"foo": "bar"
					}
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};
			var httpMock = nock("http://paf.tim.net:8080", {
		      reqheaders: {
		        'authorization': 'OAuth realm="http%3A%2F%2Fpaf.tim.net%3A8080%2Fpaf-hub%2Fresources%2Fsequences%2F123", oauth_body_hash="kkKdwTtXCmOHK9HooaEyz8mEINE%3D", oauth_consumer_key="paf-author", oauth_nonce="8910529618925908193", oauth_signature="KtqOzLbjJtvmowwo76UBo1PubI4%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1428594693", oauth_version="1.0"'
		      }
		    })
			httpMock.post("/paf-hub/resources/sequences/123")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle creating an oauth token with query parameters (one before oauth_* and one after when sorted)', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"oauth": {
						"consumerKey": "paf-author",
						"consumerSecret": "fruit#loops",
						"timestamp": "1428594693",
						"nonce": "8910529618925908193"
					},
					"method": "GET",
					"protocol": "http",
					"host": "paf.tim.net",
					"port": "8080",
					"resource": "/paf-hub/resources/sequences/123?a_filter=abc&z_filter=xyz"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};
			var httpMock = nock("http://paf.tim.net:8080", {
		      reqheaders: {
		        'authorization': 'OAuth realm="http%3A%2F%2Fpaf.tim.net%3A8080%2Fpaf-hub%2Fresources%2Fsequences%2F123", oauth_consumer_key="paf-author", oauth_nonce="8910529618925908193", oauth_signature="apcHo%2FZz26JTeIj6RQbLmaTZXGM%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1428594693", oauth_version="1.0"'
		      }
		    })
			httpMock.get("/paf-hub/resources/sequences/123?a_filter=abc&z_filter=xyz")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle creating an oauth token with query parameters containing special values', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"oauth": {
						"consumerKey": "paf-author",
						"consumerSecret": "fruit#loops",
						"timestamp": "1428594693",
						"nonce": "8910529618925908193"
					},
					"method": "GET",
					"protocol": "http",
					"host": "paf.tim.net",
					"port": "8080",
					"resource": "/oauth?a_filter=+!'()*-._~%20%21%27%28%29%2A%2D%2E%5F%7E"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};
			var httpMock = nock("http://paf.tim.net:8080", {
		      reqheaders: {
		        'authorization': 'OAuth realm="http%3A%2F%2Fpaf.tim.net%3A8080%2Foauth", oauth_consumer_key="paf-author", oauth_nonce="8910529618925908193", oauth_signature="k0bPMIENqZYlc%2FtuGiwmVH83C34%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1428594693", oauth_version="1.0"'
		      }
		    })
			// The request string format nock needs in order to match the resource above
			httpMock.get("/oauth?a_filter=%20!%27()*-._~%20!%27()*-._~")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle a test step with parameters', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = { "param1": "foo" };
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest/${@parameters.param1}"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest/foo")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle a test step with parameters and a return value', function(done) {

			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = { "param1": "foo", "@returns": "returnedValue" };
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest/${@parameters.param1}"
				},
				"expectedResponse": {
					"statusCode": 200
				},
				"postActions": [{
					"$set": {
						"@returns": "bar"
					}
				}]
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest/foo")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(variables.returnedValue, 'bar');
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle a test step with parameter values that contain variable references', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = { "param1": "${var1}" };
			var variables = { "var1": "foo" };
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"request": {
					"method": "GET",
					"protocol": "http",
					"host": "www.harveytest.com",
					"resource": "/unittest/${@parameters.param1}"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest/foo")
				.reply(200, "OK");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, 120, status);

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
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

		it('should handle repeated test with array of values embedded in a string', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "setup";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"repeat": {
					"var": "index",
					"in": "a,b"
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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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

			var testPhase = "testSetup";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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

			var httpMock = nock("http://www.harveytest.com");
			httpMock.get("/unittest1")
				.reply(200, { "returnValue": 2});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'testSetup', 'testPhase is incorrect');
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

		it('should handle an error from a preAction', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"preActions": [{
					"$missingAction": {
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

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'test', 'testPhase is incorrect');
				assert.equal(result.passed, false, 'test marked as a success');
				assert(result.timeSent, 'timeSent is missing');
				assert.equal(result.repeated, null, 'test was repeated when it shouldn\'t be');
				assert(result.error);

				done();
			});
		});

		it('should execute any postActions', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "suiteSetup";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);
			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'suiteSetup', 'testPhase is incorrect');
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


		it('should handle an error from a postAction', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "suiteSetup";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
					"$missingAction": {
						"var1": "${response.body.foo}"
					}
				}],
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, { "foo": 2});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);
			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'suiteSetup', 'testPhase is incorrect');
				assert.equal(result.passed, false, 'test marked as a success');
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
				assert(result.error);

				httpMock.done();
				done();
			});
		});


		it('should execute any pre and post actions even without a request', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "suiteTeardown";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'suiteTeardown', 'testPhase is incorrect');
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

		it('should handle an error from a postaction even without a request', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "suiteTeardown";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

			var testStep = {
				"id": "unittest",
				"postActions": [{
					"$missingAction": {
						"var1": 1
					}
				}]
			};

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'suiteTeardown', 'testPhase is incorrect');
				assert.equal(result.passed, false, 'test marked as a success');
				assert(result.timeSent, 'timeSent is missing');
				assert.equal(result.repeated, null, 'test was repeated when it shouldn\'t be');
				assert.equal(result.validationResults.length, 0, 'wrong number of validation results sent back');
				assert(result.error);

				done();
			});
		});

		it('should pass the test step to any action called', function(done) {
			//Arrange
			var actionFactory = require('../lib/actions/actionFactory.js');
			actionFactory.addAction('returnTestStep', path.resolve('test/actions/helpers/returnTestStepAction.js'));

			var testStepBuilder = new TestStepBuilder();

			var testPhase = "suiteSetup";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
						"var1": { "$returnTestStep": "" }
					}
				}],
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, { "foo": 2});

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);
			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {

				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest', 'id is incorrect');
				assert.equal(result.testPhase, 'suiteSetup', 'testPhase is incorrect');
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
				assert(variables.var1, 'The test step passed to the custom "returnTestStep" action was not returned');
				assert.equal(variables.var1.id, testStep.id, 'The test step passed to the custom "returnTestStep" action is incorrect');

				httpMock.done();
				done();
			});
		});

		it('should handle any extractors in the expected response', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
						"$length": 14
					}
				}
			};

			var httpMock = nock("http://www.harveytest.com")
			httpMock.get("/unittest")
				.reply(200, "This is a test");

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

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
				assert.equal(result.validationResults.length, 2);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, true);
				assert.equal(result.validationResults[1].id, 'body');
				assert.equal(result.validationResults[1].valid, true);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});

		it('should handle an exception from the request', function(done) {
			//Arrange
			var testStepBuilder = new TestStepBuilder();

			var testPhase = "test";
			var requestTemplates = [];
			var responseTemplates = [];
			var parameters = {};
			var variables = {};
			var status = getStatusMock();
			var timeout = 120;

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
				.reply(new Error('test'));

			//Act
			var returnedValue = testStepBuilder.buildTestStep(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, timeout, status);

			assert(_.isFunction(returnedValue));

			returnedValue(function(err, result) {
				//Assert
				assert(!err);
				assert.equal(result.id, 'unittest');
				assert.equal(result.testPhase, 'test');
				assert.equal(result.passed, false);
				assert(result.timeSent);
				assert.equal(result.repeated, null);
				assert(result.responseTime);
				assert(result.rawRequest);
				assert(result.rawResponse);
				assert.equal(result.validationResults.length, 1);
				assert.equal(result.validationResults[0].id, 'statusCode');
				assert.equal(result.validationResults[0].valid, false);
				assert(!result.error);

				httpMock.done();
				done();
			});
		});


	});


	var getStatusMock = function() {
		return new Status();
	};

});
