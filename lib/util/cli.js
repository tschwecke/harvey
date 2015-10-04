var color = require('cli-color');
var glob = require('glob');
var path = require('path');

var fail = function(error, debug) {
	if (!(error instanceof Error)) {
		// give all error messages a stack trace for debug purposes
		error = new Error(error);
	}

	if (debug) {
		console.error(color.red(error.stack));
	}
	else {
		console.error(color.red(error.message));
	}
	process.exit(1);
};
var parseTimeout = function(timeoutString) {
	if(!timeoutString) {
		return undefined;
	}

	var timeout = timeoutString * 1;
	if(isNaN(timeout)) {
		fail('Invalid request timeout value "'+ timeoutString + '".');
	}

	return timeout;
};
var getTestSuiteFiles = function(cliArgs) {

	if (!cliArgs.length) {
		fail('No test suite files were specified');
	}
	var fileNames = [];
	cliArgs.forEach(function(pattern) {
		glob.sync(pattern).forEach(function(file) {
			if (path.extname(file) !== '.json') {
				fail('Invalid test suite file "' + file + '". Test suites must be defined in a JSON file.');
			}
			fileNames.push(file);
		});
	});
	if (!fileNames.length) {
		fail('No test suite files found');
	}

	return fileNames;
};
var parseActionPaths = function(actionPathsString) {
	var actions = [];
	actionPathsString = actionPathsString || '';

	var actionPaths = actionPathsString.split(',');

	for(var i=0; i<actionPaths.length; i++) {
		//The action path will either be in the for some/dir/sampleAction.js
		// or just sampleAction.js.  We need to parse the name, 'sample', out of it

		var actionPath = actionPaths[i];
		var startingPos = actionPath.lastIndexOf('/') + 1;

		name = actionPath.substring(startingPos);
		name = name.replace('Action.js', '');

		if(name !== '') {
			//Add the new action object to the array
			actions.push({
				name: name,
				location: actionPath
			});
		}
		else {
			glob.sync(actionPath + '/*Action.js').forEach(function(file) {
				startingPos = file.lastIndexOf('/') + 1;
				name = file.substring(startingPos);
				name = name.replace('Action.js', '');

				actions.push({
					name: name,
					location: file
				});
			});
		}
	}

	return actions;
};


module.exports = {
	fail: fail,
	parseTimeout: parseTimeout,
	getTestSuiteFiles: getTestSuiteFiles,
	parseActionPaths: parseActionPaths
};
