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
var https = require('https');
var _ = require('underscore');
var async = require('async');
https.globalAgent.options.secureProtocol = 'SSLv3_method';

module.exports = function() {

	this.buildTestStep = function(testPhase, testStep, requestTemplates, responseTemplates, variables, status) {

		//Check to see if this testStep needs to be repeated multiple times.  Don't repeat anything in the 'test' phase
		//since those have already been repeated by the suiteBuilder
		if(testStep.repeat && testPhase !== 'test') {
			var testStepInvoker = buildRepeatedTests(testPhase, testStep, requestTemplates, responseTemplates, variables, status);
		}
		//Otherwise just add it once
		else {
			var testStepInvoker = createTestStepInvoker(testPhase, testStep, requestTemplates, responseTemplates, variables, status);
		}

		return testStepInvoker;
	};

	var buildRepeatedTests = function(testPhase, testStep, requestTemplates, responseTemplates, variables, status) {
		var testStepInvokers = [];

		var items = testStep.repeat.in || [];
		//If it's a string convert it into an array
		if(_.isString(items)) {
			items = items.split(',');
		}

		//Determine where to start and stop looping
		var startIndex = testStep.repeat.from || 0;
		var stopIndex = testStep.repeat.to || items.length - 1;

		//Loop through each of the items in the array
		for (var i = startIndex; i <= stopIndex; i++) {
			var item = items[i];

			//Clone all of the variables being passed to the testStep so that if the testStep modifies the values it can't
			//affect any other testStep.
			var testVariables = _.clone(variables);

			//Add the value of the current item as a variable for the testStep
			testVariables[testStep.repeat.var] = (testStep.repeat.in) ? items[i] : i;

			//Add the testStep to the list
			var testStepInvoker = createTestStepInvoker(testPhase, testStep, requestTemplates, responseTemplates, testVariables, status);
			testStepInvokers.push(testStepInvoker);

		}

		//Determine if these should be run sequentially or in parallel
		//Default to parallel
		var asyncMethod = (testStep.repeat.mode === 'sequential') ? 'series' : 'parallel';

		var repeatedTestInvoker = function(callback) {
			async[asyncMethod](testStepInvokers, callback);
		};

		return repeatedTestInvoker;
	};

	var createTestStepInvoker = function(testPhase, testStep, requestTemplates, responseTemplates, variables, status) {
		var testStepInvoker = function(callback) {

			callStatusStartingMethod(status, testPhase, testStep);
			var testStepResult = {
				"id": testStep.id,
				"testPhase": testPhase,
				"passed": true,
				"timeSent": new Date(),
				"repeated": null,
				"responseTime": null,
				"rawRequest": null,
				"rawResponse": null,
				"validationResults": [],
				"error": null
			};

			if(testStep.repeat) {
				testStepResult.repeated = {
					"var": testStep.repeat.var,
					"value": variables[testStep.repeat.var]
				};
			}

			try {
				//Perform any pre-actions that are specified
				if(testStep.preActions) {
						performActions(testStep.preActions, testStep, variables);
				}

				//Construct the request
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

					// lower case all header names
					response.headers = _.chain(response.headers)
										.pairs()
										.map(function(headerPair) { headerPair[0] = headerPair[0].toLowerCase(); return headerPair; })
										.object()
										.value();

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
							var validationResult = { "id": validators[j].id, "valid": false, "error": e.message };
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

					//If the testStep passed perform any post-actions that are specified
					if(testStepResult.passed && testStep.postActions) {
						try {
							performActions(testStep.postActions, testStep, variables, response, body);
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
					//combine the pre and post actions
					var actions = testPart.preActions || [];
					actions = actions.concat(test.postActions || []);
					performActions(actions, testStep, variables);
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

			var querystring = request.querystring || {};

			retVal = {
				method: method,
				uri: uri,
				headers: headers,
				json: true,
				qs: querystring
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
		var json = null;
		if(response) {
			json = {
				"statusCode": response.statusCode,
				"headers": {},
				"body": body
			};

			for(var headerName in response.headers) {
				json.headers[headerName.toLowerCase()] = response.headers[headerName];
			}
		}

		return json;
	};

	var performActions = function(actions, testStep, variables, response, body) {
		var responseAsJson = convertToJson(response, body);
		
		for(var j=0; j<actions.length; j++) {
			var action = actions[j];

			for(var actionName in action) {
				var action = actionFactory.getAction(actionName, action[actionName], util.parseValue);
				action.perform(responseAsJson, testStep, variables);
			}
		}
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
