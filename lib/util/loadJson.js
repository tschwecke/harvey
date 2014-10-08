var fs = require('fs');
var stripJsonComments = require('strip-json-comments');

module.exports = function(filename) {
	if(!fs.existsSync(filename)) {
		throw new Error("Unable to find file '" + filename + "'");
	}

	var fileContents = fs.readFileSync(filename, {"encoding": "utf8"});

	//Remove any comments from the file before trying to parse it
	fileContents = stripJsonComments(fileContents);

	//If there is nothing left after removing the comments, return null
	if(fileContents.trim() === '') {
		return null;
	}

	//Parse the contents as json
	try {
		var json = JSON.parse(fileContents);
	} catch (e) {
		throw new Error("Unable to load file '" + filename + "': " + e);
	}

	return json;
};