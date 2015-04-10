var _ = require('underscore');
var Joi = require('joi');
var T = Joi.Types;


module.exports = function() {

	this.validateSuite = function(suite) {
		
		var err = Joi.validate(suite, suiteSchema);
		if(err) {
			throw new Error('Error while parsing suite: ' + err.message);
		}

		//Config
		if(suite.config) {
			//TODO: validate config
		}
		
		//requestTemplates
		var requestTemplateIds = [];
		if(suite.requestTemplates) {
			for(var i=0; i<suite.requestTemplates.length; i++) {
				err = Joi.validate(suite.requestTemplates[i], requestTemplateSchema);
				if(err && err.message !== 'the key (body) is not allowed') {
					throw new Error('requestTemplates[\'' + suite.requestTemplates[i].id + '\']: ' + err.message);
				}
				
				if(requestTemplateIds.indexOf(suite.requestTemplates[i].id) > -1) {
					throw new Error('The following request template id is specified more than once: \'' + suite.requestTemplates[i].id + '\'');
				}
				requestTemplateIds.push(suite.requestTemplates[i].id);
			}
		}
		
		//responseTemplates
		var responseTemplateIds = [];
		if(suite.responseTemplates) {
			for(var i=0; i<suite.responseTemplates.length; i++) {
				err = Joi.validate(suite.responseTemplates[i], responseTemplateSchema);
				if(err && err.message !== 'the key (body) is not allowed') {
					throw new Error('responseTemplates[\'' + suite.responseTemplates[i].id + '\']: ' + err.message);
				}

				if(responseTemplateIds.indexOf(suite.responseTemplates[i].id) > -1) {
					throw new Error('The following response template id is specified more than once: \'' + suite.responseTemplates[i].id + '\'');
				}
				responseTemplateIds.push(suite.responseTemplates[i].id);
			}
		}


		//setupAndTeardown
		var setupAndTeardownIds = [];
		if(suite.setupAndTeardowns) {
			for(var i=0; i<suite.setupAndTeardowns.length; i++) {
				err = Joi.validate(suite.setupAndTeardowns[i], setupAndTeardownsSchema);
				if(err) {
					throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\']: ' + err.message);
				}

				if(suite.setupAndTeardowns[i].repeat) {
					err = Joi.validate(suite.setupAndTeardowns[i].repeat, repeatSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].repeat: ' + err.message);
					}
				}

				if(suite.setupAndTeardowns[i].request) {
					err = Joi.validate(suite.setupAndTeardowns[i].request, requestSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].request: ' + err.message);
					}

					//Make sure any templates specified exist
					if(suite.setupAndTeardowns[i].request.templates) {
						verifyTemplateExistence(suite.setupAndTeardowns[i].request.templates, requestTemplateIds, 'setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].request: ');
					}
				}

				if(suite.setupAndTeardowns[i].expectedResponse) {
					err = Joi.validate(suite.setupAndTeardowns[i].expectedResponse, expectedResponseSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].expectedResponse: ' + err.message);
					}

					//Make sure any templates specified exist
					if(suite.setupAndTeardowns[i].expectedResponse.templates) {
						verifyTemplateExistence(suite.setupAndTeardowns[i].expectedResponse.templates, responseTemplateIds, 'setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].expectedResponse: ');
					}
				}

				if(suite.setupAndTeardowns[i].postActions) {
					//TODO: validate actions
				}

				setupAndTeardownIds.push(suite.setupAndTeardowns[i].id);
			}

			var duplicateIds = findDuplicateIds(suite.setupAndTeardowns);
			if(duplicateIds.length > 0) {
				throw new Error('The following setup and teardown ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}

			//Make sure that if there is a teardown specified in a setup that it exists
			for(var i=0; i<suite.setupAndTeardowns.length; i++) {
				//Make sure the corresponding teardown exists if it is specified
				if(suite.setupAndTeardowns[i].teardown) {
					verifySetupOrTeardownExistence([suite.setupAndTeardowns[i].teardown], setupAndTeardownIds, 'setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].teardown: ');
				}
			}
		}

		//tests
		if(suite.tests) {
			for(var i=0; i<suite.tests.length; i++) {
				err = Joi.validate(suite.tests[i], testSchema);
				if(err) {
					throw new Error('tests[\'' + suite.tests[i].id + '\']: ' + err.message);
				}

				//Make sure any setups specified exist
				if(suite.tests[i].setup) {
					verifySetupOrTeardownExistence(suite.tests[i].setup, setupAndTeardownIds, 'tests[\'' + suite.tests[i].id + '\'].setup: ');
				}

				//Make sure any verifications specified exist
				if(suite.tests[i].verifications) {
					verifySetupOrTeardownExistence(suite.tests[i].verifications, setupAndTeardownIds, 'tests[\'' + suite.tests[i].id + '\'].verifications: ');
				}

				//Make sure any teardowns specified exist
				if(suite.tests[i].teardown) {
					verifySetupOrTeardownExistence(suite.tests[i].teardown, setupAndTeardownIds, 'tests[\'' + suite.tests[i].id + '\'].teardown: ');
				}

				if(suite.tests[i].repeat) {
					err = Joi.validate(suite.tests[i].repeat, repeatSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].repeat: ' + err.message);
					}
				}

				if(suite.tests[i].request) {
					err = Joi.validate(suite.tests[i].request, requestSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].request: ' + err.message);
					}

					//Make sure any templates specified exist
					if(suite.tests[i].request.templates) {
						verifyTemplateExistence(suite.tests[i].request.templates, requestTemplateIds, 'tests[\'' + suite.tests[i].id + '\'].request: ');
					}
				}

				if(suite.tests[i].expectedResponse) {
					err = Joi.validate(suite.tests[i].expectedResponse, expectedResponseSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].expectedResponse: ' + err.message);
					}
					
					//Make sure any templates specified exist
					if(suite.tests[i].expectedResponse.templates) {
						verifyTemplateExistence(suite.tests[i].expectedResponse.templates, responseTemplateIds, 'tests[\'' + suite.tests[i].id + '\'].expectedResponse: ');
					}
				}

				if(suite.tests[i].postActions) {
					//TODO: validate actions
				}
			}

			var duplicateIds = findDuplicateIds(suite.tests);
			if(duplicateIds.length > 0) {
				throw new Error('The following test ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}
		}

	};

	var verifyTemplateExistence = function(desiredTemplateIds, actualTemplateIds, errorPrefix) {
		
		for(var i=0; i<desiredTemplateIds.length; i++) {
			if(actualTemplateIds.indexOf(desiredTemplateIds[i]) === -1) {
				throw new Error(errorPrefix + 'The template \'' + desiredTemplateIds[i] + '\' doesn\'t exist');
			}
		}
		
	};
	
	var verifySetupOrTeardownExistence = function(desiredSetupOrTeardownIds, actualSetupOrTeardownIds, errorPrefix) {
		
		for(var i=0; i<desiredSetupOrTeardownIds.length; i++) {
			var id = desiredSetupOrTeardownIds[i];
			if(typeof(id) === 'object') {
				id = Object.keys(id)[0];
			}
			if(actualSetupOrTeardownIds.indexOf(id) === -1) {
				throw new Error(errorPrefix + 'The setup or teardown \'' + id + '\' doesn\'t exist');
			}
		}
	};
	
	var findDuplicateIds = function(array) {
		var duplicates = [];
		for(var i=0; i<array.length-1; i++) {
			for(var j=i+1; j<array.length; j++) {
				if(array[i].id === array[j].id) {
					if(duplicates.indexOf(array[i].id) === -1) {
						duplicates.push(array[i].id);
					}
				}
			}
		}

		return duplicates;
	};
	
	//Declare the Joi schema objects
	var requestSchema = T.Object({
		"templates": T.Array().includes(T.String().min(1)),
		"oauth": T.Any(),
		"method": T.String(),
		"protocol": T.String(),
		"host": T.String(),
		"port": T.String(),
		"resource": T.String().emptyOk(),
		"headers": T.Object().allowOtherKeys(),
		"querystring": T.Object().allowOtherKeys()
		//Since body can be anything we won't validate it
	});

	var expectedResponseSchema = T.Object({
		"templates": T.Array().includes(T.String().min(1)),
		"statusCode": T.Any(),
		"headers": T.Object().allowOtherKeys(),
		"responseTime": T.Object().allowOtherKeys(),
		"bodySchema": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});

	var testSchema = T.Object({
		"id": T.String().min(1).required(),
		"skip": T.Boolean(),
		"repeat": T.Object(),
		"variables": T.Object(),
		"preActions": T.Array(),
		"request": T.Object(),
		"expectedResponse": T.Object(),
		"postActions": T.Array(),
		"setup": T.Array(),
		"verifications": T.Array(),
		"teardown": T.Array()
	});

	var repeatSchema = T.Object({
		"mode": T.String().valid('parallel', 'sequential'),
		"var": T.String().min(1).required(),
		"in": T.Any(),
		"from": T.Number().integer(),
		"to": T.Number().integer()
	}).xor('in', 'from').with('from', 'to');


	var requestTemplateSchema = T.Object({
		"id": T.String().min(1).required(),
		"oauth": T.Any(),
		"method": T.String(),
		"protocol": T.String(),
		"host": T.String(),
		"port": T.String(),
		"resource": T.String().emptyOk(),
		"headers": T.Object().allowOtherKeys(),
		"querystring": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});
	
	var responseTemplateSchema = T.Object({
		"id": T.String().min(1).required(),
		"statusCode": T.Number().integer().min(100).max(505),
		"headers": T.Object().allowOtherKeys(),
		"responseTime": T.Object().allowOtherKeys(),
		"bodySchema": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});

	var setupAndTeardownsSchema = T.Object({
		"id": T.String().min(1).required(),
		"repeat": T.Object(),
		"teardown": T.String(),
		"variables": T.Object(),
		"preActions": T.Array(),
		"request": T.Object(),
		"expectedResponse": T.Object(),
		"postActions": T.Array()
	});

	var suiteSchema = T.Object({
		"id": T.String().min(1).required(),
		"file": T.String().min(1).optional(),
		"name": T.String().min(1).optional(),
		"imports": T.Array().includes(T.Object({ "file": T.String().min(1).required() })),
		"config": T.Object(),
		"requestTemplates": T.Array(),
		"responseTemplates": T.Array(),
		"setupAndTeardowns": T.Array(),
		"tests": T.Array(),
		"suiteSetup": T.Array(),
		"suiteTeardown": T.Array()
	});
};
