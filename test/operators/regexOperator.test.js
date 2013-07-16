var assert = require('assert'),
	comparer = require('../../lib/operators/regexOperator.js');

describe('regexOperator', function() {
	it('should return true for matching values', function(done) {
		//Arrange
		var actualValue = "test123";
		var expectedValue = "^test\\d+$";

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(result);
		done();
	});

	it('should return false for non-matching values', function(done) {
		//Arrange
		var actualValue = "test123test";
		var expectedValue = "^test\\d+$";

		//Act
		var result = comparer(actualValue, expectedValue);

		//Assert
		assert(!result);
		done();
	});

}); 
