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
			var template = self.findById(templateIds[i], templates);

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

	this.findById = function(id, items) {
		if(items && items.length) {
			for(var i=0; i<items.length; i++) {
				if(items[i].id === id) {
					return items[i];
				}
			}
		}
		
		return null;
	};

	this.parseValue = function(value, variables, testStep) {
		var parsedValue;
		if(_.isArray(value)) {
			parsedValue = [];
			for(var i=0; i<value.length; i++) {
				parsedValue.push(self.parseValue(value[i], variables, testStep));
			}
		}
		else if(_.isObject(value)) {
			for(var prop in value) {
				if(prop.substr(0,1) === '$') {
					var action = actionFactory.getAction(prop, value[prop], self.parseValue);
					parsedValue = action.perform(testStep, variables);
				}
			}

			//Send back the plain object if we didn't find any actions to perform
			if(!parsedValue) {
				parsedValue = {};
				for(var prop in value) {
					parsedValue[prop] = self.parseValue(value[prop], variables, testStep);
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

					variableValue = JSONPath.eval(clone(variables), variableName)[0] || '';

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