
module.exports = {

	getExtractorFunction: function(extractorName) {
		//Strip out any dollar sign from the name of the extractor
		extractorName = extractorName.replace('$', '');
		var extractor = null;

		try {
			extractor = require('./' + extractorName + 'Extractor.js');
		}
		catch(error) {
			//Don't need to do anything here, just need to return null
		}

		return extractor;
	}

}; 
