var nodeRequest = require('request');
var browserRequest = require('./request.js');
var browserHrTime = require('./hrTime.js');

module.exports = function() {
	var inBrowser = typeof window != 'undefined';
	
	this.getRequestInstance = function() {
		if(inBrowser) {
			return browserRequest;
		}
		else {
			return nodeRequest;
		}
	};

	this.getHighResolutionTimeInstance = function() {
		if(inBrowser) {
			return browserHrTime;
		}
		else {
			return process.hrtime;
		}
	};
};
