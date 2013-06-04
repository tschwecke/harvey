var request = require('request');
var actionFactory = require('./actions/actionFactory.js');
var validatorFactory = require('./validators/validatorFactory.js');
var util = require('./util/util.js');
var comparer = require('./util/comparer.js');
var formatter = require('./util/formatter.js');
var deepExtend = require('deep-extend');

module.exports = function() {

	this.buildTestStep = function(testPhase, testStep, requestTemplates, responseTemplates, variables) {
		testStep.actions = testStep.actions || [];
		
		var testStepInvoker = function(callback) {
			var req = constructRequest(testStep, requestTemplates, variables);
			var validators = validatorFactory.getValidators(testStep, responseTemplates, variables);
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
			if(shouldRun(testStep, variables)) {

				testStepResult.rawRequest = formatter.formatRequest(req);
				var startTime = process.hrtime();
				request(req, function(error, response, body) {
					
					if(error) {
						testStepResult.passed = false;
						testStepResult.error = error;
						callback(null, testStepResult);
						return;
					}
					
					if(response) {
						var endTime = process.hrtime(startTime);
						response.responseTime = testStepResult.responseTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;
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
					
					//If the testStep passed perform any actions that are specified
					if(testStepResult.passed) {
						var responseAsJson = convertToJson(response, body);
						for(var j=0; j<testStep.actions.length; j++) {
							var action = testStep.actions[j];

							for(var actionName in action) {
								var action = actionFactory.getAction(actionName, action[actionName]);
								action.perform(responseAsJson, testStep, variables);
							}
						}
					}
					
					callback(null, testStepResult);
				});
			}
			else {
				//Even though we're not executing a request, evaluate the actions anyway
				for(var j=0; j<testStep.actions.length; j++) {
					var action = testStep.actions[j];

					for(var actionName in action) {
						var action = actionFactory.getAction(actionName, action[actionName]);
						action.perform({}, testStep, variables);
					}
				}

				callback(null, testStepResult);
			}
		};
		
		return testStepInvoker;
	};
	
	var constructRequest = function (testStep, requestTemplates, variables) {
		var retVal = null;
		
		if(testStep.request) {

			requestTemplates = requestTemplates || [];

			//roll up all of the request templates into a single request object
			var request = util.rollUpTemplates(testStep.request, testStep.request.templates, requestTemplates);

			var protocol = util.parseValue(request.protocol, variables);
			var method = util.parseValue(request.method, variables);
			var host = util.parseValue(request.host, variables);
			var port = util.parseValue(request.port, variables);
			var resource = util.parseValue(request.resource, variables);

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
				headers[header] = util.parseValue(request.headers[header], variables);

				if(header.toLowerCase() === "content-type" && headers[header].toLowerCase() === "application/x-www-form-urlencoded") {
					formPost = true;
				}
			}

			retVal = {
				method: method,
				uri: uri,
				headers: headers,
				json: true
			};

			if(formPost) {
				retVal.form = util.parseValue(request.body, variables);
			}
			else {
				retVal.body = util.parseValue(request.body, variables);
			}
		}

		return retVal;
	};
	
	var shouldRun = function(testPart, variables) {
		if(!testPart.request) return false;

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
