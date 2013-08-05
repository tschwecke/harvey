var _ = require('underscore');
var fs = require('fs');

var layoutTemplate = fs.readFileSync(__dirname + '/templates/layout', 'utf8');

layoutTemplate = _.template(layoutTemplate);

module.exports = {

	reportResults: function(results, config, callback) {
		console.log(layoutTemplate(results));
		callback();
	}
};