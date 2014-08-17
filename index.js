var fs = require('fs');
var path = require('path');
var glob = require('glob');
var clone = require('clone');
var http = require('http');

module.exports = Harvey = function() {
	var SuiteBuilder = require('./lib/suiteBuilder.js');
	var HarveyStatus = require('./lib/util/status.js');
	var actionFactory = require('./lib/actions/actionFactory.js');

	http.globalAgent.maxSockets = 1000;

	var _status = new HarveyStatus();
	var _suiteBuilder = new SuiteBuilder();

	var loadJson = function(filename) {
		if (!filename) return {};

		filename = path.resolve(filename);
		return require(filename);
	};

	var importTestSuites = function(testSuiteData) {
		if (testSuiteData.hasOwnProperty('imports')) {
			var importFiles = [];
			testSuiteData.imports.forEach(function(fileObj) {
				var importLoc = fileObj.file;
				// if the "file" property exists, then let's resolve the imports relative to that file,
				// otherwise resolve the imports relative to where harvey is running from
				if (testSuiteData.file) {
					importLoc = path.resolve(path.dirname(testSuiteData.file), importLoc);
				}
				glob.sync(importLoc).forEach(function(file) {
					if (path.extname(file) !== '.json') {
						throw new Error('Invalid test suite file "' + file + '". Test suites must be defined in a JSON file.');
					}
					var importedData = clone(loadJson(file), false);

					var findConflictingId = function(arr1, arr2) {
						arr1.forEach(function(item1) {
							arr2.forEach(function(item2) {
								if (item1.id === item2.id) {
									return item1.id;
								}
							});
						});
						return null;
					};
					if(importedData.requestTemplates) {
						testSuiteData.requestTemplates = testSuiteData.requestTemplates || [];
						var conflictingId = findConflictingId(testSuiteData.requestTemplates, importedData.requestTemplates);
						if (conflictingId) {
							throw new Error('While importing "' + file + '", a request template was found to have the same ID as an existing request template: ' + conflictingId + '. Please resolve this conflict.')
						}
						else {
							testSuiteData.requestTemplates = testSuiteData.requestTemplates.concat(importedData.requestTemplates);
						}
					}
					if(importedData.responseTemplates) {
						testSuiteData.responseTemplates = testSuiteData.responseTemplates || [];
						conflictingId = findConflictingId(testSuiteData.responseTemplates, importedData.responseTemplates);
						if (conflictingId) {
							throw new Error('While importing "' + file + '", a response template was found to have the same ID as an existing response template: ' + conflictingId + '. Please resolve this conflict.')
						}
						else {
							testSuiteData.responseTemplates = testSuiteData.responseTemplates.concat(importedData.responseTemplates);
						}
					}
					if(importedData.setupAndTeardowns) {
						testSuiteData.setupAndTeardowns = testSuiteData.setupAndTeardowns || [];
						conflictingId = findConflictingId(testSuiteData.setupAndTeardowns, importedData.setupAndTeardowns);
						if (conflictingId) {
							throw new Error('While importing "' + file + '", a setup or teardown was found to have the same ID as an existing setup or teardown template: ' + conflictingId + '. Please resolve this conflict.')
						}
						else {
							testSuiteData.setupAndTeardowns = testSuiteData.setupAndTeardowns.concat(importedData.setupAndTeardowns);
						}
					}
				});
			});
		}
	};

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
				importTestSuites(suite);
				var suiteInvoker = _suiteBuilder.buildSuite(suite, clone(config, false), _status);
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