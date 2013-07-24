
module.exports = {

	getOperatorFunction: function(operatorName) {
		//Strip out any dollar sign from the name of the operator
		operatorName = operatorName.replace('$', '');
		var operator = require('./' + operatorName + 'Operator.js');

		return operator;
	}

}; 
