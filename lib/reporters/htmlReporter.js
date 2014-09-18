var _ = require('underscore');
var fs = require('fs');

var layoutTemplate;

try {
	layoutTemplate = fs.readFileSync(__dirname + '/templates/layout', 'utf8');
	layoutTemplate = _.template(layoutTemplate);
}
catch (ex) {
	console.log('Error loading/parsing html reporter template');
	throw ex;
}

module.exports = {

	reportResults: function(results, config, outputStream, callback) {
		outputStream.write(layoutTemplate(results));
		callback();
	}
};