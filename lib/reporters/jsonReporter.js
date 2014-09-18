var jsbeautify = require('js-beautify').js_beautify;

module.exports = {
	
	reportResults: function(results, config, outputStream, callback) {
		outputStream.write(jsbeautify(JSON.stringify(results)));
		callback();
	}
};