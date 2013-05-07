var request = require('request');
var microtime = require('microtime');

var actionFactory = require('./actions/actionFactory.js');
var validatorFactory = require('./validators/validatorFactory.js');
var util = require('./util/util.js');
var comparer = require('./util/comparer.js');
var formatter = require('./util/formatter.js');

module.exports = function() {

	this.buildTestSteps = function(test, setupAndTeardowns, requestTemplates, responseTemplates, config) {
		var testSteps = [];
		test.variables = test.variables || {};
		test.setup = test.setup || [];
		test.teardown = test.teardown || [];
		
		//Wire up the setups
		for(var i=0; i<test.setup.length; i++) {
			var setup = util.findById(test.setup[i], setupAndTeardowns);
			
			if(setup) {
				var setupInvoker = constructInvokerFunction("setup", setup, requestTemplates, responseTemplates, test.variables, config);
				testSteps.push(setupInvoker);
			}
		}
		
		//Wire up the test
		var testInvoker = constructInvokerFunction("test", test, requestTemplates, responseTemplates, test.variables, config);
		testSteps.push(testInvoker);

		
		//Wire up the teardowns
		for(var i=0; i<test.teardown.length; i++) {
			var teardown = util.findById(test.teardown[i], setupAndTeardowns);
			
			if(teardown) {
				var teardownInvoker = constructInvokerFunction("teardown", teardown, requestTemplates, responseTemplates, test.variables, config);
				testSteps.push(teardownInvoker);
			}
		}

		
		return testSteps;
	};
	
	var constructInvokerFunction = function(testPhase, testStep, requestTemplates, responseTemplates, variables, config) {
		testStep.actions = testStep.actions || [];
		
		var testStepInvoker = function(callback) {
			var req = constructRequest(testStep, requestTemplates, variables, config);
			var validators = validatorFactory.getValidators(testStep, responseTemplates, variables, config);
			var testStepResult = {
				"id": testStep.id,
				"testPhase": testPhase,
				"passed": true,
				"timeSent": new Date(),
				"responseTime": null,
				"rawRequest": null,
				"rawResponse": null,
				"validationResults": [],
				"error": null
			};
			
			//Determine if we need to skip this testStep
			if(shouldRun(testStep, variables, config)) {

				testStepResult.rawRequest = formatter.formatRequest(req);
				var startTime = microtime.now();
				request(req, function(error, response, body) {
					
					if(error) {
						testStepResult.passed = false;
						testStepResult.error = error;
						callback(null, testStepResult);
						return;
					}
					
					if(response) {
						response.responseTime = testStepResult.responseTime = (microtime.now() - startTime) / 1000;
						testStepResult.rawResponse = formatter.formatResponse(response);
					}
					
					//Validate the test part
					testStepResult.passed = true;
					for(var j=0; j<validators.length; j++) {

						try {
							var validationResult = validators[j].validate(response);
						}
						catch(e) {
							var validationResult = { "id": validators[j].id, "valid": false, "error": e};
						}
						
						if(!validationResult.valid) {
							testStepResult.passed = false;
						}
						testStepResult.validationResults.push(validationResult);
					}

					//Store the test result in the variables in case a later testStep needs it
					if(testPhase === 'test') {
						variables['${passed}'] = testStepResult.passed;
					}
					
					//perform any actions that are specified
					var responseAsJson = convertToJson(response, body);
					for(var j=0; j<testStep.actions.length; j++) {
						var action = testStep.actions[j];

						for(var actionName in action) {
							var action = actionFactory.getAction(actionName, action[actionName]);
							action.perform(responseAsJson, testStep, variables, config);
						}
					}

					callback(null, testStepResult);
				});
			}
			else {
				callback(null, testStepResult);
			}
		};
		
		return testStepInvoker;
	};
	
	var constructRequest = function (testStep, requestTemplates, variables, config) {
		requestTemplates = requestTemplates || [];
		
		//roll up all of the request templates into a single request object
		var request = util.rollUpTemplates(testStep.request, testStep.request.templates, requestTemplates);
		
		var protocol = util.parseValue(request.protocol, variables, config);
		var method = util.parseValue(request.method, variables, config);
		var host = util.parseValue(request.host, variables, config);
		var port = util.parseValue(request.port, variables, config);
		var resource = util.parseValue(request.resource, variables, config);

		if(port) {
			port = ':' + port;
		}
		else {
			port = "";
		}
		
		var uri = protocol + "://" + host + port + resource;

		var headers = {};
		var formPost = false;
		for(var header in request.headers) {
			headers[header] = util.parseValue(request.headers[header], variables, config);

			if(header.toLowerCase() === "content-type" && headers[header].toLowerCase() === "application/x-www-form-urlencoded") {
				formPost = true;
			}
		}

		var retVal = {
			method: method,
			uri: uri,
			headers: headers,
			json: true
		};

		if(formPost) {
			retVal.form = request.body;
		}
		else {
			retVal.body = request.body;
		}

		return retVal;
	};
	
	var shouldRun = function(testPart, variables, config) {
		if(!testPart.run) return true;
		
		if(testPart.run === "onlyOnAnyFailure") {
			return variables['${passed}'] === false;
		}
		
		//Default to running
		return true;
	};

	var convertToJson = function(response, body) {
		var json = {
			"statusCode": response.statusCode,
			"headers": {},
			"body": body
		};

		for(var headerName in response.headers) {
			json.headers[headerName.toLowerCase()] = response.headers[headerName];
		}

		return json;
	};
};
