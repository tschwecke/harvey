var _ = require('underscore'),
	util = require('./util.js');
 
module.exports = {

	areEqual: function(actualValue, expectedValue, variables) {

		if(_.isObject(expectedValue)) {
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