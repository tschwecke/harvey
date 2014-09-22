var _ = require('underscore');
var fs = require('fs');

module.exports = {

	reportResults: function(results, config, outputStream, callback) {

		var layoutTemplate;

		try {
			layoutTemplate = fs.readFileSync(__dirname + '/templates/layout', 'utf8');
			layoutTemplate = _.template(layoutTemplate);
		}
		catch (ex) {
			outputStream.write('Error loading/parsing html reporter template\n');
			throw ex;
		}

		outputStream.write(layoutTemplate(results));
		callback();
	}
};