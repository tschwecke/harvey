var assert = require('assert'),
	comparer = require('../../lib/comparators/containsComparator.js');

describe('containsComparator', function() {
	it('should return true for array matching values', function(done) {
		//Arrange
		var actualValue = [1,2,3];
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for array non-matching values', function(done) {
		//Arrange
		var actualValue = [1,2,3];
		var expectedValue = 4;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

	it('should return true for string- matching values', function(done) {
		//Arrange
		var actualValue = "123";
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for string non-matching values', function(done) {
		//Arrange
		var actualValue = "123";
		var expectedValue = 4;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

	it('should return false for unexpected type', function(done) {
		//Arrange
		var actualValue = {};
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});
}); 
