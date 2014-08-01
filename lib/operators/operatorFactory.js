
module.exports = {

	getOperatorFunction: function(operatorName) {
		//Strip out any dollar sign from the name of the operator
		operatorName = operatorName.replace('$', '');
		var operator = null;
		
		try {
			operator = require('./' + operatorName + 'Operator.js');
		}
		catch(error) {
			//Don't need to do anything here, just need to return null
		}

		return operator;
	}

}; 
