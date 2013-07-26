
module.exports = {

	getOperatorFunction: function(operatorName) {
		//Strip out any dollar sign from the name of the operator
		operatorName = operatorName.replace('$', '');

		try {
			var operator = require('./' + operatorName + 'Operator.js');
		}
		catch(error) {
			throw new Error('Unable to find an implementation for operator \'' + operatorName + '\'');
		}

		return operator;
	}

}; 
