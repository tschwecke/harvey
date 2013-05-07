var _ = require('underscore');
 
module.exports = {

	areEqual: function(actualValue, expectedValue) {

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
					if(!this.areEqual(actualValue[propName], expectedValue[propName])) {
						equal = false;
					}
				}
				return equal;
			}
			
		}
		else
		{
			return actualValue == expectedValue;
		}
		
	}
};