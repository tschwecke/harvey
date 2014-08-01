
module.exports = function(actualValue, comparisonValue) {
	var regex = new RegExp(comparisonValue);
	return regex.test(actualValue);
};
 
