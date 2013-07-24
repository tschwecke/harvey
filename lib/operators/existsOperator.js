
module.exports = function(actualValue, comparisonValue) {
	return ((actualValue === undefined && comparisonValue === false)
			|| (actualValue !== undefined && comparisonValue === true));
}; 
