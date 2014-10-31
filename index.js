var fs = require('fs');
var path = require('path');
var glob = require('glob');
var clone = require('clone');
var http = require('http');
var https = require('https');
var _ = require('underscore');

module.exports = Harvey = function() {
	var SuiteBuilder = require('./lib/suiteBuilder.js');
	var HarveyStatus = require('./lib/util/status.js');
	var actionFactory = require('./lib/actions/actionFactory.js');

	http.globalAgent.maxSockets = 100;
	https.globalAgent.maxSockets = 100;

	var _status = new HarveyStatus();
	var _suiteBuilder = new SuiteBuilder();

	var getTestStats = function(suiteResults) {
		var stats = {
			"testsExecuted": 0,
			"testsFailed": 0,
			"testsSkipped": 0,
			"validationsPerformed": 0,
			"validationsFailed": 0
		};

		for (var i = 0; i < suiteResults.suiteStepResults.length; i++) {
			if (_.isArray(suiteResults.suiteStepResults[i])) {
				var testResults = suiteResults.suiteStepResults[i];
				for (var j = 0; j < testResults.length; j++) {
					var testResult = testResults[j];
					if (testResult.skipped) {
						stats.testsSkipped++;
					} else {
						stats.testsExecuted++;
						if (!testResult.passed) stats.testsFailed++;

						for (var k = 0; k < testResult.testStepResults.length; k++) {
							var testStepResult = testResult.testStepResults[k];

							for (var l = 0; l < testStepResult.validationResults.length; l++) {
								var validationResult = testStepResult.validationResults[l];
								stats.validationsPerformed++;
								if (!validationResult.valid) stats.validationsFailed++;
							}

						}
					}
				}
			}
		}
		

		return stats;
	}

	this.addCustomAction = function(actionName, actionLocation) {

		actionLocation = path.resolve(actionLocation);

		if(!fs.existsSync(actionLocation)) {
			throw new Error('Unable to find action \'' + actionName + '\' at location \'' + actionLocation + '\'');
		}

		actionFactory.addAction(actionName, actionLocation);
	};

	
	this.run = function(suite, config, callback) {

		//Start a new call stack when invoking harvey so that all status callbacks
		//have a consistent scope
		setTimeout(function() {

			try {
				var suiteInvoker = _suiteBuilder.buildSuite(clone(suite, false), clone(config, false), _status);
				var suiteStarted = new Date();
				suiteInvoker(function(error, suiteResult) {
					if (error) {
						return callback(error);
					}

					var stats = getTestStats(suiteResult);
					stats.suiteId = suite.id;
					stats.suiteName = suite.name;
					stats.timeStarted = suiteStarted;
					stats.timeEnded = new Date();
					stats.testResults = suiteResult;
					
					callback(null, stats);
				});
			}
			catch(error) {
				callback(error);
			}
		}, 1);
	};

	//Expose all of the methods for tying in to the status events
	this.onSuiteStarting = _status.onSuiteStarting;
	this.onSuiteCompleted = _status.onSuiteCompleted;
	this.onSuiteSetupStarting = _status.onSuiteSetupStarting;
	this.onSuiteSetupCompleted = _status.onSuiteSetupCompleted;
	this.onSuiteTeardownStarting = _status.onSuiteTeardownStarting;
	this.onSuiteTeardownCompleted = _status.onSuiteTeardownCompleted;
	this.onTestGroupStarting = _status.onTestGroupStarting;
	this.onTestGroupCompleted = _status.onTestGroupCompleted;
	this.onTestSetupStarting = _status.onTestSetupStarting;
	this.onTestSetupCompleted = _status.onTestSetupCompleted;
	this.onTestTeardownStarting = _status.onTestTeardownStarting;
	this.onTestTeardownCompleted = _status.onTestTeardownCompleted;
	this.onTestStarting = _status.onTestStarting;
	this.onTestCompleted = _status.onTestCompleted;
	this.onRequestStarting = _status.onRequestStarting;
	this.onRequestCompleted = _status.onRequestCompleted;
	this.onRequestFailed = _status.onRequestFailed;
};