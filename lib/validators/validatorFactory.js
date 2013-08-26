var util = require('../util/util.js');


module.exports = {
	
	getValidators: function(testPart, responseTemplates, variables) {
		var validators = [];

		if(testPart.expectedResponse) {
			testPart.expectedResponse = constructExpectedResponse(testPart, responseTemplates, variables);

			if(testPart.expectedResponse.statusCode) {
				var StatusCodeValidator = require('./statusCodeValidator.js');
				validators.push(new StatusCodeValidator(testPart.expectedResponse.statusCode, variables, testPart));
			}

			if(testPart.expectedResponse.headers) {
				var HeaderValidator = require('./headerValidator.js');
				validators.push(new HeaderValidator(testPart.expectedResponse.headers, variables, testPart));
			}

			if(testPart.expectedResponse.body) {
				var BodyValidator = require('./bodyValidator.js');
				validators.push(new BodyValidator(testPart.expectedResponse.body, variables, testPart));
			}

			if(testPart.expectedResponse.bodySchema) {
				var BodySchemaValidator = require('./bodySchemaValidator.js');
				validators.push(new BodySchemaValidator(testPart.expectedResponse.bodySchema, variables, testPart));
			}

			if(testPart.expectedResponse.responseTime) {
				var ResponseTimeValidator = require('./responseTimeValidator.js');
				validators.push(new ResponseTimeValidator(testPart.expectedResponse.responseTime, variables, testPart));
			}
		}
		
		return validators;
	}
	
}; 

function constructExpectedResponse(testPart, responseTemplates, variables) {
	responseTemplates = responseTemplates || [];
	
	//roll up all of the request templates into a single request object
	return util.rollUpTemplates(testPart.expectedResponse, testPart.expectedResponse.templates, responseTemplates);

}
