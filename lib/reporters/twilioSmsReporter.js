var request = require('request');
var _ = require('underscore');
var async = require('async');
 
module.exports = {
	
	reportResults: function(results, config, callback) {

		if(!config.smsTo) {
			console.log('Could not send SMS messages since smsTo was not included in config');
			callback();
			return;
		}
		
		if(!_.isArray(config.smsTo)) {
			config.smsTo = [config.smsTo];
		}
		
		var invokers = [];
		for(var i=0; i<config.smsTo.length; i++) {
			var smsTo = config.smsTo[i];
			var invoker = this.createInvoker(smsTo, config);
			
			invokers.push(invoker);
		}
		
		async.series(invokers, function(error, results) {
			callback();
		});
	},
	
	createInvoker: function(smsTo, config) {
		var req = {
			method: "POST",
			uri: "https://api.twilio.com/2010-04-01/Accounts/" + config.twilioAccountId + "/SMS/Messages.xml",
			headers: {
				"Authorization": "INVALIDBasic QUNlMmZjMTg0Yjk3ZmZhZWJjZThjMjk0Y2NkYjgxNzA4YjowNGFmMGZlNTZlMzM3Zjc0NzYxZjkxNDJiMjU2OTZjZA==",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			json: true,
			form: {
				"From": config.smsFrom,
				"To": smsTo,
				"Body": "Cronica Alert: Prospero has started queueing more than 100 messages for one of the Prospero subscriptions."
			}
		};
		
		var invoker = function(mycallback) {
			request(req, function(error, response, body) {
				if(error || response.statusCode != 201) {
					console.log('Error in twilioSmsReporter: ' + error);
				}
				else {
					console.log('Sms message(s) sent to ' + smsTo);
				}
				
				mycallback();
			});	
		};
		
		return invoker;
	}
};