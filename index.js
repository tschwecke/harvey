var fs = require('fs');
var path = require('path');

module.exports = Harvey = function() {
	var SuiteBuilder = require('./lib/suiteBuilder.js');
	var HarveyStatus = require('./lib/util/status.js');
	var actionFactory = require('./lib/actions/actionFactory.js');

	var _status = new HarveyStatus();
	var _suiteBuilder = new SuiteBuilder();

	this.addCustomAction = function(actionName, actionLocation) {

		actionLocation = path.resolve(actionLocation);

		if(!fs.existsSync(actionLocation)) {
			throw new Error('Unable to find action \'' + actionName + '\' at location \'' + actionLocation + '\'');
		}

		actionFactory.addAction(actionName, actionLocation);
	};

	
	this.run = function(tests, suite, config, callback) {

		//Start a new call stack when invoking harvey so that all status callbacks
		//have a consistent scope
		setTimeout(function() {

			try {
				var suiteInvoker = _suiteBuilder.buildSuite(tests, suite, config, _status);
				suiteInvoker(callback);
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