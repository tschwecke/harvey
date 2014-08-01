var deepExtend = require('deep-extend');
var _ = require('underscore');
var actionFactory = require('../actions/actionFactory.js');

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

	this.parseValue = function(value, variables, responseAsJson, testStep) {
		var parsedValue;

		if(_.isArray(value)) {
			parsedValue = [];
			for(var i=0; i<value.length; i++) {
				parsedValue.push(self.parseValue(value[i], variables, responseAsJson, testStep));
			}
		}
		else if(_.isObject(value)) {
			for(var prop in value) {
				if(prop.substr(0,1) === '$') {
					var action = actionFactory.getAction(prop, value[prop], self.parseValue);
					parsedValue = action.perform(responseAsJson, testStep, variables);
				}
			}

			//Send back the plain object if we didn't find any actions to perform
			if(!parsedValue) {
				parsedValue = {};
				for(var prop in value) {
					parsedValue[prop] = self.parseValue(value[prop], variables, responseAsJson, testStep);
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
			var partialPattern = /\$\{([.a-zA-Z0-9_-]+)\}/gi;
			var wholePattern = /^\$\{([.a-zA-Z0-9_-]+)\}$/gi;
			var matches = value.match(partialPattern);
			// if the variable is the only contents of the string, use the matching type as well
			if(wholePattern.test(value)) {
				var variableName = value.replace('${', '').replace('}', '');
				retVal = (variables.hasOwnProperty(variableName) && typeof(variables[variableName]) === 'object') ? 
							JSON.parse(JSON.stringify(variables[variableName])) :
							variables[variableName];
			}
			// otherwise assume it's intended to be a string value
			else if(matches && matches.length > 0) {
				for(var i=0; i<matches.length; i++) {
					var match = matches[i];
					var variableName = match.replace('${', '').replace('}', '');

					if(!variables.hasOwnProperty(variableName)) {
						throw new Error('Attempting to use a variable that has not been defined: \'' + variableName + '\'');
					}

					var variableValue = variables[variableName] || "";
					retVal = retVal.replace(match, variableValue);
				}
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