var _ = require('underscore');
var Joi = require('joi');


module.exports = function() {

	this.validateSuite = function(suite) {

		var err = Joi.validate(suite, suiteSchema).error;
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
				err = Joi.validate(suite.requestTemplates[i], requestTemplateSchema).error;
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
				err = Joi.validate(suite.responseTemplates[i], responseTemplateSchema).error;
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
				err = Joi.validate(suite.setupAndTeardowns[i], setupAndTeardownsSchema).error;
				if(err) {
					throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\']: ' + err.message);
				}

				if(suite.setupAndTeardowns[i].repeat) {
					err = Joi.validate(suite.setupAndTeardowns[i].repeat, repeatSchema).error;
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].repeat: ' + err.message);
					}
				}

				if(suite.setupAndTeardowns[i].request) {
					err = Joi.validate(suite.setupAndTeardowns[i].request, requestSchema).error;
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].request: ' + err.message);
					}

					//Make sure any templates specified exist
					if(suite.setupAndTeardowns[i].request.templates) {
						verifyTemplateExistence(suite.setupAndTeardowns[i].request.templates, requestTemplateIds, 'setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].request: ');
					}
				}

				if(suite.setupAndTeardowns[i].expectedResponse) {
					err = Joi.validate(suite.setupAndTeardowns[i].expectedResponse, expectedResponseSchema).error;
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
				err = Joi.validate(suite.tests[i], testSchema).error;
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
					err = Joi.validate(suite.tests[i].repeat, repeatSchema).error;
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].repeat: ' + err.message);
					}
				}

				if(suite.tests[i].request) {
					err = Joi.validate(suite.tests[i].request, requestSchema).error;
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].request: ' + err.message);
					}

					//Make sure any templates specified exist
					if(suite.tests[i].request.templates) {
						verifyTemplateExistence(suite.tests[i].request.templates, requestTemplateIds, 'tests[\'' + suite.tests[i].id + '\'].request: ');
					}
				}

				if(suite.tests[i].expectedResponse) {
					err = Joi.validate(suite.tests[i].expectedResponse, expectedResponseSchema).error;
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
	var requestSchema = Joi.object({
		templates: Joi.array().items(Joi.string().min(1)),
		oauth: Joi.any(),
		method: Joi.string(),
		protocol: Joi.string(),
		host: Joi.string(),
		port: Joi.string(),
		resource: Joi.string().min(0),
		headers: Joi.object(),
		querystring: Joi.object(),
		timeout: Joi.number().integer()
		//Since body can be anything we won't validate it
	});

	var expectedResponseSchema = Joi.object({
		templates: Joi.array().items(Joi.string().min(1)),
		statusCode: Joi.any(),
		headers: Joi.object(),
		responseTime: Joi.object(),
		bodySchema: Joi.object()
		//Since body can be a string or object we need to validate it separately
	});

	var testSchema = Joi.object({
		id: Joi.string().min(1).required(),
		skip: Joi.boolean(),
		repeat: Joi.object(),
		variables: Joi.object(),
		preActions: Joi.array(),
		request: Joi.object(),
		expectedResponse: Joi.object(),
		postActions: Joi.array(),
		setup: Joi.array(),
		verifications: Joi.array(),
		teardown: Joi.array()
	});

	var repeatSchema = Joi.object({
		mode: Joi.string().valid('parallel', 'sequential'),
		var: Joi.string().min(1).required(),
		in: Joi.any(),
		from: Joi.number().integer(),
		to: Joi.number().integer()
	}).xor('in', 'from').with('from', 'to');


	var requestTemplateSchema = Joi.object({
		id: Joi.string().min(1).required(),
		oauth: Joi.any(),
		method: Joi.string(),
		protocol: Joi.string(),
		host: Joi.string(),
		port: Joi.string(),
		resource: Joi.string().empty(''),
		headers: Joi.object(),
		querystring: Joi.object(),
		timeout: Joi.number().integer()
		//Since body can be a string or object we need to validate it separately
	});

	var responseTemplateSchema = Joi.object({
		id: Joi.string().min(1).required(),
		statusCode: Joi.number().integer().min(100).max(505),
		headers: Joi.object(),
		responseTime: Joi.object(),
		bodySchema: Joi.object()
		//Since body can be a string or object we need to validate it separately
	});

	var setupAndTeardownsSchema = Joi.object({
		id: Joi.string().min(1).required(),
		repeat: Joi.object(),
		teardown: Joi.string(),
		variables: Joi.object(),
		preActions: Joi.array(),
		request: Joi.object(),
		expectedResponse: Joi.object(),
		postActions: Joi.array()
	});

	var suiteSchema = Joi.object().keys({
		id: Joi.string().min(1).required(),
		file: Joi.string().min(1).optional(),
		name: Joi.string().min(1).optional(),
		imports: Joi.array().items(Joi.object({ file: Joi.string().min(1).required() })),
		config: Joi.object(),
		requestTemplates: Joi.array(),
		responseTemplates: Joi.array(),
		setupAndTeardowns: Joi.array(),
		suiteSetup: Joi.array(),
		suiteTeardown: Joi.array(),
		tests: Joi.array()
	});
};
