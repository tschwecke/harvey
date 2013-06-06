var Hapi = require('hapi');
var SuiteBuilder = require('./lib/suiteBuilder.js');
var Status = require('./lib/util/status.js');
var suiteBuilder = new SuiteBuilder();

// Create a server with a host, port, and options
var server = new Hapi.Server('localhost', 8080);

var testSuiteCounter = 0;

// Define the route
var activeTestSuites = {
    handler: function (request) {
		var suiteIndex = ++testSuiteCounter;
		var status = new Status();
		
		status.onTestStarting(function(test) {
			//Wire in socket here
			console.log('Suite ' + suiteIndex + '; Starting Test ' + test.id);
		});

		status.onTestCompleted(function(test, results) {
			//Wire in socket here
			console.log('Suite ' + suiteIndex + '; Completed Test ' + test.id + '; Response time: ' + results.responseTime + ' ms');
		});

		var testData = request.payload;
		var config = {};
		
		var suiteInvoker = suiteBuilder.buildSuite(testData.tests, testData, config, status);

		suiteInvoker(function(error, suiteResult) {
			//Wire in socket here
			console.log('Completed suite ' + suiteIndex);
		});

        request.reply({"message": "Test suite started"});
    }
};

// Add the route
server.addRoute({
    method : 'POST',
    path : '/activeTestSuites',
    config : activeTestSuites
});

// Start the server
server.start();
