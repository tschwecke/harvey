var request = require('request');
var actionFactory = require('./actions/actionFactory.js');
var validatorFactory = require('./validators/validatorFactory.js');
var util = require('./util/util.js');
var comparer = require('./util/comparer.js');
var formatter = require('./util/formatter.js');
var deepExtend = require('deep-extend');
var BrowserImplementationFactory = require('./browser/factory.js');
var browserImplementationFactory = new BrowserImplementationFactory();
var request = browserImplementationFactory.getRequestInstance();
var hrTime = browserImplementationFactory.getHighResolutionTimeInstance();

module.exports = function() {

	this.buildTestStep = function(testPhase, testStep, requestTemplates, responseTemplates, variables, status) {
		testStep.actions = testStep.actions || [];
		
		var testStepInvoker = function(callback) {

			callStatusStartingMethod(status, testPhase, testStep);
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
			
			try {
				var req = constructRequest(testStep, requestTemplates, variables);
			}
			catch(e) {
				testStepResult.passed = false;
				testStepResult.error = e.toString();
				callback(null, testStepResult);
				return;
			}

			var validators = validatorFactory.getValidators(testStep, responseTemplates, variables);
			
			//Determine if we need to skip this testStep
			if(shouldRun(testStep, variables)) {

				testStepResult.rawRequest = formatter.formatRequest(req);
				var startTime = hrTime();
				status.requestStarting(req);
				request(req, function(error, response, body) {
					
					if(error) {
						testStepResult.passed = false;
						testStepResult.error = error;
						status.requestFailed(req, error);
						callback(null, testStepResult);
						return;
					}

					status.requestCompleted(req, response);
					
					if(response) {
						var endTime = hrTime(startTime);
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

						try {
							for(var j=0; j<testStep.actions.length; j++) {
								var action = testStep.actions[j];

								for(var actionName in action) {
									var action = actionFactory.getAction(actionName, action[actionName]);
									action.perform(responseAsJson, testStep, variables);
								}
							}
						}
						catch(e) {
							testStepResult.passed = false;
							testStepResult.error = e.toString();
							callback(null, testStepResult);
							return;
						}
					}

					callStatusCompletedMethod(status, testPhase, testStep, testStepResult);
					callback(null, testStepResult);
					return;
				});
			}
			else {
				//Even though we're not executing a request, evaluate the actions anyway
				try {
					for(var j=0; j<testStep.actions.length; j++) {
						var action = testStep.actions[j];

						for(var actionName in action) {
							var action = actionFactory.getAction(actionName, action[actionName]);
							action.perform({}, testStep, variables);
						}
					}
				}
				catch(e) {
					testStepResult.passed = false;
					testStepResult.error = e.toString();
					callback(null, testStepResult);
					return;
				}

				callStatusCompletedMethod(status, testPhase, testStep, testStepResult);
				callback(null, testStepResult);
				return;
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

	var callStatusStartingMethod = function(status, testPhase, testStep) {
		switch(testPhase) {
			case 'suiteSetup':
				status.suiteSetupStarting(testStep);
				break;
			case 'suiteTeardown':
				status.suiteTeardownStarting(testStep);
				break;
			case 'testStartup':
				status.testStartupStarting(null, testStep);
				break;
			case 'testTeardown':
				status.testTeardownStarting(null, testStep);
				break;
			case 'test':
				status.testStarting(testStep);
			break;
		}
	};

	var callStatusCompletedMethod = function(status, testPhase, testStep, testStepResult) {
		switch(testPhase) {
			case 'suiteSetup':
				status.suiteSetupCompleted(testStep, testStepResult);
				break;
			case 'suiteTeardown':
				status.suiteTeardownCompleted(testStep, testStepResult);
				break;
			case 'testStartup':
				status.testStartupCompleted(null, testStep, testStepResult);
				break;
			case 'testTeardown':
				status.testTeardownCompleted(null, testStep, testStepResult);
				break;
			case 'test':
				status.testCompleted(testStep, testStepResult);
			break;
		}
	};
};
