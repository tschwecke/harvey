var assert = require('assert'),
	comparer = require('../../lib/operators/neOperator.js');

describe('neOperator', function() {
	it('should return true for different values', function(done) {
		//Arrange
		var actualValue = "testString";
		var expectedValue = "differentString";

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for equal values', function(done) {
		//Arrange
		var actualValue = "testString";
		var expectedValue = "testString";

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});
}); 
