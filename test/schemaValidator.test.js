var assert = require('assert');
var _ = require('underscore');
var SchemaValidator = require('../lib/schemaValidator.js');

describe('SchemaValidator', function() {

	describe('constructor()', function() {

		it('should return an object with a validateSuite method', function(done) {

			//Act
			var schemaValidator = new SchemaValidator();

			//Assert
			assert(schemaValidator);
			assert(_.isFunction(schemaValidator.validateSuite));

			done();
		});
	});

	describe('validateSuite()', function() {

		it('should pass a valid suite', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();

			//Act
			schemaValidator.validateSuite(suite);

			//Assert - If no error is thrown then the test passes
			done();
		});

		it('should fail on invalid json', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = "{ this is not json }";
			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "Error while parsing suite: the value of <root> must be an object");
			done();
		});


		it('should fail on a missing setup', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests[0].setup.push('missingSetup');

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['unittest'].setup: The setup or teardown 'missingSetup' doesn't exist");
			done();
		});

		it('should fail on a missing teardown', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests[0].teardown.push('missingTeardown');

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['unittest'].teardown: The setup or teardown 'missingTeardown' doesn't exist");
			done();
		});

		it('should fail on a test using a missing request template id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests[0].request.templates.push("missingTemplateId");

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['unittest'].request: The template 'missingTemplateId' doesn't exist");
			done();
		});

		it('should fail on a test using a missing response template id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests[0].expectedResponse.templates.push("missingTemplateId");

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['unittest'].expectedResponse: The template 'missingTemplateId' doesn't exist");
			done();
		});

		it('should fail on an invalid request template', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.requestTemplates.push({
				"id": "invalidRequestTemplate",
				"foo": "bar"
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "requestTemplates['invalidRequestTemplate']: the key (foo) is not allowed");
			done();
		});

		it('should fail on a duplicate request template id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.requestTemplates.push({
				"id": "testRequestTemplate",
				"method": "GET",
				"protocol": "http",
				"host": "www.harveytest.com"
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "The following request template id is specified more than once: 'testRequestTemplate'");
			done();
		});

		it('should fail on an invalid response template', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.responseTemplates.push({
				"id": "invalidResponseTemplate",
				"foo": "bar"
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "responseTemplates['invalidResponseTemplate']: the key (foo) is not allowed");
			done();
		});

		it('should fail on a duplicate response template id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.responseTemplates.push({
				"id": "testResponseTemplate",
				"statusCode": 200
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "The following response template id is specified more than once: 'testResponseTemplate'");
			done();
		});

		it('should fail on an invalid setup', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.setupAndTeardowns.push({
				"id": "invalidSetup",
				"foo": "bar"
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "setupAndTeardowns['invalidSetup']: the key (foo) is not allowed");
			done();
		});

		it('should fail on a duplicate setup id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.setupAndTeardowns.push({
				"id": "testSetup1",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/setup1"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "The following setup and teardown ids are specified more than once: 'testSetup1'");
			done();
		});

		it('should fail on an invalid test', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests.push({
				"id": "invalidTest",
				"foo": "bar"
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['invalidTest']: the key (foo) is not allowed");
			done();
		});

		it('should fail on a duplicate test id', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests.push({
				"id": "unittest",
				"setup": ["testSetup1", "testSetup2"],
				"teardown": ["testTeardown1"],
				"verifications": ["testVerification"],
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/unittest"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "The following test ids are specified more than once: 'unittest'");
			done();
		});

		it('should fail on an invalid test repeat', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests.push({
				"id": "badtest",
				"repeat": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['badtest'].repeat: the value of var is not allowed to be undefined");
			done();
		});

		it('should fail on an invalid test request', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests.push({
				"id": "badtest",
				"request": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['badtest'].request: the key (foo) is not allowed");
			done();
		});

		it('should fail on an invalid test expectedResponse', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.tests.push({
				"id": "badtest",
				"expectedResponse": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "tests['badtest'].expectedResponse: the key (foo) is not allowed");
			done();
		});

		it('should fail on an invalid setup repeat', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.setupAndTeardowns.push({
				"id": "badSetup",
				"repeat": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "setupAndTeardowns['badSetup'].repeat: the value of var is not allowed to be undefined");
			done();
		});

		it('should fail on an invalid setup request', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.setupAndTeardowns.push({
				"id": "badSetup",
				"request": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "setupAndTeardowns['badSetup'].request: the key (foo) is not allowed");
			done();
		});

		it('should fail on an invalid setup expectedResponse', function(done) {
			//Arrange
			var schemaValidator = new SchemaValidator();

			var suite = getSuite();
			suite.setupAndTeardowns.push({
				"id": "badSetup",
				"expectedResponse": {
					"foo": "bar"
				}
			});

			var errMsg = '';

			//Act and Assert
			try {
				schemaValidator.validateSuite(suite);
			}
			catch(err) {
				errMsg = err.message
			}

			assert.equal(errMsg, "setupAndTeardowns['badSetup'].expectedResponse: the key (foo) is not allowed");
			done();
		});

	});




	var getSuite = function() {
		var suite = {
			"id": "testSuite",
			"requestTemplates": [{
				"id": "testRequestTemplate",
				"method": "GET",
				"protocol": "http",
				"host": "www.harveytest.com"
			}],
			"responseTemplates": [{
				"id": "testResponseTemplate",
				"statusCode": 200
			}],
			"setupAndTeardowns": [{
				"id": "testSetup1",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/setup1"
				},
				"expectedResponse": {
					"templates": ["testResponseTemplate"]
				}
			}, {
				"id": "testSetup2",
				"teardown": "testTeardown2",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/setup2"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "testTeardown1",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/teardown1"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "testTeardown2",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/teardown2"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}, {
				"id": "testVerification",
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/verification"
				},
				"expectedResponse": {
					"statusCode": 200
				}
			}],
			"suiteSetup": ["testSetup1", "testSetup2"],
			"suiteTeardown": ["testTeardown1"],
			"tests": [{
				"id": "unittest",
				"setup": ["testSetup1", "testSetup2"],
				"teardown": ["testTeardown1"],
				"verifications": ["testVerification"],
				"request": {
					"templates": ["testRequestTemplate"],
					"resource": "/unittest"
				},
				"expectedResponse": {
					"templates": [],
					"statusCode": 200
				}
			}]
		};

		return suite;
	};
});

 
