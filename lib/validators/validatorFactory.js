var util = require('../util/util.js');


module.exports = {
	
	getValidators: function(test, responseTemplates, variables, config) {

		test.expectedResponse = constructExpectedResponse(test, responseTemplates, variables, config);
		
		var validators = [];

		if(test.expectedResponse.statusCode) {
			var StatusCodeValidator = require('./statusCodeValidator.js');
			validators.push(new StatusCodeValidator(test.expectedResponse.statusCode));
		}

		if(test.expectedResponse.body) {
			var BodyValidator = require('./bodyValidator.js');
			validators.push(new BodyValidator(test.expectedResponse.body));
		}
		
		if(test.expectedResponse.responseTime) {
			var ResponseTimeValidator = require('./responseTimeValidator.js');
			validators.push(new ResponseTimeValidator(test.expectedResponse.responseTime));
		}
		
		return validators;
	}
	
}; 

function constructExpectedResponse(test, responseTemplates, variables, config) {
	responseTemplates = responseTemplates || [];
	
	//roll up all of the request templates into a single request object
	return util.rollUpTemplates(test.expectedResponse, test.expectedResponse.templates, responseTemplates);

}
