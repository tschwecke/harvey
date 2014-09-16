var fs = require('fs');
var stripJsonComments = require('strip-json-comments');

module.exports = function(filename) {
	if(!fs.existsSync(filename)) {
		throw new Error("Unable to find file '" + filename + "'");
	}

	var fileContents = fs.readFileSync(filename, {"encoding": "utf8"});

	try {
		var json = JSON.parse(stripJsonComments(fileContents));
	} catch (e) {
		throw new Error("Unable to load file '" + filename + "': " + e);
	}

	return json;
};