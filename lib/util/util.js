var deepExtend = require('deep-extend');
var _ = require('underscore');
var actionFactory = require('../actions/actionFactory.js');

module.exports = {

	rollUpTemplates: function(item, templateIds, templates) {
		var rolledUpItem = {};
		templateIds = templateIds || [];
		templates = templates || [];

		for(var i=0; i<templateIds.length; i++) {
			var template = this.findById(templateIds[i], templates);

			if(template) {
				deepExtend(rolledUpItem, template);
			}
		}
		deepExtend(rolledUpItem, item);

		return rolledUpItem;
	},

	findById: function(id, items) {
		for(var i=0; i<items.length; i++) {
			if(items[i].id === id) {
				return items[i];
			}
		}

		return null;
	},

	parseValue: function(value, variables, responseAsJson, testStep) {
		var parsedValue;

		if(_.isArray(value)) {
			parsedValue = [];
			for(var i=0; i<value.length; i++) {
				parsedValue.push(this.parseValue(value[i], variables, responseAsJson, testStep));
			}
		}
		else if(_.isObject(value)) {
			for(var prop in value) {
				if(prop.substr(0,1) === '$') {
					var action = actionFactory.getAction(prop, value[prop]);
					parsedValue = action.perform(responseAsJson, testStep, variables);
				}
			}

			//Send back the plain object if we didn't find any actions to perform
			if(!parsedValue) {
				parsedValue = {};
				for(var prop in value) {
					parsedValue[prop] = this.parseValue(value[prop], variables, responseAsJson, testStep);
				}
			}
		}
		else if(_.isString(value)) {
			parsedValue = this.performVariableSubstitution(value, variables);
		}
		else {
			parsedValue = value;
		}

		return parsedValue;
	},

	performVariableSubstitution: function(value, variables) {
		var retVal = value;
		
		if(_.isString(value)) {
			var pattern = /\$\{([.a-zA-Z0-9_-]+)\}/gi;
			var matches = value.match(pattern);
			if(matches && matches.length > 0) {
				for(var i=0; i<matches.length; i++) {
					var match = matches[i];
					var variableName = match.replace('${', '').replace('}', '');
					var variableValue = variables[variableName] || "";
					retVal = retVal.replace(match, variableValue);
				}
			}
		}

		return retVal;
	}
};