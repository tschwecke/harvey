var jsbeautify = require('js-beautify').js_beautify;

module.exports = {
	
	reportResults: function(results, config, callback) {
		console.log(jsbeautify(JSON.stringify(results)));
		callback();
	}
};