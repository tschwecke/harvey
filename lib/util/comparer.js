var _ = require('underscore'),
	util = require('./util.js');
 
module.exports = {

	areEqual: function(actualValue, expectedValue, variables) {

		if(_.isArray(expectedValue)) {
			if(!_.isArray(actualValue)) {
				return false;
			}
			else if(expectedValue.length !== actualValue.length) {
				return false;
			}
			else {
				//We need to do a member by member comparison of the array
				//First, copy the expectedValue array so that we can remove members from it as matches are found
				//without changing the original array
				var expectedValues = expectedValue.slice(0);
				var equal = true;
				for(var i=0; i<actualValue.length; i++) {
					var foundMatch = false;
					for(var j=0; j<expectedValues.length; j++) {
						if(this.areEqual(actualValue[i], expectedValues[j], variables)) {
							expectedValues.splice(j, 1);
							foundMatch = true;
							break;
						}
					}

					if(!foundMatch) {
						equal=false;
						break;
					}
				}
				return equal;
			}
		}
		else if(_.isObject(expectedValue)) {
			var containsComparisonFunction = false;

			for(var propName in expectedValue) {
				if(propName.substr(0,1) === '$') {
					containsComparisonFunction = true;
					break;
				}
			}

			if(containsComparisonFunction) {
				var equal = true;
				for(var propName in expectedValue) {
					var comparisonValue = expectedValue[propName];
					comparisonValue = util.performVariableSubstitution(comparisonValue, variables);
					switch(propName) {
						case '$lt':
							equal = (actualValue < comparisonValue) ? equal : false;
							break;
							
						case '$lte':
							equal = (actualValue <= comparisonValue) ? equal : false;
							break;
							
						case '$gt':
							equal = (actualValue > comparisonValue) ? equal : false;
							break;
							
						case '$gte':
							equal = (actualValue >= comparisonValue) ? equal : false;
							break;
							
						case '$ne':
							equal = (actualValue != comparisonValue) ? equal : false;
							break;
							
						case '$regex':
							var regex = new RegExp(comparisonValue);
							equal = regex.test(actualValue) ? equal : false;
							break;

						case '$in':
							equal = _.contains(comparisonValue, actualValue) ? equal : false;
							break;

						case '$exists':
							if((actualValue === undefined && comparisonValue === true)
								|| (actualValue !== undefined && comparisonValue === false)) {
								equal = false;
							}
							break;

						default:
							equal = false;
							break;
					}
				}
				return equal;
			}
			else {
				//We need to do a property by property comparison
				var equal = true;
				for(var propName in expectedValue) {
					if(!this.areEqual(actualValue[propName], expectedValue[propName], variables)) {
						equal = false;
						break;
					}
				}
				return equal;
			}
			
		}
		else
		{
			var comparisonValue = util.performVariableSubstitution(expectedValue, variables);
			return actualValue == comparisonValue;
		}
		
	}
};