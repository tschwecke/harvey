var assert = require('assert'),
	comparer = require('../../lib/operators/gteOperator.js');

describe('gteOperator', function() {
	it('should return true for values that are greater than the expected', function(done) {
		//Arrange
		var actualValue = 3;
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return true for values that are equal to the expected', function(done) {
		//Arrange
		var actualValue = 2;
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for values that are less than the expected', function(done) {
		//Arrange
		var actualValue = 1;
		var expectedValue = 2;

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});
}); 
