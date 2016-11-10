var _ = require('underscore');

module.exports = function(actionInfo, variables, parseValueFn) {
	var valueToConvert = parseValueFn(actionInfo.value);
	var convertedValue = null;

  switch(actionInfo.to) {
    case 'string':
      convertedValue = String(valueToConvert);
      break;
    case 'number':
      convertedValue = parseInt(valueToConvert, 10);
      break;
    case 'date':
      convertedValue = new Date(valueToConvert);
      break;
  }

	return convertedValue;
};
