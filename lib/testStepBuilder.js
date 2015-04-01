var request = require('request');
var actionFactory = require('./actions/actionFactory.js');
var validatorFactory = require('./validators/validatorFactory.js');
var util = require('./util/util.js');
var comparer = require('./util/comparer.js');
var formatter = require('./util/formatter.js');
var deepExtend = require('deep-extend');
var request = require('request');
var hrTime = process.hrtime;
var https = require('https');
var _ = require('underscore');
var async = require('async');
var clone = require('clone');

https.globalAgent.options.secureProtocol = 'SSLv3_method';
request.defaults({
    strictSSL: false,
    rejectUnauthorized: false
});
//The request module sometimes has issues with self-signed certs so we need to use this workaround
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


module.exports = function() {

	this.buildTestStep = function(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, status) {

		//Check to see if this testStep needs to be repeated multiple times.  Don't repeat anything in the 'test' phase
		//since those have already been repeated by the suiteBuilder
		if(testStep.repeat && testPhase !== 'test') {
			var testStepInvoker = buildRepeatedTests(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, status);
		}
		//Otherwise just add it once
		else {
			var testStepInvoker = createTestStepInvoker(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, status);
		}

		return testStepInvoker;
	};

	var buildRepeatedTests = function(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, status) {
		var testStepInvokers = [];

		var items = util.performVariableSubstitution(testStep.repeat.in || [], variables);
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
			var testStepInvoker = createTestStepInvoker(testPhase, testStep, requestTemplates, responseTemplates, parameters, testVariables, status);
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

	var createTestStepInvoker = function(testPhase, testStep, requestTemplates, responseTemplates, parameters, variables, status) {
		var testStepInvoker = function(callback) {
			delete variables.response; //Deprecated
			variables['@parameters'] = util.parseValue(parameters, variables);

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
				return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, e.toString(), callback);
			}

			var validators = validatorFactory.getValidators(testStep, responseTemplates, variables);

			//Determine if we need to skip this testStep
			if(shouldRun(testStep, variables)) {

				testStepResult.rawRequest = formatter.formatRequest(req);
				var startTime = hrTime();
				status.requestStarting(req);
				request(req, function(error, response, body) {

					if(error) {
						status.requestFailed(req, error);
						return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, error, callback);
					}

					// lower case all header names
					response.headers = _.chain(response.headers)
										.pairs()
										.map(function(headerPair) { headerPair[0] = headerPair[0].toLowerCase(); return headerPair; })
										.object()
										.value();

					status.requestCompleted(req, response);

					var endTime = hrTime(startTime);
					response.responseTime = testStepResult.responseTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;
					testStepResult.rawResponse = formatter.formatResponse(response);

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


					//If the testStep passed perform any post-actions that are specified
					if(testStepResult.passed && testStep.postActions) {
						try {
							variables['@response'] = clone(convertToJson(response, body));
							variables.response = variables['@response']; //Deprecated
							performActions(testStep.postActions, testStep, variables);
						}
						catch(e) {
							return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, e.toString(), callback);
						}
					}

					return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, null, callback);
				});
			}
			else {
				//Even though we're not executing a request, evaluate the actions anyway
				try {
					//combine the pre and post actions
					var actions = testStep.preActions || [];
					actions = actions.concat(testStep.postActions || []);
					performActions(actions, testStep, variables);
				}
				catch(e) {
					return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, e.toString(), callback);
				}

				return handleExit(status, testPhase, testStep, parameters, variables, testStepResult, null, callback);
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

			if(variables['_proxyUrl']) {
				retVal.proxy = variables['_proxyUrl'];
			}
		}

		return retVal;
	};

	var shouldRun = function(testPart, variables) {
		if(!testPart.request) return false;

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

	var performActions = function(actions, testStep, variables) {

		for(var j=0; j<actions.length; j++) {
			var action = actions[j];

			for(var actionName in action) {
				var actionFn = actionFactory.getAction(actionName);
				var actionInfo = action[actionName];

				//Perform the action
				actionFn(actionInfo, variables, util.getParseValueFacade(variables));
			}
		}
	};

	var handleExit = function(status, testPhase, testStep, parameters, variables, testStepResult, error, callback) {
		var returnVariableName = parameters['@returns'];
		if(returnVariableName) {
			variables[returnVariableName] = variables['@returns'];
		}
		delete variables['@returns'];
		delete variables['@parameters'];
		delete variables['@response'];
		delete variables['response']; //Deprecated

		if(error) {
			testStepResult.passed = false;
			testStepResult.error = error;
		}

		callStatusCompletedMethod(status, testPhase, testStep, testStepResult);
		callback(null, testStepResult);
	};

	var callStatusStartingMethod = function(status, testPhase, testStep) {
		switch(testPhase) {
			case 'suiteSetup':
				status.suiteSetupStarting(testStep);
				break;
			case 'suiteTeardown':
				status.suiteTeardownStarting(testStep);
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
			case 'testTeardown':
				status.testTeardownCompleted(null, testStep, testStepResult);
				break;
			case 'test':
				status.testCompleted(testStep, testStepResult);
			break;
		}
	};

};
