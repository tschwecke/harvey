
module.exports = {

	getComparatorFunction: function(comparatorName) {
		//Strip out any dollar sign from the name of the comparator
		comparatorName = comparatorName.replace('$', '');
		var comparator = null;
		
		try {
			comparator = require('./' + comparatorName + 'Comparator.js');
		}
		catch(error) {
			//Don't need to do anything here, just need to return null
		}

		return comparator;
	}

}; 
