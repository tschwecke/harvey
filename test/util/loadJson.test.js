var assert = require('assert'),
	path = require('path'),
	_ = require('underscore'),
	loadJson = require('../../lib/util/loadJson.js');

describe('loadJson', function() {

	it('should load a valid file', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/valid.json');

		//Act
		var result = loadJson(filePath);

		//Assert
		assert(result);
		assert.equal(result.foo, 'bar');
		done();
	});

	it('should throw exception for invalid file', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/invalid.json');

		//Act and Assert
		assert.throws(function() { loadJson(filePath); }, /Unable to load file/);
		done();
	});

	it('should throw exception for missing file', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/missing.json');

		//Act and Assert
		assert.throws(function() { loadJson(filePath); }, /Unable to find file/);
		done();
	});

	it('should load a valid file with comments', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/comments.json');

		//Act
		var result = loadJson(filePath);

		//Assert
		assert(result);
		assert.equal(result.foo, 'bar');
		done();
	});


	it('should return null if the file only contains comments and whitespace', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/onlyComments.json');

		//Act
		var result = loadJson(filePath);

		//Assert
		assert.equal(result, null);
		done();
	});

	it('should strip out top-level keys beginning with underscores', function(done) {
		//Arrange
		var filePath = path.join(__dirname, 'testFiles/underscores.json');

		//Act
		var result = loadJson(filePath);
		
		//Assert
		assert(result);
		assert.equal(result.foo, 'bar');
		assert(!result._foo);
		done();
	});

});
