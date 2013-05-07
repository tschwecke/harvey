var jsbeautify = require('js-beautify').js_beautify;

module.exports = {
	
	reportResults: function(results) {
		console.log(jsbeautify(JSON.stringify(results)));
	}
};