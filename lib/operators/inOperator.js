var _ = require('underscore');

module.exports = function(actualValue, comparisonValue) {
	return _.contains(comparisonValue, actualValue);
};