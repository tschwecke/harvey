var assert = require('assert'),
	comparer = require('../../lib/operators/lengthOperator.js');

describe('lengthOperator', function() {
	it('should return true for matching array length', function(done) {
		//Arrange
		var actualValue = [1, 2, 3];
		var expectedValue = 3;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for non-matching array length', function(done) {
		//Arrange
		var actualValue = [1, 2, 3];
		var expectedValue = 4;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

	it('should return true for matching string length', function(done) {
		//Arrange
		var actualValue = "test";
		var expectedValue = 4;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for non-matching string length', function(done) {
		//Arrange
		var actualValue = "test";
		var expectedValue = 5;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

});
 
