var _ = require('underscore');

module.exports = function(actualValue, comparisonValue) {
  if(actualValue && actualValue.indexOf) {
    return actualValue.indexOf(comparisonValue) > -1
  }

  return false;
};