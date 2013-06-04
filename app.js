var commandLine = require('commander');
var async = require('async');
var SuiteBuilder = require('./lib/suiteBuilder.js');
var reporterFactory = require('./lib/reporters/reporterFactory.js');


var options = getCommandLineArguments();
var testData = getTestData(options);
var config = getConfig(options);

var suiteBuilder = new SuiteBuilder();

var parallelTests = [];
var timeStarted = new Date();

if(options.tags) {
	testData.tests = filterTestsByTags(testData.tests, options.tags);
}


var suiteInvoker = suiteBuilder.buildSuite(testData.tests, testData, config);

suiteInvoker(function(error, suiteResult) {
	var stats = getTestStats(suiteResult);
	
	var results = {
		"timeStarted": timeStarted,
		"timeEnded": new Date(),
		"testsExecuted": stats.testsExecuted,
		"testsFailed": stats.testsFailed,
		"validationsPerformed": stats.validationsPerformed,
		"validationsFailed": stats.validationsFailed,
		"testResults": suiteResult
	};
	
	if(options.reporter) {
		var reporter = reporterFactory.createReporter(options.reporter);
		reporter.reportResults(results, config, function() {
			process.exit(results.testsFailed);
		});
	}
	

});



function getCommandLineArguments() {

	commandLine
	.option('-t, --testFile <path>', 'The path to the file containing the tests')
	.option('-c, --configFile <path>', 'The path to the config file')
	.option('-r, --reporter <console|json|none>', 'Which reporter to use for displaying the results')
	.option('-k, --configString <config string>', 'Config String')
	.option('--tags <tags>', 'A comma delimited list of tags to use for filtering the tests to run')
	.parse(process.argv);

	return commandLine;
}

function getConfig(options) {

	if(!options.configFile) return {};
	
	var filename = options.configFile;
	
	if(filename.substr(0, 1) !== '/' && filename.substr(0, 1) !== '.') {
			filename = './' + filename;
	}

	try {
		var config = require(filename);
	}
	catch(e) {
		throw new Error("Unable to load config file '" + filename + "'; Error: " + e);
	}
	
	return config;
}

function getTestData(options) {
	var filename = options.testFile || 'tests.json';
	
	if(filename.substr(0, 1) !== '/' && filename.substr(0, 1) !== '.') {
			filename = './' + filename;
	}

	try {
		var testData = require(filename);
	}
	catch(e) {
		throw new Error("Unable to load test file '" + filename + "'; Error: " + e);
	}
	
	return testData;
}

function getTestStats(suiteResults) {
	var stats = {
		"testsExecuted": 0,
		"testsFailed": 0,
		"validationsPerformed": 0,
		"validationsFailed": 0
	};

	var testResults = [];
	for(var i=0; i<suiteResults.suiteStepResults.length; i++) {
		if(_.isArray(suiteResults.suiteStepResults[i])) {
			testResults = suiteResults.suiteStepResults[i];
			break;
		}
	}
	
	for(var i=0; i<testResults.length; i++) {
		var testResult = testResults[i];
		stats.testsExecuted++;
		if(!testResult.passed) stats.testsFailed++;
		
		for(var j=0; j<testResult.testStepResults.length; j++) {
			var testStepResult = testResult.testStepResults[j];
			
			for(var k=0; k<testStepResult.validationResults.length; k++) {
					var validationResult = testStepResult.validationResults[k];
					stats.validationsPerformed++;
					if(!validationResult.valid) stats.validationsFailed++;
			}
			
		}
	}
	
	return stats;
}

function filterTestsByTags(tests, tags) {

	var filteredTests = [];

	for(var i=0; i<tests.length; i++) {
		//TODO: need to implement tags for real, but this will work for now
		if(tags.indexOf(tests[i].id) > -1) {
			filteredTests.push(tests[i]);
		}
	}

	return filteredTests;
}

