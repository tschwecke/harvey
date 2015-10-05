var deepExtend = require('deep-extend');
var _ = require('underscore');
var actionFactory = require('../actions/actionFactory.js');
var JSONPath = require('JSONPath');
var clone = require('clone');

module.exports = new (function() {
	var self = this;

	this.rollUpTemplates = function(item, templateIds, templates) {
		var rolledUpItem = {};
		templateIds = templateIds || [];
		templates = templates || [];

		for(var i=0; i<templateIds.length; i++) {
			var template = _.findWhere(templates, { id: templateIds[i] });

			if(template) {
				deepExtend(rolledUpItem, template);
			}
			else {
				throw new Error('Unable to find the template \'' + templateIds[i]  + '\'');
			}
		}
		deepExtend(rolledUpItem, item);

		return rolledUpItem;
	};

	this.findTestStepInfoById = function(id, testSteps) {
		var testStepInfo = {
			"id": id,
			"testStep": null,
			"parameters": {}
		};

		if(typeof(id) === 'object') {
			//If the id is an object then the actual id is the one and only key
			//on the object, and the value is an object containing the parameters for the setup or test step
			var tmpId = Object.keys(id)[0];
			testStepInfo.parameters = id[tmpId];
			testStepInfo.id = tmpId;
		}

		if(testSteps && testSteps.length) {
			for(var i=0; i<testSteps.length; i++) {
				if(testSteps[i].id === testStepInfo.id) {
					testStepInfo.testStep = testSteps[i];
				}
			}
		}
		
		return testStepInfo;
	};

	this.parseValue = function(value, variables, testStep) {
		var parsedValue;
		if(_.isArray(value)) {
			parsedValue = [];
			for(var i=0; i<value.length; i++) {
				parsedValue.push(self.parseValue(value[i], variables));
			}
		}
		else if(_.isObject(value)) {
			var foundActions = false;
			for(var prop in value) {
				if(prop.substr(0,1) === '$') {
					foundActions = true;
					var action = actionFactory.getAction(prop);
					parsedValue = action(value[prop], variables, self.getParseValueFacade(variables, testStep), testStep);
				}
			}

			//Send back the plain object if we didn't find any actions to perform
			if(!foundActions) {
				parsedValue = {};
				for(var prop in value) {
					parsedValue[prop] = self.parseValue(value[prop], variables);
				}
			}
		}
		else if(_.isString(value)) {
			parsedValue = self.performVariableSubstitution(value, variables);
		}
		else {
			parsedValue = value;
		}

		return parsedValue;
	};
	
	this.getParseValueFacade = function(variables, testStep) {
		//Store the variables in a closure so we can just
		//pass consumers a function that takes a single parameter
		return function(value) {
			return self.parseValue(value, variables, testStep);
		};
	};

	this.performVariableSubstitution = function(value, variables) {
		var retVal = value;
		if(_.isString(value)) {
			var partialSinglePattern = /\$\{([\$\[\]\*\(\)\?,@\.a-zA-Z0-9_-]+)\}/gi;
			var wholeSinglePattern = /^\$\{([\$\[\]\*\(\)\?,@\.a-zA-Z0-9_-]+)\}$/gi;
			var partialPattern = /\$\{{2}([\$\[\]\*\(\)\?,@\.a-zA-Z0-9_-]+)\}{2}/gi;
			var wholePattern = /^\$\{{2}([\$\[\]\*\(\)\?,@\.a-zA-Z0-9_-]+)\}{2}$/gi;

			var matches, variableName, variableValue;
			// if the variable is the only contents of the string and is single-bracket notation,
			// return the actual type (of the first result)
			if(wholeSinglePattern.test(value)) {
				variableName = value.replace('${', '').replace('}', '');
				retVal = JSONPath.eval(clone(variables), variableName)[0];
			}
			// if the variable is the only contents of the string and is double-bracket notation,
			// return the actual type (of all results)
			else if(wholePattern.test(value)) {
				variableName = value.replace('${{', '').replace('}}', '');
				retVal = JSONPath.eval(clone(variables), variableName);
			}
			else if(partialSinglePattern.test(value)) {
				matches = value.match(partialSinglePattern);
				matches.forEach(function(match) {
					variableName = match.replace('${', '').replace('}', '');

					variableValue = JSONPath.eval(clone(variables), variableName)[0];

					if (!variableValue) {
						throw new Error('Attempting to use a variable that has not been defined: \'' + variableName + '\'');
					}
					retVal = retVal.replace(match, variableValue);

					//Check to see if there are more variables to replace
					if(partialSinglePattern.test(retVal)) {
						retVal = self.performVariableSubstitution(retVal, variables);
					}
				});
			}
			else if(partialPattern.test(value)) {
				throw new Error('Attempting to use double-bracket notation within a string value. This is not allowed: ' + value);
			}
		}

		return retVal;
	};

	this.normalizeResults = function(results) {
		//If any of the test steps were repeating then we'll have an array of arrays of results.
		//Let's flatten that. 
		results = _.flatten(results, true);

		return results;
	};
})();