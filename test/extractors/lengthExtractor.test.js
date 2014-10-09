var assert = require('assert'),
	_ = require('underscore'),
	lengthExtractor = require('../../lib/extractors/lengthExtractor.js');

describe('lengthExtractor', function() {

	describe('constructor()', function() {

		it('should return a function', function(done) {

			//Act
			var extractor = require('../../lib/extractors/lengthExtractor.js');

			//Assert
			assert(extractor);
			assert(_.isFunction(extractor));

			done();
		});
	});


	it('should return the length of a string', function(done) {

		//Arrange
		var testString = "abcde";

		//Act
		var length = lengthExtractor(testString);

		//Assert
		assert.equal(length, 5);
		done();
	});

	it('should return the length of an array', function(done) {

		//Arrange
		var testArray = ['a', 'b', 'c', 'd'];

		//Act
		var length = lengthExtractor(testArray);

		//Assert
		assert.equal(length, 4);
		done();
	});

	it('should return zero for anything other than a string or array', function(done) {

		//Arrange
		var testValue = 123;

		//Act
		var length = lengthExtractor(testValue);

		//Assert
		assert.equal(length, 0);
		done();
	});


});
