var fs = require('fs');
var stripJsonComments = require('strip-json-comments');
var fileCache = {};

module.exports = function(filename) {
	if(!fs.existsSync(filename)) {
		throw new Error("Unable to find file '" + filename + "'");
	}

	//To avoid reading the same file in many times, let's check the cache
	//to see if we've already read and parsed it
	if(fileCache[filename]) {
		return fileCache[filename];
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

	//Save the json in cache
	fileCache[filename] = json;

	return json;
};