var _ = require('underscore'),
	util = require('./util.js'),
	extractorFactory = require('../extractors/extractorFactory.js');
	comparatorFactory = require('../comparators/comparatorFactory.js');

module.exports = {

	/**
	 * Returns a result object that contains the 'match' property.
	 * 		The 'match' property will contain true/false depending
	 * 		on match pass or fail.
	 *
	 * { match: true }
	 *
	 *
	 * If a match is false, then the result object will also contain
	 * the 'diffs' property which will contain an array of
	 * match objects. The match objects will contain the properties:
	 *     - property (If a property exists)
     *     - actual
     *     - expected
     *
	 * {
	 *     match: false,
  	 *     diffs: [{
  	 *         property: 'prop1/$gt',
  	 *         actual: 5,
  	 *         expected: 6
  	 *     }]
  	 * }
  	 *
  	 * If the match is false, and is a result of an Array mismatch, then
  	 * the diffs object will look like the following:
	 *
  	 * {
	 *     match:false,
	 *     diffs:[{
	 *         property: "Array no-match",
	 *         indicies: [1,2]
	 *     }]
	 * }
  	 *
	 */
	areEqual: function(actualValue, expectedValue, variables) {

		if(_.isArray(expectedValue)) {
			if(!_.isArray(actualValue)) {
				return {
					match: false,
					diffs: [{property: 'Object Type', actual: toString.call(actualValue), expected: '[object Array]'}]
				}
			}
			else if(expectedValue.length !== actualValue.length) {
				return {
					match: false,
					diffs: [{property: 'Array length', actual: actualValue.length, expected: expectedValue.length}]
				}
			}
			else {
				//We need to do a member by member comparison of the array
				//First, copy the expectedValue array so that we can remove members from it as matches are found
				//without changing the original array
				var actualValues = actualValue.slice(0);
				var equal = true;
				var indicies = [];
				for(var i=0; i<expectedValue.length; i++) {
					var foundMatch = false;
					for(var j=0; j<actualValues.length; j++) {
						var result = this.areEqual(actualValues[j], expectedValue[i], variables);
						if (result.match === true) {
							actualValues.splice(j, 1);
							foundMatch = true;
							break;
						}
					}

					if(!foundMatch) {
						equal=false;
						indicies.push(i);
					}
				}

				var result = { match: equal };
				if (!equal) {
					result.diffs = [{property: 'Array no-match', indicies: indicies}];
				}

				return result;
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
				var diffs = [];
				for(var propName in expectedValue) {
					var comparisonValue = expectedValue[propName];
					comparisonValue = util.performVariableSubstitution(comparisonValue, variables);
					var comparator = comparatorFactory.getComparatorFunction(propName);

					if(comparator) {
						var match = comparator(actualValue, comparisonValue);
						if (!match) {
							diffs.push({property: propName, actual: actualValue, expected: comparisonValue});
						}
						equal = match ? equal : false;
					}
					else {
						//If we couldn't find an comparator by that name, check for an extractor
						var extractor = extractorFactory.getExtractorFunction(propName);
						if(extractor) {
							var extractedValue = extractor(actualValue);
							var resultFromExtractedValue = this.areEqual(extractedValue, expectedValue[propName], variables);
							equal = resultFromExtractedValue.match;
							diffs = resultFromExtractedValue.diffs;
						}
						else {
							throw new Error('Unable to find a comparator or extractor implementation for \'' + propName + '\'');
						}
					}
				}
				var result = {match: equal};
				if (!equal) {
					result.diffs = diffs;
				}
				return result;
			}
			else {
				//We need to do a property by property comparison
				var equal = true;
				var diffs = [];
				for(var propName in expectedValue) {
					var result = this.areEqual(actualValue[propName], expectedValue[propName], variables);
					if(!result.match) {
						equal = false;
						_.forEach(result.diffs, function(diff) {
							if (diff.hasOwnProperty('property')) {
								diff.property = propName + '/' + diff.property;
							} else {
								diff.property = propName;
							}
							diffs.push(diff);
						});
						break;
					}
				}
				var result = {match: equal};
				if (!equal) {
					result.diffs = diffs;
				}
				return result;
			}

		}
		else
		{
			var comparisonValue = util.performVariableSubstitution(expectedValue, variables);
			var result = {
				match: (actualValue === comparisonValue)
			};

			if (result.match === false) {
				result.diffs = [{actual: actualValue, expected: comparisonValue}];
			}

			return result;
		}

	}
};